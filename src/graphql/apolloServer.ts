import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../graphql/typeDefs";
import { resolvers } from "../graphql/resolvers";
import type { GraphQLContext } from "../types/context";
import { env } from "../config/env";

export function createApolloServer() {
  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: !env.isProduction,
  });
}
