const request = require("supertest");
const app = require("../../app");
const redis = require("../../redisClient");

let adminToken;
let userToken;
let createdUserId;

beforeAll(async () => {
  // login as admin
  const adminRes = await request(app).post("/auth/login").send({
    email: "admin123@gmail",
    password: "12345678",
  });
  adminToken = adminRes.body.accessToken;

  // login as normal user
  const userRes = await request(app).post("/auth/login").send({
    email: "tes01@gmail.com",
    password: "12345678",
  });
  userToken = userRes.body.accessToken;
});

afterAll(async () => {
  await redis.quit();
});

describe("Users API", () => {
  // GET ALL USERS
  it("should get all users", async () => {
    const res = await request(app).get("/users");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            email: expect.any(String),
            role: expect.any(String),
          }),
        ]),
        meta: expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      })
    );
  });

  // GET BY ID (self or admin)
  it("should get user by ID", async () => {
    const res = await request(app)
      .get("/users/1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email");
  });

  // CREATE USER (admin only)
  it("should create a new user (admin)", async () => {
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "TestUser",
        email: "testuser@example.com",
        password: "12345678",
        role: "USER",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdUserId = res.body.id;
  });

  // UPDATE USER
  it("should update user data", async () => {
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "UpdatedUser",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("UpdatedUser");
  });

  // DELETE USER (admin only)
  it("should delete user", async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
