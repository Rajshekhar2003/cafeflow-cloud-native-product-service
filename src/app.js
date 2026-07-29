import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { environment } from "./config/environment.js";
import { isDatabaseReady } from "./config/database.js";
import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { logger } from "./utils/logger.js";

export async function createApplication() {
  const app = express();
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: environment.graphqlIntrospection,
    includeStacktraceInErrorResponses: environment.nodeEnv !== "production"
  });

  await apolloServer.start();

  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: environment.nodeEnv === "production" ? undefined : false
    })
  );

  app.get("/", (request, response) => {
    response.status(200).json({
      service: "CafeFlow Product Service",
      version: "1.0.0",
      graphqlEndpoint: "/graphql",
      healthEndpoints: ["/health/live", "/health/ready"]
    });
  });

  app.get("/health/live", (request, response) => {
    response.status(200).json({
      status: "UP",
      service: "cafeflow-product-service",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/health/ready", (request, response) => {
    const databaseReady = isDatabaseReady();

    response.status(databaseReady ? 200 : 503).json({
      status: databaseReady ? "READY" : "NOT_READY",
      service: "cafeflow-product-service",
      dependencies: {
        mongodb: databaseReady ? "UP" : "DOWN"
      },
      timestamp: new Date().toISOString()
    });
  });

  app.use(
    "/graphql",
    cors({ origin: environment.corsOrigin }),
    express.json({ limit: "1mb" }),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        requestId: req.headers["x-request-id"] ?? crypto.randomUUID()
      })
    })
  );

  app.use((request, response) => {
    response.status(404).json({
      success: false,
      message: `Route ${request.method} ${request.originalUrl} was not found`
    });
  });

  app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && "body" in error) {
      response.status(400).json({
        success: false,
        message: "Request body contains invalid JSON"
      });
      return;
    }

    logger.error("Unhandled HTTP request error", {
      method: request.method,
      path: request.originalUrl,
      error: error.message
    });
    response.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  });

  return { app, apolloServer };
}
