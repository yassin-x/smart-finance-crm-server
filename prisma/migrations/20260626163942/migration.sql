/*
  Warnings:

  - You are about to drop the column `options` on the `FormQuestions` table. All the data in the column will be lost.
  - Added the required column `desc` to the `FormQuestions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormQuestions" DROP COLUMN "options",
ADD COLUMN     "desc" TEXT NOT NULL,
ADD COLUMN     "rules" JSONB;
