import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? "development",

  MONGO_URI: required("MONGO_URI", "mongodb://localhost:27017/servicehub"),

  JWT_SECRET: required("JWT_SECRET", "dev_only_insecure_secret_change_me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ?? "",
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY ?? "",

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ?? "",
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ?? "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ?? "",
  FCM_SERVER_KEY: process.env.FCM_SERVER_KEY ?? "",

  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",

  isProduction: (process.env.NODE_ENV ?? "development") === "production",
};