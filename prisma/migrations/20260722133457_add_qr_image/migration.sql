/*
  Warnings:

  - Added the required column `qrImage` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "qrImage" TEXT NOT NULL;
