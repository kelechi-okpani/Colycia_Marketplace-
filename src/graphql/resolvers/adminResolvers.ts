import { GraphQLError } from "graphql";
import { User } from "../../models/User";
import { Provider } from "../../models/Provider";
import { Listing } from "../../models/listings/Listing";
import { Booking } from "../../models/Booking";
import { requireRole } from "../../middleware/permissions";
import { ROLES, BOOKING_STATUS } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";

export const adminResolvers = {
  Query: {
    platformStats: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRole(ctx, ROLES.ADMIN);

      const [totalUsers, totalProviders, totalListings, completedBookings] = await Promise.all([
        User.countDocuments(),
        Provider.countDocuments(),
        Listing.countDocuments(),
        Booking.find({ status: BOOKING_STATUS.COMPLETED }),
      ]);

      const totalGMV = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalCommissionEarned = completedBookings.reduce((sum, b) => sum + b.commissionAmount, 0);

      return {
        totalUsers,
        totalProviders,
        totalListings,
        totalBookings: completedBookings.length,
        totalGMV,
        totalCommissionEarned,
      };
    },

    pendingVerifications: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRole(ctx, ROLES.ADMIN);
      return Provider.find({ "verification.status": "PENDING" });
    },

    disputedBookings: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRole(ctx, ROLES.ADMIN);
      return Booking.find({ status: BOOKING_STATUS.DISPUTED });
    },
  },

  Mutation: {
    suspendUser: async (_: unknown, { userId, reason }: { userId: string; reason: string }, ctx: GraphQLContext) => {
      requireRole(ctx, ROLES.ADMIN);
      const user = await User.findByIdAndUpdate(userId, { isSuspended: true }, { new: true });
      if (!user) throw new GraphQLError("User not found.", { extensions: { code: "NOT_FOUND" } });
      void reason; // persisted via an admin audit log in a full implementation
      return user;
    },

    reinstateUser: async (_: unknown, { userId }: { userId: string }, ctx: GraphQLContext) => {
      requireRole(ctx, ROLES.ADMIN);
      const user = await User.findByIdAndUpdate(userId, { isSuspended: false }, { new: true });
      if (!user) throw new GraphQLError("User not found.", { extensions: { code: "NOT_FOUND" } });
      return user;
    },
  },
};
