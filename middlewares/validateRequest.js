const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");

const validateAuth = [
  // Rules for 'name'
  body("name")
    .notEmpty()
    .withMessage("Nama tidak boleh kosong")
    .isLength({ min: 3 })
    .withMessage("Nama harus minimal 3 karakter"),

  // Rules for 'email'
  body("email")
    .notEmpty()
    .withMessage("Email tidak boleh kosong")
    .isEmail()
    .withMessage("Email tidak valid")
    .custom(async (value) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: value },
      });
      if (existingUser) {
        throw new Error("Email sudah terdaftar");
      }
      return true;
    }),

  // Rules for 'password' (tanpa hashing)
  body("password")
    .notEmpty()
    .withMessage("Password tidak boleh kosong")
    .isLength({ min: 8 })
    .withMessage("Password harus minimal 8 karakter"),

  // Middleware menangani hasil validasi
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Membuat objek kesalahan terstruktur
      const errorResponse = errors.array().map((err) => ({
        field: err.path, // Use err.path to get the field name
        message: err.msg,
      }));

      // Mengirim respons kesalahan terstruktur
      return res.status(400).json({ errors: errorResponse });
    }
    next();
  },
];

const validateBook = [
  // Aturan untuk 'title'
  body("title")
    .optional() // ✅ Jadikan opsional
    .notEmpty()
    .withMessage("Title tidak boleh kosong")
    .isLength({ min: 3 })
    .withMessage("Title harus minimal 3 karakter"),

  // Aturan untuk 'author'
  body("author")
    .optional() // ✅ Jadikan opsional
    .notEmpty()
    .withMessage("Author tidak boleh kosong")
    .isLength({ min: 3 })
    .withMessage("Author harus minimal 3 karakter"),

  // Aturan untuk 'isbn'
  body("isbn")
    .optional() // ✅ Jadikan opsional
    .notEmpty()
    .withMessage("ISBN tidak boleh kosong")
    .isLength({ min: 3, max: 13 })
    .withMessage("ISBN harus antara 3 dan 13 karakter")
    .custom(async (value, { req }) => {
      const bookId = req.params.bookId;
      const existingBook = await prisma.book.findFirst({
        where: {
          isbn: value,
          id: {
            not: bookId,
          },
        },
      });
      if (existingBook) {
        throw new Error("ISBN sudah tersedia");
      }
      return true;
    }),

  // Aturan untuk 'published_year'
  body("published_year")
    .optional() // ✅ Jadikan opsional
    .notEmpty()
    .withMessage("Published year tidak boleh kosong")
    .isNumeric()
    .withMessage("Published year harus berupa angka")
    .isLength({ min: 4, max: 4 })
    .withMessage("Published year harus 4 digit"),

  // Middleware penanganan hasil validasi
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));
      return res.status(400).json({ errors: errorResponse });
    }
    next();
  },
];

const validateUser = [
  // Rules for 'name'
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Nama tidak boleh kosong")
    .isLength({ min: 3 })
    .withMessage("Nama harus minimal 3 karakter"),

  // Rules for 'email'
  body("email")
    .optional()
    .notEmpty()
    .withMessage("Email tidak boleh kosong")
    .isEmail()
    .withMessage("Email tidak valid")
    .custom(async (value, { req }) => {
      // Dapatkan ID pengguna dari URL
      const userId = req.params.id;

      // Periksa apakah ada pengguna lain dengan email yang sama
      // Gunakan findFirst dan operator 'not' untuk mengecualikan pengguna saat ini
      const existingUser = await prisma.user.findFirst({
        where: {
          email: value,
          id: {
            not: userId, // email 
          },
        },
      });

      if (existingUser) {
        throw new Error("Email sudah terdaftar");
      }
      return true;
    }),

  //Rules for 'role'
  body("role")
    .optional()
    .isIn(["USER", "ADMIN"])
    .withMessage("Role tidak valid"),

  // Rules for 'password' (tanpa hashing)
  body("password")
    .optional() // ✅ Menjadikan password opsional
    .isLength({ min: 8 })
    .withMessage("Password harus minimal 8 karakter"),

  // Middleware untuk menangani hasil validasi
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));
      return res.status(400).json({ errors: errorResponse });
    }
    next();
  },
];

module.exports = { validateAuth, validateBook, validateUser };
