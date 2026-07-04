import { GraphQLError } from "graphql";
import { Provider } from "../../models/Provider";
import { User } from "../../models/User";
import { requireAuth, requireRole } from "../../middleware/permissions";
import { ROLES, VERIFICATION_STATUS, ProviderCategory } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";

interface LocationInput {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export const providerResolvers = {
  Query: {
    provider: (_: unknown, { id }: { id: string }) => Provider.findById(id),

    myProviderProfile: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireRole(ctx, ROLES.PROVIDER, ROLES.ADMIN);
      return Provider.findOne({ user: user.id });
    },

    providers: (
      _: unknown,
      { category, city, page = 1, pageSize = 20 }: { category?: ProviderCategory; city?: string; page?: number; pageSize?: number }
    ) => {
      const filter: Record<string, unknown> = { isSuspended: false };
      if (category) filter.category = category;
      if (city) filter["location.city"] = new RegExp(`^${city}$`, "i");

      return Provider.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ ratingAverage: -1 });
    },
  },

  Mutation: {
    createProviderProfile: async (
      _: unknown,
      { input }: { input: { category: ProviderCategory; businessName: string; bio?: string; location?: LocationInput } },
      ctx: GraphQLContext
    ) => {
      const authUser = requireAuth(ctx);

      const existing = await Provider.findOne({ user: authUser.id });
      if (existing) {
        throw new GraphQLError("You already have a provider profile.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const provider = await Provider.create({
        user: authUser.id,
        category: input.category,
        businessName: input.businessName,
        bio: input.bio,
        location: input.location,
      });

      await User.findByIdAndUpdate(authUser.id, { role: ROLES.PROVIDER, providerProfile: provider._id });

      return provider;
    },

    updateProviderProfile: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: GraphQLContext
    ) => {
      const authUser = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOneAndUpdate({ user: authUser.id }, input, { new: true });
      if (!provider) throw new GraphQLError("Provider profile not found.", { extensions: { code: "NOT_FOUND" } });
      return provider;
    },

    uploadVerificationDocument: async (
      _: unknown,
      { input }: { input: { type: string; url: string } },
      ctx: GraphQLContext
    ) => {
      const authUser = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOneAndUpdate(
        { user: authUser.id },
        {
          $push: { "verification.documents": { type: input.type, url: input.url, uploadedAt: new Date() } },
          $set: { "verification.status": VERIFICATION_STATUS.PENDING },
        },
        { new: true }
      );
      if (!provider) throw new GraphQLError("Provider profile not found.", { extensions: { code: "NOT_FOUND" } });
      return provider;
    },

    updatePayoutDetails: async (
      _: unknown,
      { input }: { input: { accountNumber: string; bankCode: string; accountName: string } },
      ctx: GraphQLContext
    ) => {
      const authUser = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOneAndUpdate(
        { user: authUser.id },
        { payoutDetails: input }, // recipientCode is cached separately once Paystack recipient creation is wired in
        { new: true }
      );
      if (!provider) throw new GraphQLError("Provider profile not found.", { extensions: { code: "NOT_FOUND" } });
      return provider;
    },

    reviewProviderVerification: async (
      _: unknown,
      { providerId, approve, rejectionReason }: { providerId: string; approve: boolean; rejectionReason?: string },
      ctx: GraphQLContext
    ) => {
      const admin = requireRole(ctx, ROLES.ADMIN);
      const provider = await Provider.findByIdAndUpdate(
        providerId,
        {
          "verification.status": approve ? VERIFICATION_STATUS.VERIFIED : VERIFICATION_STATUS.REJECTED,
          "verification.reviewedBy": admin.id,
          "verification.reviewedAt": new Date(),
          "verification.rejectionReason": approve ? undefined : rejectionReason,
        },
        { new: true }
      );
      if (!provider) throw new GraphQLError("Provider not found.", { extensions: { code: "NOT_FOUND" } });
      return provider;
    },

    suspendProvider: async (
      _: unknown,
      { providerId, reason }: { providerId: string; reason: string },
      ctx: GraphQLContext
    ) => {
      requireRole(ctx, ROLES.ADMIN);
      const provider = await Provider.findByIdAndUpdate(
        providerId,
        { isSuspended: true, suspensionReason: reason },
        { new: true }
      );
      if (!provider) throw new GraphQLError("Provider not found.", { extensions: { code: "NOT_FOUND" } });
      return provider;
    },
  },

  Provider: {
    user: (parent: { user: string }) => User.findById(parent.user),
  },
};