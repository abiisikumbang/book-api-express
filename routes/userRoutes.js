const express = require("express");
const router = express.Router();
const { validateUser } = require("../middlewares/validateRequest");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

//router
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", auth.authenticate, auth.authorize("ADMIN"), validateUser, userController.createUser);
router.put("/:id", auth.authenticate, auth.authorize("ADMIN"), validateUser, userController.updateUser);
router.delete("/:id", auth.authenticate, auth.authorize("ADMIN"), userController.deleteUser);

module.exports = router;
