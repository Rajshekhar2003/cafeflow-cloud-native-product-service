import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";
import {
  badUserInput,
  mapToGraphQLError
} from "../src/utils/errors.js";

describe("GraphQL error mapping", () => {
  it("preserves an existing GraphQL error", () => {
    const error = badUserInput("Invalid input");
    expect(mapToGraphQLError(error)).toBe(error);
  });

  it("maps a MongoDB duplicate-key error to CONFLICT", () => {
    const result = mapToGraphQLError({
      code: 11000,
      keyPattern: { sku: 1 }
    });

    expect(result).toMatchObject({
      message: "A product with this sku already exists",
      extensions: { code: "CONFLICT", field: "sku" }
    });
  });

  it("maps a Mongoose validation error to BAD_USER_INPUT", () => {
    const result = mapToGraphQLError({
      name: "ValidationError",
      message: "Price is required"
    });

    expect(result).toMatchObject({
      message: "Price is required",
      extensions: { code: "BAD_USER_INPUT" }
    });
  });

  it("hides unexpected internal error details", () => {
    const result = mapToGraphQLError(new Error("database password exposed"));

    expect(result).toBeInstanceOf(GraphQLError);
    expect(result.message).toBe("An unexpected error occurred");
    expect(result.extensions.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
