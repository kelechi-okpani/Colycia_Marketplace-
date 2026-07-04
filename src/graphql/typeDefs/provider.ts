export const providerTypeDefs = `#graphql
  type VerificationDocument {
    type: String!
    url: String!
    uploadedAt: DateTime!
  }

  type Verification {
    status: String!
    documents: [VerificationDocument!]!
    rejectionReason: String
  }

  type WeeklyHours {
    day: Int!
    openTime: String
    closeTime: String
    isClosed: Boolean!
  }

  type Availability {
    timezone: String!
    weeklyHours: [WeeklyHours!]!
  }

  type Location {
    address: String
    city: String
    state: String
    country: String!
    lat: Float
    lng: Float
  }

  type PayoutDetails {
    accountNumber: String
    bankCode: String
    accountName: String
  }

  type Provider {
    id: ID!
    user: User!
    category: ProviderCategory!
    businessName: String!
    bio: String
    coverImageUrl: String
    gallery: [String!]!
    location: Location
    verification: Verification!
    availability: Availability!
    commissionRate: Float!
    ratingAverage: Float!
    ratingCount: Int!
    isSuspended: Boolean!
    payoutDetails: PayoutDetails
    createdAt: DateTime!
  }

  input LocationInput {
    address: String
    city: String
    state: String
    country: String
    lat: Float
    lng: Float
  }

  input WeeklyHoursInput {
    day: Int!
    openTime: String
    closeTime: String
    isClosed: Boolean
  }

  input CreateProviderProfileInput {
    category: ProviderCategory!
    businessName: String!
    bio: String
    location: LocationInput
  }

  input UpdateProviderProfileInput {
    businessName: String
    bio: String
    coverImageUrl: String
    gallery: [String!]
    location: LocationInput
    weeklyHours: [WeeklyHoursInput!]
  }

  input UploadVerificationDocInput {
    type: String!
    url: String!
  }

  input UpdatePayoutDetailsInput {
    accountNumber: String!
    bankCode: String!
    accountName: String!
  }

  extend type Query {
    provider(id: ID!): Provider
    myProviderProfile: Provider
    providers(category: ProviderCategory, city: String, page: Int, pageSize: Int): [Provider!]!
  }

  extend type Mutation {
    createProviderProfile(input: CreateProviderProfileInput!): Provider!
    updateProviderProfile(input: UpdateProviderProfileInput!): Provider!
    uploadVerificationDocument(input: UploadVerificationDocInput!): Provider!
    updatePayoutDetails(input: UpdatePayoutDetailsInput!): Provider!
    # Admin only
    reviewProviderVerification(providerId: ID!, approve: Boolean!, rejectionReason: String): Provider!
    suspendProvider(providerId: ID!, reason: String!): Provider!
  }
`;