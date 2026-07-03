import { GraphQLError } from "graphql";
import { User } from "../../models/User";
import { Wallet } from "../../models/Wallet";
import { signToken } from "../../utils/jwt";
import { requireAuth } from "../../middleware/permissions";
import { ROLES } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      return User.findById(ctx.user.id);
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { input }: { input: { firstName: string; lastName: string; email: string; phone?: string; password: string; role?: string } }
    ) => {
      const existing = await User.findOne({ email: input.email.toLowerCase() });
      if (existing) {
        throw new GraphQLError("An account with this email already exists.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const user = await User.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        passwordHash: input.password, // hashed by the pre-save hook
        role: input.role ?? ROLES.CUSTOMER,
      });

      await Wallet.create({ owner: user._id });

      const token = signToken({ id: user.id, role: user.role, email: user.email });
      return { token, user };
    },

    login: async (_: unknown, { input }: { input: { email: string; password: string } }) => {
      const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");
      if (!user) {
        throw new GraphQLError("Invalid email or password.", { extensions: { code: "UNAUTHENTICATED" } });
      }

      const valid = await user.comparePassword(input.password);
      if (!valid) {
        throw new GraphQLError("Invalid email or password.", { extensions: { code: "UNAUTHENTICATED" } });
      }

      if (user.isSuspended) {
        throw new GraphQLError("This account has been suspended.", { extensions: { code: "FORBIDDEN" } });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = signToken({ id: user.id, role: user.role, email: user.email });
      return { token, user };
    },

    updateProfile: async (
      _: unknown,
      { input }: { input: Partial<{ firstName: string; lastName: string; phone: string; avatarUrl: string }> },
      ctx: GraphQLContext
    ) => {
      const authUser = requireAuth(ctx);
      const user = await User.findByIdAndUpdate(authUser.id, input, { new: true });
      if (!user) throw new GraphQLError("User not found.", { extensions: { code: "NOT_FOUND" } });
      return user;
    },
  },
};
