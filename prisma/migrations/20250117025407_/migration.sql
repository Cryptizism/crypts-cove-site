/*
  Warnings:

  - You are about to drop the column `finished` on the `Result` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Result" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shape" TEXT NOT NULL,
    "attemptDate" DATETIME NOT NULL,
    "success" BOOLEAN,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Result" ("attemptDate", "id", "shape", "success", "userId") SELECT "attemptDate", "id", "shape", "success", "userId" FROM "Result";
DROP TABLE "Result";
ALTER TABLE "new_Result" RENAME TO "Result";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
