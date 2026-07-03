export const mediaTypeDefs = `#graphql
  type UploadSignature {
    timestamp: Int!
    signature: String!
    apiKey: String!
    cloudName: String!
    folder: String!
  }

  enum UploadKind {
    LISTING
    VERIFICATION
    AVATAR
    PORTFOLIO
  }

  extend type Query {
    """
    Call this right before uploading a photo/video, then POST the file
    straight to Cloudinary from the client using the returned signature.
    """
    generateUploadSignature(kind: UploadKind!): UploadSignature!
  }

  extend type Mutation {
    deleteMediaAsset(publicId: String!): Boolean!
  }
`;