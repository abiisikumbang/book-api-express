const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateAuth } = require('../middlewares/validateRequest');

router.post('/register', validateAuth, authController.register);
router.post('/login', authController.login);

module.exports = router;
