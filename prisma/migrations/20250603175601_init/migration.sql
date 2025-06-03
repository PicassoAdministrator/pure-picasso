/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SystemLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserPermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserRolePermission` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "SystemLog" DROP CONSTRAINT "SystemLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRolePermission" DROP CONSTRAINT "UserRolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "UserRolePermission" DROP CONSTRAINT "UserRolePermission_roleId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Account_id_seq";

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Session_id_seq";

-- AlterTable
ALTER TABLE "SystemLog" DROP CONSTRAINT "SystemLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "entityId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SystemLog_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ALTER COLUMN "invitedByUserId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdByUserId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserPermission_id_seq";

-- AlterTable
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdByUserId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserRole_id_seq";

-- AlterTable
ALTER TABLE "UserRolePermission" DROP CONSTRAINT "UserRolePermission_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ALTER COLUMN "permissionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserRolePermission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserRolePermission_id_seq";

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Company',
    "logo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "websiteURL" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currencyFormat" TEXT NOT NULL DEFAULT '$ {value}',
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialLinkedIn" TEXT,
    "socialPinterest" TEXT,
    "socialYoutube" TEXT,
    "notifyStockEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyStockWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "notifyStockRoleIds" TEXT[],
    "notifyNewOrderEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrderWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrderRoleIds" TEXT[],
    "notifyOrderStatusUpdateEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderStatusUpdateWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderStatusUpdateRoleIds" TEXT[],
    "notifyPaymentFailureEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyPaymentFailureWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyPaymentFailureRoleIds" TEXT[],
    "notifySystemErrorFailureEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemErrorWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemErrorRoleIds" TEXT[],

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "UserPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
