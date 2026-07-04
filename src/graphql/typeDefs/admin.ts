export const adminTypeDefs = `#graphql
  type PlatformStats {
    totalUsers: Int!
    totalProviders: Int!
    totalListings: Int!
    totalBookings: Int!
    totalGMV: Float!
    totalCommissionEarned: Float!
  }

  type AuditLogEntry {
    id: ID!
    admin: User!
    action: String!
    targetType: String!
    targetId: ID!
    reason: String
    createdAt: DateTime!
  }

  extend type Query {
    platformStats: PlatformStats!
    pendingVerifications: [Provider!]!
    disputedBookings: [Booking!]!

    """Full user directory, optionally filtered — admin only."""
    allUsers(role: Role, isSuspended: Boolean, page: Int, pageSize: Int): [User!]!

    """Full provider directory across all 12 verticals — admin only."""
    allProviders(category: ProviderCategory, verificationStatus: String, page: Int, pageSize: Int): [Provider!]!

    """Every listing across every vertical — admin only."""
    allListings(category: ProviderCategory, status: ListingStatus, page: Int, pageSize: Int): [Listing!]!

    """Every booking on the platform, any status — admin only."""
    allBookings(status: BookingStatus, category: ProviderCategory, page: Int, pageSize: Int): [Booking!]!

    """Every wallet transaction platform-wide — admin only."""
    allTransactions(type: String, status: String, page: Int, pageSize: Int): [Transaction!]!

    """Every flight booked through the platform — admin only."""
    allFlightBookings(page: Int, pageSize: Int): [FlightBooking!]!

    """Moderation history — who did what, and why."""
    auditLogs(targetType: String, page: Int, pageSize: Int): [AuditLogEntry!]!
  }

  extend type Mutation {
    suspendUser(userId: ID!, reason: String!): User!
    reinstateUser(userId: ID!): User!
  }
`;