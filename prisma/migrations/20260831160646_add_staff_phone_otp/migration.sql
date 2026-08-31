/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StaffOtp" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffOtp_staffId_idx" ON "StaffOtp"("staffId");

-- CreateIndex
CREATE INDEX "StaffOtp_expiresAt_idx" ON "StaffOtp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_phoneNumber_key" ON "Staff"("phoneNumber");

-- AddForeignKey
ALTER TABLE "StaffOtp" ADD CONSTRAINT "StaffOtp_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
