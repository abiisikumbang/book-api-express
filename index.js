const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const app = express();
const PORT = 3000;

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");
// const { use } = require("react");

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send(`
    <h1>Books</h1>
    <p><a href="/books">Books</a></p>
    <p><a href="/users">Users</a></p>
  `);
});
app.use("/books", bookRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
