const request = require("supertest");
const app = require("../../app");
const redis = require("../../redisClient");

let adminToken;
let userToken;
let createdBookId;

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

describe("Books API", () => {
  // GET ALL BOOKS
  it("should get all books", async () => {
    const res = await request(app).get("/books");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            author: expect.any(String),
            id: expect.any(Number),
            isbn: expect.any(String),
            published_year: expect.any(Number),
            title: expect.any(String),
            userId: expect.any(Number),
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

  // GET BOOK BY ID
  it("should get book by ID", async () => {
    const res = await request(app).get("/books/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        author: expect.any(String),
        id: expect.any(Number),
        isbn: expect.any(String),
        published_year: expect.any(Number),
        title: expect.any(String),
        userId: expect.any(Number),
      })
    );
  });
  // CREATE BOOK (admin only)
  it("should create a new book (admin)", async () => {
    const newBook = {
      title: "New Book Title",
      author: "New Book Author",
      isbn: "1234567890",
      published_year: 2023,
    };

    const res = await request(app)
      .post("/books")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newBook);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        author: expect.any(String),
        id: expect.any(Number),
        isbn: expect.any(String),
        published_year: expect.any(Number),
        title: expect.any(String),
      })
    );
    createdBookId = res.body.id;
  });
  // UPDATE BOOK (admin only)
  it("should update book data (admin)", async () => {
    const updatedData = {
      title: "Updated Book Title",
    };

    const res = await request(app)
      .put(`/books/${createdBookId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        author: expect.any(String),
        id: expect.any(Number),
        isbn: expect.any(String),
        published_year: expect.any(Number),
        title: expect.any(String),
      })
    );
  });

  // DELETE BOOK (admin only)
  it("should delete book (admin)", async () => {
    const res = await request(app)
      .delete(`/books/${createdBookId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
  });
});
