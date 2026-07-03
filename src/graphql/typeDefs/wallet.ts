export const walletTypeDefs = `#graphql
  type Wallet {
    id: ID!
    owner: User!
    balance: Float!
    pendingBalance: Float!
    currency: String!
  }

  type Transaction {
    id: ID!
    type: String!
    amount: Float!
    currency: String!
    status: String!
    relatedBooking: Booking
    reference: String!
    createdAt: DateTime!
  }

  type InitializePaymentPayload {
    authorizationUrl: String!
    reference: String!
  }

  extend type Query {
    myWallet: Wallet!
    myTransactions(page: Int, pageSize: Int): [Transaction!]!
  }

  extend type Mutation {
    initializeDeposit(amount: Float!): InitializePaymentPayload!
    verifyDeposit(reference: String!): Transaction!
    requestWithdrawal(amount: Float!): Transaction!
  }
`;
