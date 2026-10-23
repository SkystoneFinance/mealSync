-- CreateTable
CREATE TABLE "PinResetRequest" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolution" TEXT,

    CONSTRAINT "PinResetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionReopen" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "menuWeekId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionReopen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PinResetRequest_staffId_idx" ON "PinResetRequest"("staffId");

-- CreateIndex
CREATE INDEX "PinResetRequest_resolvedAt_idx" ON "PinResetRequest"("resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionReopen_staffId_menuWeekId_key" ON "SubmissionReopen"("staffId", "menuWeekId");

-- AddForeignKey
ALTER TABLE "PinResetRequest" ADD CONSTRAINT "PinResetRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionReopen" ADD CONSTRAINT "SubmissionReopen_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionReopen" ADD CONSTRAINT "SubmissionReopen_menuWeekId_fkey" FOREIGN KEY ("menuWeekId") REFERENCES "MenuWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
