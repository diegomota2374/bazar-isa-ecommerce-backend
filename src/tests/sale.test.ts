// tests/sale.test.ts
import request from "supertest";
import app from "../index";
import { Sale } from "../models/sale.model";
import { Product } from "../models/product.model";
import { Client } from "../models/client.model";

describe("Sale Controller Tests", () => {
  let saleId: string;
  let clientId: string;
  let productId: string;

  beforeAll(async () => {
    // Clear collections
    await Sale.deleteMany({});
    await Product.deleteMany({});
    await Client.deleteMany({});

    // Create a client and a product
    const client = await new Client({
      name: "Test Client",
      email: "client@example.com",
      phoneNumber: "1234567890",
    }).save();

    const product = await new Product({
      name: "Test Product",
      description: "This is a test product.",
      status: "available",
      category: "Electronics",
      state: "New",
      price: 99.99,
      discount: 10,
    }).save();
  });

  it("should create a new sale", async () => {
    const res = await request(app).post("/api/sales").send({
      clientId,
      productId,
      saleDate: new Date().toISOString(),
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("clientId", clientId);
    expect(res.body).toHaveProperty("productId", productId);
    saleId = res.body._id; // Save the sale ID for later tests
  });

  it("should fetch all sales", async () => {
    const res = await request(app).get("/api/sales");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should fetch a sale by ID", async () => {
    const res = await request(app).get(`/api/sales/${saleId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("clientId", clientId);
    expect(res.body).toHaveProperty("productId", productId);
  });

  it("should update a sale by ID", async () => {
    const res = await request(app).put(`/api/sales/${saleId}`).send({
      saleDate: new Date().toISOString(),
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("saleDate");
  });

  it("should delete a sale by ID", async () => {
    const res = await request(app).delete(`/api/sales/${saleId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Sale deleted successfully");
  });
});
