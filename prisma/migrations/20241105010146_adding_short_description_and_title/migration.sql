/*
  Warnings:

  - A unique constraint covering the columns `[artistPageUrl]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Concept" ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "shortTitle" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_artistPageUrl_key" ON "User"("artistPageUrl");
