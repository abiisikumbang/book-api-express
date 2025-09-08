// logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info", // Tingkat logging minimum yang akan ditampilkan
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json() // Format log dalam bentuk JSON
  ),
  transports: [
    // Transport untuk menampilkan log di konsol
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Transport untuk menyimpan log ke dalam berkas
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

module.exports = logger;
