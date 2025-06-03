/*
  Warnings:

  - The `entityId` column on the `SystemLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SystemLog" DROP COLUMN "entityId",
ADD COLUMN     "entityId" BIGINT;
