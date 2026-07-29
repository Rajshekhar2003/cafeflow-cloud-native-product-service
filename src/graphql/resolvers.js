import { GraphQLScalarType, Kind } from "graphql";
import { environment } from "../config/environment.js";
import { productService } from "../services/product.service.js";
import { mapToGraphQLError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const dateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 date-time value",
  serialize(value) {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new TypeError("DateTime cannot represent an invalid date");
    }

    return date.toISOString();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  }
});

function safely(resolve) {
  return async (...args) => {
    try {
      return await resolve(...args);
    } catch (error) {
      const mappedError = mapToGraphQLError(error);

      if (mappedError.extensions.code === "INTERNAL_SERVER_ERROR") {
        logger.error("Unhandled GraphQL resolver error", {
          error: error?.message
        });
      }

      throw mappedError;
    }
  };
}

export const resolvers = {
  DateTime: dateTimeScalar,

  Product: {
    id: (product) => product.id ?? product._id.toString(),
    inventoryStatus: (product) => {
      if (product.stockQuantity === 0) return "OUT_OF_STOCK";
      if (product.stockQuantity <= environment.lowStockThreshold) {
        return "LOW_STOCK";
      }
      return "IN_STOCK";
    }
  },

  Query: {
    products: safely((parent, args) => productService.listProducts(args)),
    product: safely((parent, { id }) => productService.getProductById(id)),
    productBySku: safely((parent, { sku }) =>
      productService.getProductBySku(sku)
    )
  },

  Mutation: {
    createProduct: safely((parent, { input }) =>
      productService.createProduct(input)
    ),
    updateProduct: safely((parent, { id, input }) =>
      productService.updateProduct(id, input)
    ),
    updateProductStock: safely((parent, { id, stockQuantity }) =>
      productService.updateProductStock(id, stockQuantity)
    ),
    updateProductStatus: safely((parent, { id, active }) =>
      productService.updateProductStatus(id, active)
    ),
    deleteProduct: safely((parent, { id }) =>
      productService.deleteProduct(id)
    )
  }
};
