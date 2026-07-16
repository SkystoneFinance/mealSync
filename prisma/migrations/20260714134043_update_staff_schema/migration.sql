/*
  Warnings:

  - You are about to drop the column `qrImage` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `qrToken` on the `Staff` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qrCodeId]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `qrCodeId` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Staff_qrToken_key";

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "qrImage",
DROP COLUMN "qrToken",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "qrCodeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Staff_qrCodeId_key" ON "Staff"("qrCodeId");
