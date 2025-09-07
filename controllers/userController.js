const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      name,
      email,
      sort_by,
      sortBy, 
      sort_order,
      order, 
    } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (name) {
      where.name = { contains: name };
    }
    if (email) {
      where.email = { contains: email };
    }

    // Ambil field sorting, support snake_case & camelCase
    const sortField = sort_by || sortBy || "id"; // default: id
    const sortDir = (sort_order || order || "asc").toLowerCase();

    // Bangun orderBy dinamis
    const orderBy = {};
    orderBy[sortField] = sortDir === "desc" ? "desc" : "asc";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (!user) return next({ status: 404, message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: req.body.role || "USER",
        password: hashedPassword,
      },
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const dataToUpdate = {};

    // Tambahkan hanya kolom yang ada di body ke objek dataToUpdate
    if (name) {
      dataToUpdate.name = name;
    }
    if (email) {
      dataToUpdate.email = email;
    }
    if (role) {
      dataToUpdate.role = role;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    // Periksa apakah ada data untuk di-update
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: "No data provided to update." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      message: "User berhasil dihapus",
      data: deletedUser,
    });
  } catch (err) {
    next(err);
  }
};
