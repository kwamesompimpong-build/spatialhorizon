-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "capabilities" TEXT NOT NULL,
    "sensorTypes" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "founded" INTEGER,
    "hq" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "ticker" TEXT,
    "exchange" TEXT,
    "totalRaised" TEXT,
    "lastRound" TEXT,
    "valuation" TEXT,
    "acquiredPrice" TEXT,
    "marketCap" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompanySubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "capabilities" TEXT NOT NULL,
    "sensorTypes" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "founded" INTEGER,
    "hq" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "ticker" TEXT,
    "exchange" TEXT,
    "totalRaised" TEXT,
    "lastRound" TEXT,
    "valuation" TEXT,
    "acquiredPrice" TEXT,
    "marketCap" TEXT,
    "submitterName" TEXT NOT NULL,
    "submitterEmail" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "change" REAL NOT NULL,
    "changePercent" REAL NOT NULL,
    "marketCap" REAL NOT NULL,
    "volume" REAL NOT NULL,
    "dayHigh" REAL NOT NULL,
    "dayLow" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "snapshotDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Company_domain_idx" ON "Company"("domain");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE INDEX "CompanySubmission_status_idx" ON "CompanySubmission"("status");

-- CreateIndex
CREATE INDEX "PriceSnapshot_companyId_snapshotDate_idx" ON "PriceSnapshot"("companyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "PriceSnapshot_ticker_idx" ON "PriceSnapshot"("ticker");
