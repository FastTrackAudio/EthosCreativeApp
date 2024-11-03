-- CreateTable
CREATE TABLE "ConceptCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConceptCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConceptCompletion_userId_idx" ON "ConceptCompletion"("userId");

-- CreateIndex
CREATE INDEX "ConceptCompletion_conceptId_idx" ON "ConceptCompletion"("conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptCompletion_userId_conceptId_key" ON "ConceptCompletion"("userId", "conceptId");

-- CreateIndex
CREATE INDEX "SectionCompletion_userId_idx" ON "SectionCompletion"("userId");

-- CreateIndex
CREATE INDEX "SectionCompletion_sectionId_idx" ON "SectionCompletion"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionCompletion_userId_sectionId_key" ON "SectionCompletion"("userId", "sectionId");

-- CreateIndex
CREATE INDEX "ProjectCompletion_userId_idx" ON "ProjectCompletion"("userId");

-- CreateIndex
CREATE INDEX "ProjectCompletion_projectId_idx" ON "ProjectCompletion"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCompletion_userId_projectId_key" ON "ProjectCompletion"("userId", "projectId");

-- CreateIndex
CREATE INDEX "QuizCompletion_userId_idx" ON "QuizCompletion"("userId");

-- CreateIndex
CREATE INDEX "QuizCompletion_quizId_idx" ON "QuizCompletion"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizCompletion_userId_quizId_key" ON "QuizCompletion"("userId", "quizId");

-- AddForeignKey
ALTER TABLE "ConceptCompletion" ADD CONSTRAINT "ConceptCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptCompletion" ADD CONSTRAINT "ConceptCompletion_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionCompletion" ADD CONSTRAINT "SectionCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionCompletion" ADD CONSTRAINT "SectionCompletion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCompletion" ADD CONSTRAINT "ProjectCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCompletion" ADD CONSTRAINT "ProjectCompletion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizCompletion" ADD CONSTRAINT "QuizCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizCompletion" ADD CONSTRAINT "QuizCompletion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
