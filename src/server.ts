import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";

import { env } from "./config/env";
import { connectDB } from "./config/db";
import "./models"; // registers every model + discriminator before anything queries them

import { createApolloServer } from "./graphql/apolloServer";
import { buildContext } from "./middleware/auth";

async function main() {
  await connectDB();

  const app = express();
  const apollo = createApolloServer();
  await apollo.start();

  app.use(
    "/graphql",
    cors({ origin: env.CLIENT_URL, credentials: true }),
    json({ limit: "5mb" }),
    expressMiddleware(apollo, { context: buildContext })
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", env: env.NODE_ENV });
  });

  app.listen(env.PORT, () => {
    console.log(`[server] Listening on http://localhost:${env.PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error("[server] Fatal startup error:", err);
  process.exit(1);
});
