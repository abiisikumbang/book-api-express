const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// fungsi untuk mendapatkan semua buku dengan pagination dan filtering
exports.getAllBooks = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      published_year,
      author,
      sort_by,
      sortBy, // alias camelCase
      sort_order,
      order, // alias camelCase
    } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
      ];
    }
    if (published_year) {
      const year = parseInt(published_year, 10);
      if (!isNaN(year)) {
        where.published_year = year;
      }
    }
    if (author) {
      where.author = { contains: author };
    }

    // Ambil field sorting, support snake_case & camelCase
    const sortField = sort_by || sortBy || "id"; // default: id
    const sortDir = (sort_order || order || "asc").toLowerCase();

    // Bangun orderBy dinamis
    const orderBy = {};
    orderBy[sortField] = sortDir === "desc" ? "desc" : "asc";

    const [books, total] = await Promise.all([
      prisma.book.findMany({ skip, take: limit, where, orderBy }),
      prisma.book.count({ where }),
    ]);

    res.json({
      data: books,
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

// fungsi untuk mendapatkan buku berdasarkan id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!book) return next({ status: 404, message: "Book not found" });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// fungsi untuk menambahkan buku baru
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, published_year, isbn } = req.body;
    const userId = req.user.userId;
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        published_year,
        isbn,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(201).json(newBook);
  } catch (err) {
    next(err);
  }
};

// fungsi untuk mengupdate buku berdasarkan id
exports.updateBook = async (req, res, next) => {
  try {
    const { title, author, published_year, isbn } = req.body;
    const userId = req.user.userId;
    const updatedBook = await prisma.book.update({
      where: {
        id: parseInt(req.params.id),
        userId: userId,
      },
      data: { title, author, published_year, isbn },
    });
    res.json(updatedBook);
  } catch (err) {
    if (err.code === "P2025")
      return next({
        status: 404,
        message: "Book not found or you don't have permission to update it.",
      });
    next(err);
  }
};

// fungsi untuk menghapus buku berdasarkan id
exports.deleteBook = async (req, res, next) => {
  try {
    const deletedBook = await prisma.book.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({
      message: "Book deleted successfully",
      data: deletedBook,
    });
  } catch (err) {
    if (err.code === "P2025")
      return next({ status: 404, message: "Book not found" });
    next(err);
  }
};
