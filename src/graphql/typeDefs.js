export const typeDefs = `#graphql
  scalar DateTime

  enum ProductSortField {
    CREATED_AT
    UPDATED_AT
    NAME
    PRICE
    STOCK_QUANTITY
  }

  enum SortDirection {
    ASC
    DESC
  }

  enum InventoryStatus {
    IN_STOCK
    LOW_STOCK
    OUT_OF_STOCK
  }

  type Product {
    id: ID!
    sku: String!
    name: String!
    description: String!
    price: Float!
    stockQuantity: Int!
    categoryId: String!
    active: Boolean!
    inventoryStatus: InventoryStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PageInfo {
    page: Int!
    limit: Int!
    totalItems: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type ProductPage {
    items: [Product!]!
    pageInfo: PageInfo!
  }

  type DeleteProductResult {
    success: Boolean!
    message: String!
    deletedId: ID!
  }

  input CreateProductInput {
    sku: String!
    name: String!
    description: String
    price: Float!
    stockQuantity: Int!
    categoryId: String!
    active: Boolean
  }

  input UpdateProductInput {
    sku: String
    name: String
    description: String
    price: Float
    stockQuantity: Int
    categoryId: String
    active: Boolean
  }

  type Query {
    products(
      page: Int = 1
      limit: Int = 10
      sortBy: ProductSortField = CREATED_AT
      sortDirection: SortDirection = DESC
      search: String
      categoryId: String
      active: Boolean
      lowStockOnly: Boolean = false
    ): ProductPage!

    product(id: ID!): Product!
    productBySku(sku: String!): Product!
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    updateProductStock(id: ID!, stockQuantity: Int!): Product!
    updateProductStatus(id: ID!, active: Boolean!): Product!
    deleteProduct(id: ID!): DeleteProductResult!
  }
`;
