import { generateUploadSignature, buildUploadFolder, deleteAsset } from "../../services/mediaservice";
import { requireAuth } from "../../middleware/permissions";
import type { GraphQLContext } from "../../types/context";

type UploadKind = "LISTING" | "VERIFICATION" | "AVATAR" | "PORTFOLIO";

const KIND_MAP: Record<UploadKind, "listing" | "verification" | "avatar" | "portfolio"> = {
  LISTING: "listing",
  VERIFICATION: "verification",
  AVATAR: "avatar",
  PORTFOLIO: "portfolio",
};

export const mediaResolvers = {
  Query: {
    generateUploadSignature: (_: unknown, { kind }: { kind: UploadKind }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const folder = buildUploadFolder(KIND_MAP[kind], user.id);
      return generateUploadSignature(folder);
    },
  },

  Mutation: {
    deleteMediaAsset: async (_: unknown, { publicId }: { publicId: string }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);

      // Defense in depth: publicId is namespaced as servicehub/{kind}/{ownerId}/...
      // so a user can only delete assets under their own folder.
      if (!publicId.includes(`/${user.id}/`)) {
        throw new Error("You do not have permission to delete this asset.");
      }

      const result = await deleteAsset(publicId);
      return result.result === "ok";
    },
  },
};