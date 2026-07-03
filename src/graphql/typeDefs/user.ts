export const userTypeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    role: Role!
    avatarUrl: String
    isActive: Boolean!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    password: String!
    role: Role
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    phone: String
    avatarUrl: String
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
  }
`;
