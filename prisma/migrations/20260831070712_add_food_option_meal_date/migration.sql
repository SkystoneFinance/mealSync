/*
  Warnings:

  - Added the required column `mealDate` to the `FoodOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FoodOption" ADD COLUMN     "mealDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "FoodOption_mealDate_idx" ON "FoodOption"("mealDate");

-- CreateIndex
CREATE INDEX "FoodOption_isActive_idx" ON "FoodOption"("isActive");
