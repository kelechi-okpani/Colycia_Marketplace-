import { GraphQLError } from "graphql";
import { User } from "../../models/User";
import { Provider } from "../../models/Provider";
import { Listing } from "../../models/listings/Listing";
import { Booking } from "../../models/Booking";
import { Transaction } from "../../models/Transaction";
import { FlightBooking } from "../../models/flightbooking";
import { AuditLog } from "../../models/auditlog";
import { requireRole } from "../../middleware/permissions";
import { ROLES, BOOKING_STATUS, Role, ProviderCategory, BookingStatus, ListingStatus } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";

function paginate(page = 1, pageSize = 20) {
  return { skip: (page - 1) * pageSize, limit: pageSize };
}

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

    allUsers: async (
      _: unknown,
      { role, isSuspended, page, pageSize }: { role?: Role; isSuspended?: boolean; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const filter: Record<string, unknown> = {};
      if (role) filter.role = role;
      if (isSuspended !== undefined) filter.isSuspended = isSuspended;

      const { skip, limit } = paginate(page, pageSize);
      return User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    },

    allProviders: async (
      _: unknown,
      {
        category,
        verificationStatus,
        page,
        pageSize,
      }: { category?: ProviderCategory; verificationStatus?: string; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const filter: Record<string, unknown> = {};
      if (category) filter.category = category;
      if (verificationStatus) filter["verification.status"] = verificationStatus;

      const { skip, limit } = paginate(page, pageSize);
      return Provider.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    },

    allListings: async (
      _: unknown,
      { category, status, page, pageSize }: { category?: ProviderCategory; status?: ListingStatus; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const filter: Record<string, unknown> = {};
      if (category) filter.category = category;
      if (status) filter.status = status;

      const { skip, limit } = paginate(page, pageSize);
      return Listing.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    },

    allBookings: async (
      _: unknown,
      { status, category, page, pageSize }: { status?: BookingStatus; category?: ProviderCategory; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const filter: Record<string, unknown> = {};
      if (status) filter.status = status;
      if (category) filter.category = category;

      const { skip, limit } = paginate(page, pageSize);
      return Booking.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    },

    allTransactions: async (
      _: unknown,
      { type, status, page, pageSize }: { type?: string; status?: string; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const filter: Record<string, unknown> = {};
      if (type) filter.type = type;
      if (status) filter.status = status;

      const { skip, limit } = paginate(page, pageSize);
      return Transaction.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    },

    allFlightBookings: async (
      _: unknown,
      { page, pageSize }: { page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const { skip, limit } = paginate(page, pageSize);
      return FlightBooking.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    },

    auditLogs: async (
      _: unknown,
      { targetType, page, pageSize }: { targetType?: string; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const filter: Record<string, unknown> = {};
      if (targetType) filter.targetType = targetType;

      const { skip, limit } = paginate(page, pageSize);
      return AuditLog.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    suspendUser: async (_: unknown, { userId, reason }: { userId: string; reason: string }, ctx: GraphQLContext) => {
      const admin = requireRole(ctx, ROLES.ADMIN);
      const user = await User.findByIdAndUpdate(userId, { isSuspended: true }, { new: true });
      if (!user) throw new GraphQLError("User not found.", { extensions: { code: "NOT_FOUND" } });

      await AuditLog.create({ admin: admin.id, action: "SUSPEND_USER", targetType: "User", targetId: userId, reason });

      return user;
    },

    reinstateUser: async (_: unknown, { userId }: { userId: string }, ctx: GraphQLContext) => {
      const admin = requireRole(ctx, ROLES.ADMIN);
      const user = await User.findByIdAndUpdate(userId, { isSuspended: false }, { new: true });
      if (!user) throw new GraphQLError("User not found.", { extensions: { code: "NOT_FOUND" } });

      await AuditLog.create({ admin: admin.id, action: "REINSTATE_USER", targetType: "User", targetId: userId });

      return user;
    },
  },

  AuditLogEntry: {
    admin: (parent: { admin: string }) => User.findById(parent.admin),
  },
};