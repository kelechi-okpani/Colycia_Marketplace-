export const flightTypeDefs = `#graphql
  type FlightSegment {
    airlineCode: String!
    airlineName: String!
    flightNumber: String!
    departureTime: DateTime!
    arrivalTime: DateTime!
    originAirport: String!
    destinationAirport: String!
  }

  type FlightOption {
    offerId: ID!
    totalPrice: Float!
    currency: String!
    expiresAt: DateTime!
    slices: [[FlightSegment!]!]!
  }

  input FlightSearchInput {
    origin: String!
    destination: String!
    departureDate: String!
    returnDate: String
    passengers: Int!
    cabinClass: String
  }

  input FlightPassengerInput {
    title: String!
    givenName: String!
    familyName: String!
    email: String!
    phoneNumber: String!
    born: String!
    gender: String!
  }

  input BookFlightInput {
    offerId: ID!
    passengers: [FlightPassengerInput!]!
  }

  type FlightBookingResult {
    orderId: ID!
    bookingReference: String!
    totalPrice: Float!
    currency: String!
  }

  type FlightPassengerSnapshot {
    title: String!
    givenName: String!
    familyName: String!
    email: String!
  }

  type FlightBooking {
    id: ID!
    offerId: String!
    orderId: String!
    bookingReference: String!
    passengers: [FlightPassengerSnapshot!]!
    slices: [[FlightSegment!]!]!
    totalPrice: Float!
    currency: String!
    status: String!
    createdAt: DateTime!
  }

  extend type Query {
    searchFlights(input: FlightSearchInput!): [FlightOption!]!
    myFlightBookings(page: Int, pageSize: Int): [FlightBooking!]!
  }

  extend type Mutation {
    """
    Charges the customer's wallet for totalPrice, then books with Duffel.
    Fails without charging if the offer has expired or the wallet balance
    is insufficient.
    """
    bookFlight(input: BookFlightInput!): FlightBookingResult!
  }
`;