export const sharedTypeDefs = `#graphql
  scalar DateTime
  scalar JSON

  enum Role {
    CUSTOMER
    PROVIDER
    ADMIN
  }

  enum ProviderCategory {
    HOTEL
    AIRBNB_HOST
    CAR_RENTAL
    FOOD_VENDOR
    SALON
    AIRLINE
    TOUR_GUIDE
    MAKEUP_ARTIST
    PHOTOGRAPHER
    EVENT_CENTER
    MASSAGE_THERAPY
    PROFESSIONAL_THERAPY
  }

  enum ListingStatus {
    DRAFT
    ACTIVE
    PAUSED
    ARCHIVED
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    DISPUTED
  }

  enum PaymentStatus {
    UNPAID
    PAID
    PARTIALLY_PAID
    REFUNDED
    FAILED
  }

  type PageInfo {
    total: Int!
    page: Int!
    pageSize: Int!
    hasNextPage: Boolean!
  }

  type Query
  type Mutation
`;
