export const reviewTypeDefs = `#graphql
  type Review {
    id: ID!
    booking: Booking!
    listing: Listing!
    provider: Provider!
    author: User!
    rating: Int!
    comment: String
    providerReply: String
    isHidden: Boolean!
    createdAt: DateTime!
  }

  input CreateReviewInput {
    bookingId: ID!
    rating: Int!
    comment: String
  }

  extend type Query {
    listingReviews(listingId: ID!, page: Int, pageSize: Int): [Review!]!
    providerReviews(providerId: ID!, page: Int, pageSize: Int): [Review!]!
  }

  extend type Mutation {
    createReview(input: CreateReviewInput!): Review!
    replyToReview(reviewId: ID!, reply: String!): Review!
    hideReview(reviewId: ID!): Review! # admin moderation
  }
`;
