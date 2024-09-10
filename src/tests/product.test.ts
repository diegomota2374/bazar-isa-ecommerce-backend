// tests/product.test.ts
import request from "supertest";
import app from "../index";
import { Product } from "../models/product.model";

describe("Product Controller Tests", () => {
  let productId: string;

  beforeAll(async () => {
    await Product.deleteMany({}); // Clear the collection before tests
  });

  it("should create a new product", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Test Product",
      description: "This is a test product.",
      status: "available",
      category: "Electronics",
      state: "New",
      price: 99.99,
      discount: 10,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("name", "Test Product");
    productId = res.body._id; // Save the product ID for later tests
  });

  it("should fetch all products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should fetch a product by ID", async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Test Product");
  });

  it("should update a product by ID", async () => {
    const res = await request(app).put(`/api/products/${productId}`).send({
      name: "Updated Product",
      price: 89.99,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Product");
  });

  it("should delete a product by ID", async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Product deleted successfully");
  });
});
