/*
  Warnings:

  - You are about to drop the `AccountSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountSession" DROP CONSTRAINT "AccountSession_accountId_fkey";

-- DropTable
DROP TABLE "AccountSession";
