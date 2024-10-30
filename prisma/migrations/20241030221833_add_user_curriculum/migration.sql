-- CreateTable
CREATE TABLE "UserCurriculum" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCurriculum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCurriculum_userId_idx" ON "UserCurriculum"("userId");

-- CreateIndex
CREATE INDEX "UserCurriculum_conceptId_idx" ON "UserCurriculum"("conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCurriculum_userId_conceptId_key" ON "UserCurriculum"("userId", "conceptId");

-- AddForeignKey
ALTER TABLE "UserCurriculum" ADD CONSTRAINT "UserCurriculum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCurriculum" ADD CONSTRAINT "UserCurriculum_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
