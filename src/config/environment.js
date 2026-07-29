import dotenv from "dotenv";

dotenv.config();

function integerFromEnvironment(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? `${fallback}`, 10);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }

  return value;
}

function booleanFromEnvironment(name, fallback) {
  const rawValue = process.env[name];

  if (rawValue === undefined) {
    return fallback;
  }

  return rawValue.toLowerCase() === "true";
}

export const environment = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: integerFromEnvironment("PORT", 4000),
  mongoUri:
    process.env.MONGO_URI ??
    "mongodb://127.0.0.1:27017/cafeflow_product_db",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  graphqlIntrospection: booleanFromEnvironment(
    "GRAPHQL_INTROSPECTION",
    true
  ),
  logLevel: process.env.LOG_LEVEL ?? "info",
  lowStockThreshold: integerFromEnvironment("LOW_STOCK_THRESHOLD", 5)
});
