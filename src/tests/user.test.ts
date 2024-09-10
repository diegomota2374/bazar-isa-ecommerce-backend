// tests/user.test.ts
import request from "supertest";
import app from "../index";
import { User } from "../models/user.model";

describe("User Controller Tests", () => {
  let userId: string;
  let authToken: string;

  beforeAll(async () => {
    // Clear users collection
    await User.deleteMany({});

    // Create a user
    const user = await new User({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    }).save();
  });

  it("should create a new user", async () => {
    const res = await request(app).post("/api/users").send({
      name: "New User",
      email: "newuser@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
  });

  it("should authenticate a user and return a token", async () => {
    const res = await request(app).post("/api/auth").send({
      email: "testuser@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    authToken = res.body.token;
  });

  it("should fetch all users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should fetch a user by ID", async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", userId);
  });

  it("should update a user by ID", async () => {
    const res = await request(app).put(`/api/users/${userId}`).send({
      name: "Updated User",
      password: "newpassword123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated User");
  });

  it("should delete a user by ID", async () => {
    const res = await request(app).delete(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted successfully");
  });
});
