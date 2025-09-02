const express = require("express");
const router = express.Router();
const { validateUser } = require("../middlewares/validateRequest");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/auth");

//router
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", validateUser, userController.createUser);
router.put("/:id", validateUser, userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
