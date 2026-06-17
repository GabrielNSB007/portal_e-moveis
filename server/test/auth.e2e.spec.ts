import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";
import { AuthRoutes } from "../src/routes/AuthRoutes.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let app: any;
let token: string;
let userId: string;
const testUser = {
  email: "test@example.com",
  password: "test123456",
  name: "Test User",
};

describe("Auth Routes", () => {
  beforeAll(async () => {
    // Create express app with auth routes
    app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());
    
    const authRoutes = new AuthRoutes();
    app.use("/auth", authRoutes.router);
    
    // Clean up test data
    await prisma.offer.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.offer.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.offer.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
      token = response.body.token;
    });

    it("should fail with invalid email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "test123456",
          name: "Test User",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("issues");
    });

    it("should fail with short password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "123",
          name: "Test User",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("issues");
    });

    it("should fail when email already registered", async () => {
      // First registration
      await request(app)
        .post("/auth/register")
        .send(testUser);

      // Try to register same email
      const response = await request(app)
        .post("/auth/register")
        .send(testUser);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("já registrado");
    });

    it("should fail with missing name", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "test123456",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("issues");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post("/auth/register")
        .send(testUser);
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
      token = response.body.token;
    });

    it("should fail with invalid email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "wrong@example.com",
          password: testUser.password,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("inválidas");
    });

    it("should fail with wrong password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("inválidas");
    });

    it("should fail with invalid email format", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "invalid-email",
          password: testUser.password,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("issues");
    });
  });

  describe("GET /auth/profile", () => {
    beforeEach(async () => {
      // Create a user and login to get token
      const registerResponse = await request(app)
        .post("/auth/register")
        .send(testUser);

      token = registerResponse.body.token;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("name");
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      userId = response.body.id;
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get("/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("não fornecido");
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("inválido");
    });

    it("should fail without Bearer prefix", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", token);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PUT /auth/profile", () => {
    beforeEach(async () => {
      // Create a user and login to get token
      const registerResponse = await request(app)
        .post("/auth/register")
        .send(testUser);

      token = registerResponse.body.token;
    });

    it("should update user name successfully", async () => {
      const response = await request(app)
        .put("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Name",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Updated Name");
      expect(response.body.email).toBe(testUser.email);
    });

    it("should update user email successfully", async () => {
      const response = await request(app)
        .put("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "newemail@example.com",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("newemail@example.com");
    });

    it("should fail updating to duplicate email", async () => {
      // Create another user
      await request(app)
        .post("/auth/register")
        .send({
          email: "another@example.com",
          password: "password123456",
          name: "Another User",
        });

      // Try to update first user with second user's email
      const response = await request(app)
        .put("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "another@example.com",
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("error");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .put("/auth/profile")
        .send({
          name: "Updated Name",
        });

      expect(response.status).toBe(401);
    });

    it("should fail with invalid email format", async () => {
      const response = await request(app)
        .put("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "invalid-email",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("DELETE /auth/profile", () => {
    beforeEach(async () => {
      // Create a user and login to get token
      const registerResponse = await request(app)
        .post("/auth/register")
        .send(testUser);

      token = registerResponse.body.token;
    });

    it("should delete user successfully", async () => {
      const response = await request(app)
        .delete("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("deletado");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .delete("/auth/profile");

      expect(response.status).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .delete("/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should not be able to access deleted user", async () => {
      // Delete user
      await request(app)
        .delete("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      // Try to get profile with same token 
      // Note: The token is still valid but user doesn't exist
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });
});
