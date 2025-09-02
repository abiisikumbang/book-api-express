const jwt = require('jsonwebtoken');
const JWT_SECRET = "supersecretkey";

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    console.log('Decoded user:', req.user);
    next();
  });
}

module.exports = authenticate;
