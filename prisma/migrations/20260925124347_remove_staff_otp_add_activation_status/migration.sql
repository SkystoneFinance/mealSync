/*
  Warnings:

  - You are about to drop the `StaffOtp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StaffOtp" DROP CONSTRAINT "StaffOtp_staffId_fkey";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "hasActivedAccount" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "StaffOtp";
