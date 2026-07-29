import { describe, expect, it } from "vitest";
import {
  escapeRegularExpression,
  normalizeCreateProductInput,
  normalizeListOptions,
  normalizeStockQuantity,
  normalizeUpdateProductInput,
  validateObjectId
} from "../src/utils/validation.js";

describe("product input validation", () => {
  it("normalizes valid product input", () => {
    const result = normalizeCreateProductInput({
      sku: " cof-101 ",
      name: " Cappuccino ",
      description: " Espresso with milk ",
      price: 180,
      stockQuantity: 20,
      categoryId: " coffee "
    });

    expect(result).toEqual({
      sku: "COF-101",
      name: "Cappuccino",
      description: "Espresso with milk",
      price: 180,
      stockQuantity: 20,
      categoryId: "coffee",
      active: true
    });
  });

  it("rejects an invalid SKU", () => {
    expect(() =>
      normalizeCreateProductInput({
        sku: "coffee 101",
        name: "Cappuccino",
        price: 180,
        stockQuantity: 20,
        categoryId: "coffee"
      })
    ).toThrow("sku may contain only uppercase letters");
  });

  it("rejects a negative price", () => {
    expect(() =>
      normalizeCreateProductInput({
        sku: "COF-101",
        name: "Cappuccino",
        price: -1,
        stockQuantity: 20,
        categoryId: "coffee"
      })
    ).toThrow("price must be a non-negative number");
  });

  it("rejects a fractional stock quantity", () => {
    expect(() => normalizeStockQuantity(2.5)).toThrow(
      "stockQuantity must be a non-negative integer"
    );
  });

  it("rejects a non-boolean active flag", () => {
    expect(() =>
      normalizeCreateProductInput({
        sku: "COF-101",
        name: "Cappuccino",
        price: 180,
        stockQuantity: 20,
        categoryId: "coffee",
        active: "yes"
      })
    ).toThrow("active must be a boolean");
  });

  it("rejects an invalid category ID", () => {
    expect(() =>
      normalizeCreateProductInput({
        sku: "COF-101",
        name: "Cappuccino",
        price: 180,
        stockQuantity: 20,
        categoryId: "coffee drinks"
      })
    ).toThrow("categoryId may contain only");
  });

  it("rejects an oversized description", () => {
    expect(() =>
      normalizeCreateProductInput({
        sku: "COF-101",
        name: "Cappuccino",
        description: "x".repeat(501),
        price: 180,
        stockQuantity: 20,
        categoryId: "coffee"
      })
    ).toThrow("description must contain at most 500 characters");
  });

  it("rejects an empty update", () => {
    expect(() => normalizeUpdateProductInput({})).toThrow(
      "At least one product field must be supplied"
    );
  });

  it("normalizes the supplied update fields only", () => {
    expect(
      normalizeUpdateProductInput({
        name: " Iced Latte ",
        stockQuantity: 4
      })
    ).toEqual({
      name: "Iced Latte",
      stockQuantity: 4
    });
  });

  it("normalizes an active-status update", () => {
    expect(normalizeUpdateProductInput({ active: false })).toEqual({
      active: false
    });
  });
});

describe("query option validation", () => {
  it("applies safe pagination defaults", () => {
    expect(normalizeListOptions({})).toMatchObject({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortDirection: -1,
      lowStockOnly: false
    });
  });

  it("rejects a page size larger than 100", () => {
    expect(() => normalizeListOptions({ limit: 101 })).toThrow(
      "limit must be between 1 and 100"
    );
  });

  it("rejects an invalid page number", () => {
    expect(() => normalizeListOptions({ page: 0 })).toThrow(
      "page must be an integer greater than or equal to 1"
    );
  });

  it("rejects an unsupported sort field", () => {
    expect(() => normalizeListOptions({ sortBy: "SKU" })).toThrow(
      "sortBy contains an unsupported field"
    );
  });

  it("uses ascending sort order when requested", () => {
    expect(
      normalizeListOptions({ sortBy: "PRICE", sortDirection: "ASC" })
    ).toMatchObject({
      sortBy: "price",
      sortDirection: 1
    });
  });

  it("rejects an unsupported sort direction", () => {
    expect(() => normalizeListOptions({ sortDirection: "UP" })).toThrow(
      "sortDirection must be ASC or DESC"
    );
  });

  it("escapes regular-expression control characters", () => {
    expect(escapeRegularExpression("coffee.*(hot)")).toBe(
      "coffee\\.\\*\\(hot\\)"
    );
  });

  it("accepts a valid MongoDB object ID", () => {
    expect(validateObjectId("507f1f77bcf86cd799439011")).toBe(
      "507f1f77bcf86cd799439011"
    );
  });

  it("rejects an invalid MongoDB object ID", () => {
    expect(() => validateObjectId("not-an-id")).toThrow("Invalid product ID");
  });
});
