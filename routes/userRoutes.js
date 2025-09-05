const express = require("express");
const router = express.Router();
const { validateUser } = require("../middlewares/validateRequest");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints untuk mengelola user
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Ambil semua user dengan pagination & filter
 *     tags: [Users]
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
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - in: query
 *         name: sort_by
 *         schema: { type: string, enum: [id, name, email, role] }
 *       - in: query
 *         name: sort_order
 *         schema: { type: string, enum: [asc, desc], default: asc }     
 *     responses:
 *       200:
 *         description: Daftar user
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Ambil detail user berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail user ditemukan
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Tambah user baru (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user berdasarkan ID (Admin only)
 *     tags: [Users]
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
 *               name: { type: string }
 *               email: { type: string }
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Hapus user berdasarkan ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */


//router
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", auth.authenticate, auth.authorize("ADMIN"), validateUser, userController.createUser);
router.put("/:id", auth.authenticate, auth.authorize("ADMIN"), validateUser, userController.updateUser);
router.delete("/:id", auth.authenticate, auth.authorize("ADMIN"), userController.deleteUser);

module.exports = router;
