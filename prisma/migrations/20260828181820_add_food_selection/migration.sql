-- CreateTable
CREATE TABLE "FoodOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealSelection" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "foodOptionId" TEXT NOT NULL,
    "mealDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealSelection_staffId_idx" ON "MealSelection"("staffId");

-- CreateIndex
CREATE INDEX "MealSelection_foodOptionId_idx" ON "MealSelection"("foodOptionId");

-- CreateIndex
CREATE INDEX "MealSelection_mealDate_idx" ON "MealSelection"("mealDate");

-- CreateIndex
CREATE UNIQUE INDEX "MealSelection_staffId_mealDate_key" ON "MealSelection"("staffId", "mealDate");

-- AddForeignKey
ALTER TABLE "MealSelection" ADD CONSTRAINT "MealSelection_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSelection" ADD CONSTRAINT "MealSelection_foodOptionId_fkey" FOREIGN KEY ("foodOptionId") REFERENCES "FoodOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
