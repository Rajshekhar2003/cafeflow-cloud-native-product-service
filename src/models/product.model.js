import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "SKU must contain at least 3 characters"],
      maxlength: [30, "SKU must contain at most 30 characters"],
      match: [/^[A-Z0-9-]+$/, "SKU contains invalid characters"]
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [120, "Product name must contain at most 120 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must contain at most 500 characters"],
      default: ""
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be an integer"
      }
    },
    categoryId: {
      type: String,
      required: [true, "Category ID is required"],
      trim: true,
      maxlength: [64, "Category ID must contain at most 64 characters"],
      index: true
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    collection: "products",
    timestamps: true,
    versionKey: false
  }
);

productSchema.index({ name: 1 });
productSchema.index({ categoryId: 1, active: 1 });
productSchema.index({ stockQuantity: 1 });

export const Product =
  mongoose.models.Product ?? mongoose.model("Product", productSchema);
