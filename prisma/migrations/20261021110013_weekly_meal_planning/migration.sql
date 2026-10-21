-- AlterTable
ALTER TABLE "MealSelection" ADD COLUMN     "noMeal" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "foodOptionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MenuWeek" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "closedDates" TIMESTAMP(3)[],
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklySubmission" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "menuWeekId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuWeek_weekStart_key" ON "MenuWeek"("weekStart");

-- CreateIndex
CREATE INDEX "WeeklySubmission_menuWeekId_idx" ON "WeeklySubmission"("menuWeekId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySubmission_staffId_menuWeekId_key" ON "WeeklySubmission"("staffId", "menuWeekId");

-- AddForeignKey
ALTER TABLE "WeeklySubmission" ADD CONSTRAINT "WeeklySubmission_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklySubmission" ADD CONSTRAINT "WeeklySubmission_menuWeekId_fkey" FOREIGN KEY ("menuWeekId") REFERENCES "MenuWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
