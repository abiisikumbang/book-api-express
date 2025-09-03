const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { validateBook } = require("../middlewares/validateRequest");
const auth = require("../middlewares/auth");

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
