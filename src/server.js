import { createServer } from "node:http";
import { createApplication } from "./app.js";
import {
  connectDatabase,
  disconnectDatabase
} from "./config/database.js";
import { environment } from "./config/environment.js";
import { logger } from "./utils/logger.js";

let httpServer;
let apolloServer;
let shuttingDown = false;

async function startServer() {
  await connectDatabase(environment.mongoUri);
  logger.info("MongoDB connection established");

  const application = await createApplication();
  apolloServer = application.apolloServer;
  httpServer = createServer(application.app);

  await new Promise((resolve) => {
    httpServer.listen(environment.port, "0.0.0.0", resolve);
  });

  logger.info("CafeFlow Product Service started", {
    port: environment.port,
    graphqlUrl: `http://localhost:${environment.port}/graphql`
  });
}

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info("Graceful shutdown started", { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }

    if (apolloServer) {
      await apolloServer.stop();
    }

    await disconnectDatabase();
    clearTimeout(forceExitTimer);
    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Graceful shutdown failed", { error: error.message });
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch(async (error) => {
  logger.error("Application failed to start", { error: error.message });
  await disconnectDatabase();
  process.exit(1);
});
