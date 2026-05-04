import request from "supertest";
import app from "../src/app";
import * as dbHandler from "./setup";

let adminToken: string;

beforeAll(async () => {
  await dbHandler.connect();
  // Create an admin for project tests
  const adminRes = await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
  });
  adminToken = adminRes.body.data.token;
});

afterAll(async () => await dbHandler.close());

describe("Project Module: Security & RBAC", () => {
  it("HAPPY PATH: admin creates a project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Global Strategy" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Global Strategy");
  });

  it("FAILURE: block project creation without token", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "Invisible Project" });

    expect(res.statusCode).toBe(401);
  });

  it("FAILURE: block project creation with malformed token", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer invalid-token`)
      .send({ name: "Hacked Project" });

    expect(res.statusCode).toBe(401);
  });

  it("FAILURE: block member from creating project (RBAC)", async () => {
    const memberRes = await request(app).post("/api/auth/register").send({
      name: "Standard Member",
      email: "member@test.com",
      password: "password123",
      role: "member",
    });
    const memberToken = memberRes.body.data.token;

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ name: "Unauthorized Project" });

    expect(res.statusCode).toBe(403);
  });
});
