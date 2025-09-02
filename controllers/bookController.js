const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// fungsi untuk mendapatkan semua buku dengan pagination dan filtering
exports.getAllBooks = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const where = search ? { title: { contains: search } } : {};

    const [books, total] = await Promise.all([
      prisma.book.findMany({ skip, take: limit, where }),
      prisma.book.count({ where }),
    ]);

    res.json({
      total,
      page,
      limit,
      data: books,
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
    const { 
      title,
      author, 
      published_year, 
      isbn

    } = req.body;
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
    res.json(deletedBook);
  } catch (err) {
    if (err.code === "P2025")
      return next({ status: 404, message: "Book not found" });
    next(err);
  }
};
