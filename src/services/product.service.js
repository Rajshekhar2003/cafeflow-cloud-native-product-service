import { Product } from "../models/product.model.js";
import { conflict, notFound } from "../utils/errors.js";
import {
  escapeRegularExpression,
  normalizeCreateProductInput,
  normalizeListOptions,
  normalizeStockQuantity,
  normalizeUpdateProductInput,
  validateObjectId
} from "../utils/validation.js";

export function createProductService(
  ProductModel = Product,
  { lowStockThreshold = 5 } = {}
) {
  async function createProduct(input) {
    const productData = normalizeCreateProductInput(input);
    const existingProduct = await ProductModel.findOne({
      sku: productData.sku
    });

    if (existingProduct) {
      throw conflict("A product with this SKU already exists", "sku");
    }

    return ProductModel.create(productData);
  }

  async function getProductById(id) {
    validateObjectId(id);
    const product = await ProductModel.findById(id);

    if (!product) {
      throw notFound("Product", id);
    }

    return product;
  }

  async function getProductBySku(sku) {
    const normalizedSku = String(sku).trim().toUpperCase();
    const product = await ProductModel.findOne({ sku: normalizedSku });

    if (!product) {
      throw notFound("Product", normalizedSku);
    }

    return product;
  }

  async function listProducts(options) {
    const normalized = normalizeListOptions(options);
    const filter = {};

    if (normalized.search) {
      const safeSearch = escapeRegularExpression(normalized.search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { sku: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (normalized.categoryId) {
      filter.categoryId = normalized.categoryId;
    }

    if (normalized.active !== undefined && normalized.active !== null) {
      filter.active = normalized.active;
    }

    if (normalized.lowStockOnly) {
      filter.stockQuantity = { $lte: lowStockThreshold };
    }

    const skip = (normalized.page - 1) * normalized.limit;
    const sort = {
      [normalized.sortBy]: normalized.sortDirection,
      _id: normalized.sortDirection
    };

    const [items, totalItems] = await Promise.all([
      ProductModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(normalized.limit)
        .exec(),
      ProductModel.countDocuments(filter)
    ]);

    return {
      items,
      pageInfo: {
        page: normalized.page,
        limit: normalized.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / normalized.limit),
        hasNextPage: skip + items.length < totalItems,
        hasPreviousPage: normalized.page > 1
      }
    };
  }

  async function updateProduct(id, input) {
    validateObjectId(id);
    const updates = normalizeUpdateProductInput(input);
    const product = await ProductModel.findById(id);

    if (!product) {
      throw notFound("Product", id);
    }

    if (updates.sku && updates.sku !== product.sku) {
      const duplicate = await ProductModel.findOne({
        sku: updates.sku,
        _id: { $ne: id }
      });

      if (duplicate) {
        throw conflict("A product with this SKU already exists", "sku");
      }
    }

    Object.assign(product, updates);
    return product.save();
  }

  async function updateProductStock(id, stockQuantity) {
    validateObjectId(id);
    const normalizedStock = normalizeStockQuantity(stockQuantity);
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { stockQuantity: normalizedStock } },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw notFound("Product", id);
    }

    return product;
  }

  async function updateProductStatus(id, active) {
    validateObjectId(id);
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { active } },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw notFound("Product", id);
    }

    return product;
  }

  async function deleteProduct(id) {
    validateObjectId(id);
    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      throw notFound("Product", id);
    }

    return {
      success: true,
      message: "Product deleted successfully",
      deletedId: id
    };
  }

  return Object.freeze({
    createProduct,
    getProductById,
    getProductBySku,
    listProducts,
    updateProduct,
    updateProductStock,
    updateProductStatus,
    deleteProduct
  });
}

export const productService = createProductService();
