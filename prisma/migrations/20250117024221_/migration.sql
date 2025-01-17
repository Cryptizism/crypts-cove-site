/*
  Warnings:

  - You are about to drop the `_ResultToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_ResultToUser_B_index";

-- DropIndex
DROP INDEX "_ResultToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ResultToUser";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Result" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shape" TEXT NOT NULL,
    "attemptDate" DATETIME NOT NULL,
    "success" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Result" ("attemptDate", "id", "shape", "success") SELECT "attemptDate", "id", "shape", "success" FROM "Result";
DROP TABLE "Result";
ALTER TABLE "new_Result" RENAME TO "Result";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
