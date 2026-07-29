import mongoose from "mongoose";
import { badUserInput } from "./errors.js";

export const PRODUCT_SORT_FIELDS = Object.freeze({
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  NAME: "name",
  PRICE: "price",
  STOCK_QUANTITY: "stockQuantity"
});

function requireString(value, field, minLength, maxLength) {
  if (typeof value !== "string") {
    throw badUserInput(`${field} must be a string`, { field });
  }

  const normalized = value.trim();

  if (normalized.length < minLength || normalized.length > maxLength) {
    throw badUserInput(
      `${field} must contain between ${minLength} and ${maxLength} characters`,
      { field }
    );
  }

  return normalized;
}

function optionalDescription(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string" || value.trim().length > 500) {
    throw badUserInput("description must contain at most 500 characters", {
      field: "description"
    });
  }

  return value.trim();
}

function nonNegativeNumber(value, field) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw badUserInput(`${field} must be a non-negative number`, { field });
  }

  return value;
}

function nonNegativeInteger(value, field) {
  if (!Number.isInteger(value) || value < 0) {
    throw badUserInput(`${field} must be a non-negative integer`, { field });
  }

  return value;
}

function booleanValue(value, field) {
  if (typeof value !== "boolean") {
    throw badUserInput(`${field} must be a boolean`, { field });
  }

  return value;
}

function normalizeSku(value) {
  const sku = requireString(value, "sku", 3, 30).toUpperCase();

  if (!/^[A-Z0-9-]+$/.test(sku)) {
    throw badUserInput(
      "sku may contain only uppercase letters, numbers and hyphens",
      { field: "sku" }
    );
  }

  return sku;
}

function normalizeCategoryId(value) {
  const categoryId = requireString(value, "categoryId", 1, 64);

  if (!/^[A-Za-z0-9_-]+$/.test(categoryId)) {
    throw badUserInput(
      "categoryId may contain only letters, numbers, hyphens and underscores",
      { field: "categoryId" }
    );
  }

  return categoryId;
}

export function normalizeCreateProductInput(input) {
  if (!input || typeof input !== "object") {
    throw badUserInput("Product input is required");
  }

  return {
    sku: normalizeSku(input.sku),
    name: requireString(input.name, "name", 2, 120),
    description: optionalDescription(input.description),
    price: nonNegativeNumber(input.price, "price"),
    stockQuantity: nonNegativeInteger(
      input.stockQuantity,
      "stockQuantity"
    ),
    categoryId: normalizeCategoryId(input.categoryId),
    active:
      input.active === undefined ? true : booleanValue(input.active, "active")
  };
}

export function normalizeUpdateProductInput(input) {
  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    throw badUserInput("At least one product field must be supplied");
  }

  const normalized = {};

  if (input.sku !== undefined) normalized.sku = normalizeSku(input.sku);
  if (input.name !== undefined) {
    normalized.name = requireString(input.name, "name", 2, 120);
  }
  if (input.description !== undefined) {
    normalized.description = optionalDescription(input.description);
  }
  if (input.price !== undefined) {
    normalized.price = nonNegativeNumber(input.price, "price");
  }
  if (input.stockQuantity !== undefined) {
    normalized.stockQuantity = nonNegativeInteger(
      input.stockQuantity,
      "stockQuantity"
    );
  }
  if (input.categoryId !== undefined) {
    normalized.categoryId = normalizeCategoryId(input.categoryId);
  }
  if (input.active !== undefined) {
    normalized.active = booleanValue(input.active, "active");
  }

  return normalized;
}

export function normalizeStockQuantity(stockQuantity) {
  return nonNegativeInteger(stockQuantity, "stockQuantity");
}

export function validateObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw badUserInput("Invalid product ID", { field: "id" });
  }

  return id;
}

export function normalizeListOptions(options = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortField = options.sortBy ?? "CREATED_AT";
  const sortDirection = options.sortDirection ?? "DESC";

  if (!Number.isInteger(page) || page < 1) {
    throw badUserInput("page must be an integer greater than or equal to 1", {
      field: "page"
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw badUserInput("limit must be between 1 and 100", {
      field: "limit"
    });
  }

  if (!PRODUCT_SORT_FIELDS[sortField]) {
    throw badUserInput("sortBy contains an unsupported field", {
      field: "sortBy"
    });
  }

  if (!["ASC", "DESC"].includes(sortDirection)) {
    throw badUserInput("sortDirection must be ASC or DESC", {
      field: "sortDirection"
    });
  }

  return {
    page,
    limit,
    sortBy: PRODUCT_SORT_FIELDS[sortField],
    sortDirection: sortDirection === "ASC" ? 1 : -1,
    search: options.search?.trim(),
    categoryId: options.categoryId?.trim(),
    active: options.active,
    lowStockOnly: options.lowStockOnly ?? false
  };
}

export function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
