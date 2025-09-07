// app.js
const express = require("express");
const app = express();

app.use(express.json());

// contoh routes
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/users", userRoutes);

module.exports = app;
