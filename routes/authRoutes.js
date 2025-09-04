const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateAuth } = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');

router.post('/register', validateAuth, authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate ,authController.logout);

module.exports = router;
