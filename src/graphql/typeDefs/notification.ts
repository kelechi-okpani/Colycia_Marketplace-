export const notificationTypeDefs = `#graphql
  type Notification {
    id: ID!
    channel: String!
    title: String!
    body: String!
    isRead: Boolean!
    relatedBooking: Booking
    createdAt: DateTime!
  }

  extend type Query {
    myNotifications(unreadOnly: Boolean, page: Int, pageSize: Int): [Notification!]!
  }

  extend type Mutation {
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: Boolean!
  }
`;
