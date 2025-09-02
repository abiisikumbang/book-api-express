const { body, validationResult } = require("express-validator");

const validateBook = [
  // Rules for 'title'
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),

  // Rules for 'author'
  body("author")
    .notEmpty()
    .withMessage("Author is required")
    .isLength({ min: 3 })
    .withMessage("Author must be at least 3 characters long"),

  body("isbn")
    .notEmpty()
    .withMessage("ISBN is required")
    .isLength({ min: 10, max: 13 })
    .withMessage("ISBN must be between 10 and 13 characters long"),

  body("published_year")
    .notEmpty()
    .withMessage("Published year is required")
    .isNumeric()
    .withMessage("Published year must be a number")
    .isLength({ min: 4, max: 4 })
    .withMessage("Published year must be 4 digits long"),

  // Middleware to handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Create a structured error object
      const errorResponse = errors.array().map((err) => ({
        field: err.path, // Use err.path to get the field name
        message: err.msg,
      }));

      // Send the structured error response
      return res.status(400).json({ errors: errorResponse });
    }
    next();
  },
];

const validateUser = [
  // Rules for 'name'
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  // Rules for 'email'
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),

  // Rules for 'password'
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  // Middleware to handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Create a structured error object
      const errorResponse = errors.array().map((err) => ({
        field: err.path, // Use err.path to get the field name
        message: err.msg,
      }));

      // Send the structured error response
      return res.status(400).json({ errors: errorResponse });
    }
    next();
  },
];

module.exports = { validateBook, validateUser };
