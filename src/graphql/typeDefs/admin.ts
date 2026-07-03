export const adminTypeDefs = `#graphql
  type PlatformStats {
    totalUsers: Int!
    totalProviders: Int!
    totalListings: Int!
    totalBookings: Int!
    totalGMV: Float!
    totalCommissionEarned: Float!
  }

  extend type Query {
    platformStats: PlatformStats!
    pendingVerifications: [Provider!]!
    disputedBookings: [Booking!]!
  }

  extend type Mutation {
    suspendUser(userId: ID!, reason: String!): User!
    reinstateUser(userId: ID!): User!
  }
`;
