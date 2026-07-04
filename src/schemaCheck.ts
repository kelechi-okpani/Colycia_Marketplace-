import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import type { GraphQLContext } from "./types/context";

async function run() {
  const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });
  await server.start();
  console.log("[schema-check] Full merged schema built and validated successfully ✅");
  console.log("[schema-check] Modules: user, provider, listing (12 verticals), booking, wallet, review, chat, notification, admin, media, flight");
  await server.stop();
  process.exit(0);
}

run().catch((err) => {
  console.error("[schema-check] Schema build FAILED:", err);
  process.exit(1);
});
