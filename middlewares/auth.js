const jwt = require('jsonwebtoken');
const JWT_SECRET = "supersecretkey";

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Akses ditolak' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verifikasi gagal:', err);
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    req.user = user;
    console.log('Decoded user:', req.user);
    next();
  });
}

module.exports = authenticate;
