const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { validateBook } = require("../middlewares/validateRequest");
const auth = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Endpoints untuk mengelola buku
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Ambil semua buku dengan pagination, filter, dan sorting
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *       - in: query
 *         name: published_year
 *         schema: { type: integer }
 *       - in: query
 *         name: sort_by
 *         schema: { type: string, enum: [id, title, author, published_year] }
 *       - in: query
 *         name: sort_order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Daftar buku
 */

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Ambil detail buku berdasarkan ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail buku
 *       404:
 *         description: Buku tidak ditemukan
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Tambah buku baru (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - published_year
 *               - isbn
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               published_year: { type: integer }
 *               isbn: { type: string }
 *     responses:
 *       201:
 *         description: Buku berhasil dibuat
 */

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update buku berdasarkan ID (Admin only)
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               published_year: { type: integer }
 *               isbn: { type: string }
 *     responses:
 *       200:
 *         description: Buku berhasil diperbarui
 *       404:
 *         description: Buku tidak ditemukan
 */

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Hapus buku berdasarkan ID (Admin only)
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Buku berhasil dihapus
 *       404:
 *         description: Buku tidak ditemukan
 */


// Routes
router.get("/", bookController.getAllBooks);

router.get("/:id", bookController.getBookById);
router.post(
  "/",
  auth.authenticate,
  auth.authorize("ADMIN"),
  validateBook,
  bookController.createBook
);
router.put(
  "/:id",
  auth.authenticate,
  auth.authorize("ADMIN"),
  validateBook,
  bookController.updateBook
);
router.delete(
  "/:id",
  auth.authenticate,
  auth.authorize("ADMIN"),
  bookController.deleteBook
);

module.exports = router;

