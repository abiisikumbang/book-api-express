const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header invalid" });
  }
  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Akses ditolak" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token kadaluarsa" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Token tidak valid" });
      }
      console.error("Token verifikasi gagal:", err);
      return res.status(403).json({ message: "Token tidak valid" });
    }
    req.user = decoded;
    next();
  });
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Anda tidak memiliki izin" });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
