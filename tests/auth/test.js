const request = require("supertest");
const app = require("../../app");
const redis = require("../../redisClient");

describe("Auth API", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "abiitesting3",
        email: "abiitesting3@example.com",
        password: "12345678",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toMatch(/Berhasil membuat akun/);
    });

  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "abiitesting2@example.com", password: "12345678" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("should reject login with invalid password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "abiitesting2@example.com", password: "wrongpass" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Password tidak sesuai/);
  });

  it("should refresh token", async () => {
    // 1. Login dulu buat dapet refreshToken
    const loginRes = await request(app).post("/auth/login").send({
      email: "abiitesting2@example.com",
      password: "12345678",
    });

    const { refreshToken } = loginRes.body;

    // 2. Pake refreshToken untuk call refresh API
    const res = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });
});

afterAll(async () => {
  await redis.quit();
});
