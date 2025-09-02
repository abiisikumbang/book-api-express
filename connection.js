const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "00000",
  database: "book_api",
});

module.exports = db;

// const knex = require("knex")({
//   client: "mysql",
//   connection: {
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "book_api",
//   },
// });
// module.exports = knex;
