import { GraphQLError } from "graphql";

export function badUserInput(message, details) {
  return new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      ...(details ? { details } : {})
    }
  });
}

export function notFound(resource, identifier) {
  return new GraphQLError(`${resource} was not found`, {
    extensions: {
      code: "NOT_FOUND",
      resource,
      identifier
    }
  });
}

export function conflict(message, field) {
  return new GraphQLError(message, {
    extensions: {
      code: "CONFLICT",
      ...(field ? { field } : {})
    }
  });
}

export function mapToGraphQLError(error) {
  if (error instanceof GraphQLError) {
    return error;
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern ?? {})[0] ?? "resource";
    return conflict(`A product with this ${field} already exists`, field);
  }

  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return badUserInput(error.message);
  }

  return new GraphQLError("An unexpected error occurred", {
    extensions: {
      code: "INTERNAL_SERVER_ERROR"
    }
  });
}
