/*
  Warnings:

  - The values [SELECT] on the enum `FieldType` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'AFTER', 'REJECTED', 'ACEPTED');

-- AlterEnum
BEGIN;
CREATE TYPE "FieldType_new" AS ENUM ('TEXT', 'EMAIL', 'NUMBER', 'CHECKBOX', 'RADIO', 'TEXTAREA', 'DATE');
ALTER TABLE "FormQuestions" ALTER COLUMN "type" TYPE "FieldType_new" USING ("type"::text::"FieldType_new");
ALTER TYPE "FieldType" RENAME TO "FieldType_old";
ALTER TYPE "FieldType_new" RENAME TO "FieldType";
DROP TYPE "public"."FieldType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "status",
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW';

-- DropEnum
DROP TYPE "LeadStute";
