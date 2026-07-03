import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../types/context";
import type { Role } from "../config/constants";

export function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user) {
    throw new GraphQLError("You must be logged in to do this.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.user;
}

export function requireRole(ctx: GraphQLContext, ...roles: Role[]) {
  const user = requireAuth(ctx);
  if (!roles.includes(user.role)) {
    throw new GraphQLError("You do not have permission to do this.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}
