export const chatTypeDefs = `#graphql
  type Conversation {
    id: ID!
    participants: [User!]!
    relatedBooking: Booking
    lastMessagePreview: String
    lastMessageAt: DateTime
    isEnhancedPrivacy: Boolean!
  }

  type Message {
    id: ID!
    conversation: ID!
    sender: User!
    body: String!
    attachments: [String!]!
    readBy: [ID!]!
    createdAt: DateTime!
  }

  extend type Query {
    myConversations: [Conversation!]!
    conversationMessages(conversationId: ID!, page: Int, pageSize: Int): [Message!]!
  }

  extend type Mutation {
    startConversation(otherUserId: ID!, bookingId: ID): Conversation!
    sendMessage(conversationId: ID!, body: String!, attachments: [String!]): Message!
    markConversationRead(conversationId: ID!): Boolean!
  }
`;
