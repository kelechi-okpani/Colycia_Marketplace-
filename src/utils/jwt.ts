import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthUser } from "../types/context";

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}
