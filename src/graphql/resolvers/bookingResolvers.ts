import { GraphQLError } from "graphql";
import { Booking } from "../../models/Booking";
import { Listing } from "../../models/listings/Listing";
import { Provider } from "../../models/Provider";
import { User } from "../../models/User";
import { requireAuth, requireRole } from "../../middleware/permissions";
import { computeBookingPrice } from "../../utils/pricing";
import { sendNotification } from "../../services/notificationService";
import { ROLES, BOOKING_STATUS, BookingStatus } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";

interface CreateBookingInput {
  listingId: string;
  selection: Record<string, unknown>;
  scheduledStart?: string;
  scheduledEnd?: string;
  quantity?: number;
  unitPrice: number;
}

export const bookingResolvers = {
  Query: {
    booking: (_: unknown, { id }: { id: string }) => Booking.findById(id),

    myBookingsAsCustomer: async (
      _: unknown,
      { status, page = 1, pageSize = 20 }: { status?: BookingStatus; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const filter: Record<string, unknown> = { customer: user.id };
      if (status) filter.status = status;
      return Booking.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });
    },

    myBookingsAsProvider: async (
      _: unknown,
      { status, page = 1, pageSize = 20 }: { status?: BookingStatus; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const user = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOne({ user: user.id });
      if (!provider) return [];

      const filter: Record<string, unknown> = { provider: provider._id };
      if (status) filter.status = status;
      return Booking.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });
    },
  },

  Mutation: {
    createBooking: async (_: unknown, { input }: { input: CreateBookingInput }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);

      const listing = await Listing.findById(input.listingId);
      if (!listing) throw new GraphQLError("Listing not found.", { extensions: { code: "NOT_FOUND" } });
      if (listing.status !== "ACTIVE") {
        throw new GraphQLError("This listing is not currently bookable.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const provider = await Provider.findById(listing.provider);
      if (!provider) throw new GraphQLError("Provider not found.", { extensions: { code: "NOT_FOUND" } });

      const quantity = input.quantity ?? 1;
      const price = computeBookingPrice(input.unitPrice, quantity, provider.commissionRate);

      const booking = await Booking.create({
        customer: user.id,
        provider: provider._id,
        listing: listing._id,
        category: listing.category,
        selection: input.selection,
        scheduledStart: input.scheduledStart,
        scheduledEnd: input.scheduledEnd,
        ...price,
        currency: listing.currency,
      });

      await sendNotification({
        userId: provider.user,
        title: "New booking request",
        body: `You have a new booking request for "${listing.title}".`,
        relatedBooking: booking._id,
      });

      return booking;
    },

    confirmBooking: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      transitionBooking(id, ctx, ROLES.PROVIDER, [BOOKING_STATUS.PENDING], BOOKING_STATUS.CONFIRMED),

    startBooking: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      transitionBooking(id, ctx, ROLES.PROVIDER, [BOOKING_STATUS.CONFIRMED], BOOKING_STATUS.IN_PROGRESS),

    completeBooking: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      transitionBooking(id, ctx, ROLES.PROVIDER, [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CONFIRMED], BOOKING_STATUS.COMPLETED),

    cancelBooking: async (_: unknown, { id, reason }: { id: string; reason: string }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const booking = await Booking.findById(id);
      if (!booking) throw new GraphQLError("Booking not found.", { extensions: { code: "NOT_FOUND" } });

      const isCustomer = String(booking.customer) === user.id;
      const isProvider = user.role === ROLES.PROVIDER;
      if (!isCustomer && !isProvider && user.role !== ROLES.ADMIN) {
        throw new GraphQLError("You cannot cancel this booking.", { extensions: { code: "FORBIDDEN" } });
      }

      booking.status = BOOKING_STATUS.CANCELLED;
      booking.cancellationReason = reason;
      booking.cancelledBy = user.id as any;
      await booking.save();
      return booking;
    },

    disputeBooking: async (_: unknown, { id, reason }: { id: string; reason: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      const booking = await Booking.findById(id);
      if (!booking) throw new GraphQLError("Booking not found.", { extensions: { code: "NOT_FOUND" } });

      booking.status = BOOKING_STATUS.DISPUTED;
      booking.disputeReason = reason;
      await booking.save();

      return booking;
    },

    resolveDispute: async (
      _: unknown,
      { id, resolution }: { id: string; resolution: BookingStatus },
      ctx: GraphQLContext
    ) => {
      const admin = requireRole(ctx, ROLES.ADMIN);
      const booking = await Booking.findById(id);
      if (!booking) throw new GraphQLError("Booking not found.", { extensions: { code: "NOT_FOUND" } });

      booking.status = resolution;
      booking.disputeResolvedBy = admin.id as any;
      await booking.save();
      return booking;
    },
  },

  Booking: {
    customer: (parent: { customer: string }) => User.findById(parent.customer),
    provider: (parent: { provider: string }) => Provider.findById(parent.provider),
    listing: (parent: { listing: string }) => Listing.findById(parent.listing),
  },
};

// Shared status-transition guard used by confirm/start/complete so the
// allowed-previous-states rule lives in one place.
async function transitionBooking(
  id: string,
  ctx: GraphQLContext,
  requiredRole: typeof ROLES.PROVIDER,
  allowedFrom: BookingStatus[],
  next: BookingStatus
) {
  const user = requireRole(ctx, requiredRole, ROLES.ADMIN);
  const booking = await Booking.findById(id);
  if (!booking) throw new GraphQLError("Booking not found.", { extensions: { code: "NOT_FOUND" } });

  if (user.role === ROLES.PROVIDER) {
    const provider = await Provider.findOne({ user: user.id });
    if (!provider || String(booking.provider) !== String(provider._id)) {
      throw new GraphQLError("You do not manage this booking.", { extensions: { code: "FORBIDDEN" } });
    }
  }

  if (!allowedFrom.includes(booking.status)) {
    throw new GraphQLError(`Booking must be in one of [${allowedFrom.join(", ")}] to do this.`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  booking.status = next;
  await booking.save();

  if (next === BOOKING_STATUS.COMPLETED) {
    await sendNotification({
      userId: booking.customer,
      title: "Booking completed",
      body: "Your booking is complete. Leave a review to help other customers!",
      relatedBooking: booking._id,
    });
  }

  return booking;
}
