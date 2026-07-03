import type { Request } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { GraphQLContext } from "../types/context.js";

// Called once per request by Apollo's expressMiddleware `context` option.
// Pulls "Authorization: Bearer <token>", verifies it, and hands the
// resolved user (or null) to every resolver via context.

export async function buildContext({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return { user: null };

  const user = verifyToken(token);
  return { user };
}
