/*
  Warnings:

  - A unique constraint covering the columns `[customUrl]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_customUrl_key" ON "User"("customUrl");