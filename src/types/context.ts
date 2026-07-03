import type { Role } from "../config/constants.js";

// Attached to req/context after JWT verification in middleware/auth.ts.
// `null` when the request is unauthenticated (e.g. public listing search).
export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  providerId?: string; // present if role === PROVIDER
}

export interface GraphQLContext {
  user: AuthUser | null;
}
