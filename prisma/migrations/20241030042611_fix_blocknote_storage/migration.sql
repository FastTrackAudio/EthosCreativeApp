-- AlterTable
ALTER TABLE "Concept" ADD COLUMN     "attachments" JSONB DEFAULT '[]',
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "blocks" JSONB DEFAULT '[]',
ADD COLUMN     "metadata" JSONB DEFAULT '{"version":1,"editorConfig":{"defaultStyles":{},"customStyles":[]}}',
ADD COLUMN     "resources" JSONB DEFAULT '[]',
ALTER COLUMN "content" SET DEFAULT '[]';
