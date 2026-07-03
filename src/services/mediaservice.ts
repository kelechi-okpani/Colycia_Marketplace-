import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";

export interface UploadSignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

// Signed-upload pattern: the client (Next.js web app or the Expo mobile
// app) asks our GraphQL API for a signature, then uploads the file
// straight to Cloudinary's API using that signature. The file never
// passes through our server — no multipart handling in GraphQL, no
// server disk/memory pressure, and it scales the same for a 2MB photo
// or a 200MB video.
//
// Client-side upload call (web/mobile), after calling generateUploadSignature:
//   POST https://api.cloudinary.com/v1_1/{cloudName}/auto/upload
//   form-data: file, api_key, timestamp, signature, folder
export function generateUploadSignature(folder: string): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}

// Builds a consistent, predictable folder path per use case so assets
// stay organized in the Cloudinary media library without any manual work.
export function buildUploadFolder(kind: "listing" | "verification" | "avatar" | "portfolio", ownerId: string): string {
  return `servicehub/${kind}/${ownerId}`;
}

export async function deleteAsset(publicId: string): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId);
}