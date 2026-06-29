/*
  Warnings:

  - You are about to drop the column `formTemplateId` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `formTemplateSlug` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_formTemplateId_fkey";

-- DropIndex
DROP INDEX "Submission_formTemplateId_createdAt_idx";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "formTemplateId",
ADD COLUMN     "formTemplateSlug" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Submission_formTemplateSlug_createdAt_idx" ON "Submission"("formTemplateSlug", "createdAt");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_formTemplateSlug_fkey" FOREIGN KEY ("formTemplateSlug") REFERENCES "FormTemplate"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
