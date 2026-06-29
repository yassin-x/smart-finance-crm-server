-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'EMAIL', 'NUMBER', 'SELECT', 'CHECKBOX', 'RADIO', 'TEXTAREA', 'DATE');

-- CreateEnum
CREATE TYPE "LeadStute" AS ENUM ('NEW', 'CONTACTED', 'AFTER', 'REJECTED', 'ACEPTED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyCode" TEXT,
    "verifyCodeExpiresAt" TIMESTAMP(3),
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "note" TEXT,
    "status" "LeadStute" NOT NULL DEFAULT 'NEW',
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormQuestions" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "order" INTEGER NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneRegistry" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "PhoneRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Account_createdAt_username_email_idx" ON "Account"("createdAt", "username", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_phone_key" ON "Lead"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_submissionId_key" ON "Lead"("submissionId");

-- CreateIndex
CREATE INDEX "Lead_phone_createdAt_idx" ON "Lead"("phone", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_slug_key" ON "FormTemplate"("slug");

-- CreateIndex
CREATE INDEX "FormTemplate_slug_createdAt_idx" ON "FormTemplate"("slug", "createdAt");

-- CreateIndex
CREATE INDEX "FormQuestions_formTemplateId_createdAt_idx" ON "FormQuestions"("formTemplateId", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_formTemplateId_createdAt_idx" ON "Submission"("formTemplateId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneRegistry_phoneNumber_key" ON "PhoneRegistry"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestions" ADD CONSTRAINT "FormQuestions_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
