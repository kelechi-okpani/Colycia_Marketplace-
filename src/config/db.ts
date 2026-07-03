import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("[db] MongoDB connection error:", (err as Error).message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
