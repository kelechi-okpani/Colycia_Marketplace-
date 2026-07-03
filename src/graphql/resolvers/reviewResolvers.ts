import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { Review } from "../../models/Review";
import { Booking } from "../../models/Booking";
import { Listing } from "../../models/listings/Listing";
import { Provider } from "../../models/Provider";
import { requireAuth, requireRole } from "../../middleware/permissions";
import { BOOKING_STATUS, ROLES } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";

export const reviewResolvers = {
  Query: {
    listingReviews: (
      _: unknown,
      { listingId, page = 1, pageSize = 20 }: { listingId: string; page?: number; pageSize?: number }
    ) =>
      Review.find({ listing: listingId, isHidden: false })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 }),

    providerReviews: (
      _: unknown,
      { providerId, page = 1, pageSize = 20 }: { providerId: string; page?: number; pageSize?: number }
    ) =>
      Review.find({ provider: providerId, isHidden: false })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
  },

  Mutation: {
    createReview: async (
      _: unknown,
      { input }: { input: { bookingId: string; rating: number; comment?: string } },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);

      const booking = await Booking.findById(input.bookingId);
      if (!booking) throw new GraphQLError("Booking not found.", { extensions: { code: "NOT_FOUND" } });
      if (String(booking.customer) !== user.id) {
        throw new GraphQLError("You can only review your own bookings.", { extensions: { code: "FORBIDDEN" } });
      }
      if (booking.status !== BOOKING_STATUS.COMPLETED) {
        throw new GraphQLError("You can only review completed bookings.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const existing = await Review.findOne({ booking: booking._id });
      if (existing) {
        throw new GraphQLError("This booking has already been reviewed.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const review = await Review.create({
        booking: booking._id,
        listing: booking.listing,
        provider: booking.provider,
        author: user.id,
        rating: input.rating,
        comment: input.comment,
      });

      await recalculateRatings(String(booking.listing), String(booking.provider));

      return review;
    },

    replyToReview: async (_: unknown, { reviewId, reply }: { reviewId: string; reply: string }, ctx: GraphQLContext) => {
      const user = requireRole(ctx, ROLES.PROVIDER);
      const review = await Review.findById(reviewId);
      if (!review) throw new GraphQLError("Review not found.", { extensions: { code: "NOT_FOUND" } });

      const provider = await Provider.findOne({ user: user.id });
      if (!provider || String(review.provider) !== String(provider._id)) {
        throw new GraphQLError("You cannot reply to this review.", { extensions: { code: "FORBIDDEN" } });
      }

      review.providerReply = reply;
      await review.save();
      return review;
    },

    hideReview: async (_: unknown, { reviewId }: { reviewId: string }, ctx: GraphQLContext) => {
      requireRole(ctx, ROLES.ADMIN);
      const review = await Review.findByIdAndUpdate(reviewId, { isHidden: true }, { new: true });
      if (!review) throw new GraphQLError("Review not found.", { extensions: { code: "NOT_FOUND" } });
      return review;
    },
  },
};

// Recomputes and stores rolling averages so reads stay O(1) — recalculated
// on the rarer write path (a new review) rather than aggregated on every read.
async function recalculateRatings(listingId: string, providerId: string) {
  const [listingAgg] = await Review.aggregate([
    { $match: { listing: new Types.ObjectId(listingId), isHidden: false } },
    { $group: { _id: "$listing", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const [providerAgg] = await Review.aggregate([
    { $match: { provider: new Types.ObjectId(providerId), isHidden: false } },
    { $group: { _id: "$provider", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (listingAgg) {
    await Listing.findByIdAndUpdate(listingId, {
      ratingAverage: Math.round(listingAgg.avg * 10) / 10,
      ratingCount: listingAgg.count,
    });
  }
  if (providerAgg) {
    await Provider.findByIdAndUpdate(providerId, {
      ratingAverage: Math.round(providerAgg.avg * 10) / 10,
      ratingCount: providerAgg.count,
    });
  }
}
