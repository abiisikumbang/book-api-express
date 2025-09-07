const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const redis = require("../redisClient");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: "USER",
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json({ message: "Berhasil membuat akun", user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan Password harus tersedia" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Email tidak ditemukan" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ message: "Password tidak sesuai" });

    // Buat token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    // Simpan refresh token di Redis (hashed atau plain, sesuai kebutuhan) //jalankan diterminal untuk cek refreshToken
    // docker exec -it redis redis-cli
    await redis.set(
      `auth:refresh:user:${user.id}`, //auth:refresh:user: adalah prefix untuk key di Redis
      refreshToken,
      "EX", // Set expiry time
      60 * 60 * 24 * 7 // 7 days in seconds
    );

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token diperlukan" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Refresh token tidak valid" });
    }

    const storedToken = await redis.get(`auth:refresh:user:${payload.userId}`);
    if (!storedToken)
      return res.status(403).json({ message: "Refresh token tidak ditemukan" });

    if (storedToken !== refreshToken)
      return res.status(403).json({ message: "Refresh token tidak valid" });

    // Generate token baru
    const newAccessToken = jwt.sign(
      { userId: payload.userId, role: payload.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { userId: payload.userId, role: payload.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Ganti token di Redis
    await redis.set(
      `auth:refresh:user:${payload.userId}`,
      newRefreshToken,
      "EX",
      60 * 60 * 24 * 7
    );

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await redis.del(`auth:refresh:user:${userId}`);
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    next(err);
  }
};
