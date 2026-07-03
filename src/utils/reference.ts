import crypto from "crypto";

export function generateReference(prefix = "TXN"): string {
  const random = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${Date.now()}_${random}`;
}
