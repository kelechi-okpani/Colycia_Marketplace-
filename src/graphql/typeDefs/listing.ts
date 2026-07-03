export const listingTypeDefs = `#graphql
  type Media {
    url: String!
    type: String!
  }

  # Common fields every listing type shares. Resolvers return the concrete
  # type (HotelListing, SalonListing, ...) and GraphQL resolves the
  # interface based on __typename — mirrors the Mongoose discriminator
  # pattern on the backend 1:1.
  interface Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
  }

  type RoomType {
    id: ID!
    name: String!
    pricePerNight: Float!
    totalRooms: Int!
    maxOccupancy: Int!
    amenities: [String!]!
    photos: [String!]!
  }

  type HotelListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    roomTypes: [RoomType!]!
    amenities: [String!]!
    checkInTime: String!
    checkOutTime: String!
    starRating: Int
    cancellationPolicy: String
  }

  type AirbnbListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    propertyType: String
    bedrooms: Int
    bathrooms: Int
    maxGuests: Int
    houseRules: [String!]!
    amenities: [String!]!
    cancellationPolicy: String
  }

  type CarRentalListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    make: String
    carModel: String
    year: Int
    transmission: String
    seats: Int
    pricePerDay: Float
    pricePerHour: Float
    driverOptionAvailable: Boolean!
    driverFee: Float
    pickupLocations: [String!]!
    dropoffLocations: [String!]!
  }

  type MenuItem {
    id: ID!
    name: String!
    description: String
    price: Float!
    photo: String
    isAvailable: Boolean!
    category: String
  }

  type FoodVendorListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    menu: [MenuItem!]!
    deliveryAvailable: Boolean!
    pickupAvailable: Boolean!
    deliveryFee: Float
    estimatedPrepMinutes: Int
    cuisineTypes: [String!]!
  }

  type ServicePackage {
    id: ID!
    name: String!
    durationMinutes: Int!
    price: Float!
  }

  type StaffMember {
    id: ID!
    name: String!
    photo: String
    specialties: [String!]!
  }

  type SalonListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    servicePackages: [ServicePackage!]!
    staff: [StaffMember!]!
    slotDurationMinutes: Int!
  }

  type AirlineListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    airlineCode: String
    externalProvider: String!
    hubAirports: [String!]!
  }

  type TourPackage {
    id: ID!
    name: String!
    description: String
    durationHours: Float!
    price: Float!
    maxGroupSize: Int
    isPrivateOnly: Boolean!
  }

  type TourGuideListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    packages: [TourPackage!]!
    languagesSpoken: [String!]!
    coverageAreas: [String!]!
  }

  type PricingPackage {
    id: ID!
    name: String!
    price: Float!
    durationMinutes: Int!
  }

  type MakeupArtistListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    portfolio: [String!]!
    pricingPackages: [PricingPackage!]!
    mobileServiceAvailable: Boolean!
    homeStudioAvailable: Boolean!
    travelFee: Float
  }

  type SessionPackage {
    id: ID!
    name: String!
    price: Float!
    durationHours: Float!
    editedPhotosIncluded: Int
    deliveryDays: Int
  }

  type PhotographerListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    portfolio: [String!]!
    sessionPackages: [SessionPackage!]!
    specialties: [String!]!
    equipmentHighlights: [String!]!
  }

  type Hall {
    id: ID!
    name: String!
    capacity: Int!
    pricePerDay: Float!
    photos: [String!]!
    amenities: [String!]!
  }

  type EventCenterListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    halls: [Hall!]!
    cateringAvailable: Boolean!
    decorationAvailable: Boolean!
  }

  type WellnessPackage {
    id: ID!
    name: String!
    durationMinutes: Int!
    price: Float!
  }

  type MassageTherapyListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    wellnessPackages: [WellnessPackage!]!
    homeServiceAvailable: Boolean!
    spaServiceAvailable: Boolean!
    travelFee: Float
  }

  type SessionType {
    id: ID!
    name: String!
    durationMinutes: Int!
    price: Float!
    mode: String!
  }

  type SubscriptionPlan {
    id: ID!
    name: String!
    sessionsIncluded: Int!
    price: Float!
    billingCycle: String!
  }

  type TherapyListing implements Listing {
    id: ID!
    provider: Provider!
    category: ProviderCategory!
    title: String!
    description: String
    media: [Media!]!
    basePrice: Float!
    currency: String!
    location: Location
    status: ListingStatus!
    ratingAverage: Float!
    ratingCount: Int!
    tags: [String!]!
    createdAt: DateTime!
    credentials: [String!]!
    specializations: [String!]!
    sessionTypes: [SessionType!]!
    requiresEnhancedPrivacy: Boolean!
  }

  input MediaInput {
    url: String!
    type: String
  }

  # Generic create/update input; category-specific nested fields (rooms,
  # menu, packages, etc.) are passed as JSON and validated in the resolver
  # against the relevant discriminator — keeps 12 near-identical input
  # types from bloating the schema.
  input ListingInput {
    title: String!
    description: String
    media: [MediaInput!]
    basePrice: Float!
    currency: String
    location: LocationInput
    tags: [String!]
    categoryData: JSON
  }

  input UpdateListingInput {
    title: String
    description: String
    media: [MediaInput!]
    basePrice: Float
    location: LocationInput
    status: ListingStatus
    tags: [String!]
    categoryData: JSON
  }

  input ListingSearchInput {
    category: ProviderCategory
    city: String
    query: String
    minPrice: Float
    maxPrice: Float
    page: Int
    pageSize: Int
  }

  type ListingSearchResult {
    items: [Listing!]!
    pageInfo: PageInfo!
  }

  extend type Query {
    listing(id: ID!): Listing
    searchListings(input: ListingSearchInput!): ListingSearchResult!
    myListings: [Listing!]!
  }

  extend type Mutation {
    createListing(category: ProviderCategory!, input: ListingInput!): Listing!
    updateListing(id: ID!, input: UpdateListingInput!): Listing!
    deleteListing(id: ID!): Boolean!
  }
`;
