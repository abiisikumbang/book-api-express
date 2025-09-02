const express = require("express");
const router = express.Router();
const { validateUser } = require("../middlewares/validateRequest");
const userController = require("../controllers/userController");
const authenticate = require('../middlewares/auth');

//router
router.get("/", validateUser, userController.getAllUsers);
router.get("/:id", validateUser, userController.getUserById);
router.post("/", validateUser, userController.createUser);

module.exports = router;
