-- AlterTable
ALTER TABLE "UserCurriculum" ADD COLUMN "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Update existing records to be completed (since they were marked as complete in the old system)
UPDATE "UserCurriculum" SET "isCompleted" = true WHERE "id" IS NOT NULL; 