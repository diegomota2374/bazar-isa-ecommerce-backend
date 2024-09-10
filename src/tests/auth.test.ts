import request from "supertest";
import app from "../index";

describe("Authentication API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
  });
});
