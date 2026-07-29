import { describe, expect, it, vi } from "vitest";
import { createProductService } from "../src/services/product.service.js";

const PRODUCT_ID = "507f1f77bcf86cd799439011";

function validProduct(overrides = {}) {
  return {
    _id: PRODUCT_ID,
    sku: "COF-101",
    name: "Cappuccino",
    description: "Espresso with milk",
    price: 180,
    stockQuantity: 20,
    categoryId: "coffee",
    active: true,
    ...overrides
  };
}

describe("product service", () => {
  it("creates a normalized product", async () => {
    const createdProduct = validProduct();
    const model = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(createdProduct)
    };
    const service = createProductService(model);

    const result = await service.createProduct({
      sku: " cof-101 ",
      name: " Cappuccino ",
      price: 180,
      stockQuantity: 20,
      categoryId: "coffee"
    });

    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ sku: "COF-101", active: true })
    );
    expect(result).toBe(createdProduct);
  });

  it("rejects a duplicate SKU", async () => {
    const model = {
      findOne: vi.fn().mockResolvedValue(validProduct())
    };
    const service = createProductService(model);

    await expect(
      service.createProduct({
        sku: "COF-101",
        name: "Cappuccino",
        price: 180,
        stockQuantity: 20,
        categoryId: "coffee"
      })
    ).rejects.toMatchObject({
      extensions: { code: "CONFLICT", field: "sku" }
    });
  });

  it("gets a product by ID", async () => {
    const product = validProduct();
    const model = { findById: vi.fn().mockResolvedValue(product) };
    const service = createProductService(model);

    await expect(service.getProductById(PRODUCT_ID)).resolves.toBe(product);
  });

  it("returns NOT_FOUND for a missing product", async () => {
    const model = { findById: vi.fn().mockResolvedValue(null) };
    const service = createProductService(model);

    await expect(service.getProductById(PRODUCT_ID)).rejects.toMatchObject({
      extensions: { code: "NOT_FOUND" }
    });
  });

  it("gets a product by normalized SKU", async () => {
    const product = validProduct();
    const model = { findOne: vi.fn().mockResolvedValue(product) };
    const service = createProductService(model);

    await expect(service.getProductBySku(" cof-101 ")).resolves.toBe(product);
    expect(model.findOne).toHaveBeenCalledWith({ sku: "COF-101" });
  });

  it("returns NOT_FOUND for a missing SKU", async () => {
    const model = { findOne: vi.fn().mockResolvedValue(null) };
    const service = createProductService(model);

    await expect(service.getProductBySku("COF-404")).rejects.toMatchObject({
      extensions: { code: "NOT_FOUND", identifier: "COF-404" }
    });
  });

  it("updates an existing product", async () => {
    const product = {
      ...validProduct(),
      save: vi.fn().mockResolvedValue(
        validProduct({ name: "Flat White", price: 190 })
      )
    };
    const model = {
      findById: vi.fn().mockResolvedValue(product),
      findOne: vi.fn()
    };
    const service = createProductService(model);

    const result = await service.updateProduct(PRODUCT_ID, {
      name: "Flat White",
      price: 190
    });

    expect(product.name).toBe("Flat White");
    expect(product.price).toBe(190);
    expect(model.findOne).not.toHaveBeenCalled();
    expect(result.name).toBe("Flat White");
  });

  it("rejects a duplicate SKU during update", async () => {
    const product = {
      ...validProduct(),
      save: vi.fn()
    };
    const model = {
      findById: vi.fn().mockResolvedValue(product),
      findOne: vi.fn().mockResolvedValue(validProduct({ sku: "COF-202" }))
    };
    const service = createProductService(model);

    await expect(
      service.updateProduct(PRODUCT_ID, { sku: "COF-202" })
    ).rejects.toMatchObject({
      extensions: { code: "CONFLICT", field: "sku" }
    });
    expect(product.save).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when updating a missing product", async () => {
    const model = {
      findById: vi.fn().mockResolvedValue(null)
    };
    const service = createProductService(model);

    await expect(
      service.updateProduct(PRODUCT_ID, { name: "Flat White" })
    ).rejects.toMatchObject({
      extensions: { code: "NOT_FOUND" }
    });
  });

  it("updates the product stock", async () => {
    const product = validProduct({ stockQuantity: 7 });
    const model = {
      findByIdAndUpdate: vi.fn().mockResolvedValue(product)
    };
    const service = createProductService(model);

    const result = await service.updateProductStock(PRODUCT_ID, 7);

    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      PRODUCT_ID,
      { $set: { stockQuantity: 7 } },
      { new: true, runValidators: true }
    );
    expect(result.stockQuantity).toBe(7);
  });

  it("updates the active status", async () => {
    const product = validProduct({ active: false });
    const model = {
      findByIdAndUpdate: vi.fn().mockResolvedValue(product)
    };
    const service = createProductService(model);

    await expect(
      service.updateProductStatus(PRODUCT_ID, false)
    ).resolves.toBe(product);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      PRODUCT_ID,
      { $set: { active: false } },
      { new: true, runValidators: true }
    );
  });

  it("returns NOT_FOUND when a status update targets a missing product", async () => {
    const model = {
      findByIdAndUpdate: vi.fn().mockResolvedValue(null)
    };
    const service = createProductService(model);

    await expect(
      service.updateProductStatus(PRODUCT_ID, false)
    ).rejects.toMatchObject({
      extensions: { code: "NOT_FOUND" }
    });
  });

  it("returns NOT_FOUND when a stock update targets a missing product", async () => {
    const model = {
      findByIdAndUpdate: vi.fn().mockResolvedValue(null)
    };
    const service = createProductService(model);

    await expect(
      service.updateProductStock(PRODUCT_ID, 3)
    ).rejects.toMatchObject({
      extensions: { code: "NOT_FOUND" }
    });
  });

  it("deletes an existing product", async () => {
    const model = {
      findByIdAndDelete: vi.fn().mockResolvedValue(validProduct())
    };
    const service = createProductService(model);

    await expect(service.deleteProduct(PRODUCT_ID)).resolves.toEqual({
      success: true,
      message: "Product deleted successfully",
      deletedId: PRODUCT_ID
    });
  });

  it("returns NOT_FOUND when deleting a missing product", async () => {
    const model = {
      findByIdAndDelete: vi.fn().mockResolvedValue(null)
    };
    const service = createProductService(model);

    await expect(service.deleteProduct(PRODUCT_ID)).rejects.toMatchObject({
      extensions: { code: "NOT_FOUND" }
    });
  });

  it("builds a paginated filtered query", async () => {
    const items = [validProduct()];
    const query = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(items)
    };
    const model = {
      find: vi.fn().mockReturnValue(query),
      countDocuments: vi.fn().mockResolvedValue(11)
    };
    const service = createProductService(model, { lowStockThreshold: 5 });

    const result = await service.listProducts({
      page: 2,
      limit: 10,
      search: "latte",
      categoryId: "coffee",
      active: true,
      lowStockOnly: true
    });

    expect(model.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "latte", $options: "i" } },
        { sku: { $regex: "latte", $options: "i" } }
      ],
      categoryId: "coffee",
      active: true,
      stockQuantity: { $lte: 5 }
    });
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(result.pageInfo).toEqual({
      page: 2,
      limit: 10,
      totalItems: 11,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true
    });
  });
});
