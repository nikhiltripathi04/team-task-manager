import request from "supertest";
import app from "../src/app";
import * as dbHandler from "./setup";

const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clear());
afterAll(async () => await dbHandler.close());

describe("Auth Module: Production Scenarios", () => {
  it("HAPPY PATH: should register and return token", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });

  it("FAILURE: should not register with existing email", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(400);
  });

  it("FAILURE: should fail login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("FAILURE: should not login non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(401);
  });
});
