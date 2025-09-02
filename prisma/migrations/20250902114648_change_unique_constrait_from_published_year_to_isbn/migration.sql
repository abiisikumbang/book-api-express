/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Book_published_year_key` ON `book`;

-- CreateIndex
CREATE UNIQUE INDEX `Book_isbn_key` ON `Book`(`isbn`);
