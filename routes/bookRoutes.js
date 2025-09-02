const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { validateBook } = require('../middlewares/validateRequest');
const authenticate = require('../middlewares/auth');

// Routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', authenticate, validateBook, bookController.createBook);
router.put('/:id', authenticate, validateBook, bookController.updateBook);
router.delete('/:id', authenticate, bookController.deleteBook);

module.exports = router;