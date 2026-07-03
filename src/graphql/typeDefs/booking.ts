export const bookingTypeDefs = `#graphql
  type Booking {
    id: ID!
    customer: User!
    provider: Provider!
    listing: Listing!
    category: ProviderCategory!
    selection: JSON!
    scheduledStart: DateTime
    scheduledEnd: DateTime
    quantity: Int!
    unitPrice: Float!
    subtotal: Float!
    commissionAmount: Float!
    totalAmount: Float!
    currency: String!
    status: BookingStatus!
    paymentStatus: PaymentStatus!
    cancellationReason: String
    disputeReason: String
    createdAt: DateTime!
  }

  input CreateBookingInput {
    listingId: ID!
    selection: JSON!
    scheduledStart: DateTime
    scheduledEnd: DateTime
    quantity: Int
    unitPrice: Float!
  }

  extend type Query {
    booking(id: ID!): Booking
    myBookingsAsCustomer(status: BookingStatus, page: Int, pageSize: Int): [Booking!]!
    myBookingsAsProvider(status: BookingStatus, page: Int, pageSize: Int): [Booking!]!
  }

  extend type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    confirmBooking(id: ID!): Booking!
    startBooking(id: ID!): Booking!
    completeBooking(id: ID!): Booking!
    cancelBooking(id: ID!, reason: String!): Booking!
    disputeBooking(id: ID!, reason: String!): Booking!
    resolveDispute(id: ID!, resolution: BookingStatus!): Booking!
  }
`;
