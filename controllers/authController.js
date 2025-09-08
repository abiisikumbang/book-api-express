const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const logger = require("./config/logger");

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
    logger.info(`User created: ${user.name} ${user.email}`);
    res.status(201).json({ message: "Berhasil membuat akun", user });
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.info("Login failed: Email and Password are required");
      return res
        .status(400)
        .json({ message: "Email dan Password harus tersedia" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.info(`Login failed: User not found ${email}`);
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logger.info(`Login failed: Invalid password ${email}`);
      return res.status(401).json({ message: "Password tidak sesuai" });
    }

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
    // Simpan refresh token di Redis (hashed atau plain, sesuai kebutuhan)
    await redis.set(
      `auth:refresh:user:${user.id}`, //auth:refresh:user: adalah prefix untuk key di Redis
      refreshToken,
      "EX", // Set expiry time
      60 * 60 * 24 * 7 // 7 days in seconds
    );

    logger.info(`Login successful: ${user.name} ${user.email}`);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.info("Refresh token failed: Refresh token is required");
      return res.status(401).json({ message: "Refresh token diperlukan" });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      logger.info("Refresh token failed: Invalid refresh token");
      return res.status(403).json({ message: "Refresh token tidak valid" });
    }

    const storedToken = await redis.get(`auth:refresh:user:${payload.userId}`);
    if (!storedToken) {
      logger.info(
        `Refresh token failed: Refresh token not found ${payload.userId}`
      );
      return res.status(403).json({ message: "Refresh token tidak ditemukan" });
    }

    if (storedToken !== refreshToken) {
      logger.info(
        `Refresh token failed: Refresh token tidak valid ${payload.userId}`
      );
      return res.status(403).json({ message: "Refresh token tidak valid" });
    }

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

    logger.info(`Refresh token successful: ${payload.userId}`);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    logger.error(err);
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await redis.del(`auth:refresh:user:${userId}`);
    logger.info(`Logout successful: ${userId}`);
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    logger.error(err);
    next(err);
  }
};
