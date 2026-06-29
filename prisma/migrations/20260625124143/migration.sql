/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `FormQuestions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FormQuestions_name_key" ON "FormQuestions"("name");
