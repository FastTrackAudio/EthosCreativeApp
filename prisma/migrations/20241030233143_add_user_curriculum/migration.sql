/*
  Warnings:

  - You are about to drop the column `availableFrom` on the `UserCurriculum` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `UserCurriculum` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,courseId,conceptId]` on the table `UserCurriculum` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `UserCurriculum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekId` to the `UserCurriculum` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserCurriculum_userId_conceptId_key";

-- DropIndex
DROP INDEX "UserCurriculum_userId_idx";

-- AlterTable
ALTER TABLE "UserCurriculum" DROP COLUMN "availableFrom",
DROP COLUMN "completed",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weekId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "UserCurriculum_userId_courseId_idx" ON "UserCurriculum"("userId", "courseId");

-- CreateIndex
CREATE INDEX "UserCurriculum_courseId_idx" ON "UserCurriculum"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCurriculum_userId_courseId_conceptId_key" ON "UserCurriculum"("userId", "courseId", "conceptId");

-- AddForeignKey
ALTER TABLE "UserCurriculum" ADD CONSTRAINT "UserCurriculum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
