import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

if (!env.CLOUDINARY_CLOUD_NAME) {
  console.warn("[cloudinary] CLOUDINARY_CLOUD_NAME not set — media upload signing will fail until it is.");
}

export { cloudinary };