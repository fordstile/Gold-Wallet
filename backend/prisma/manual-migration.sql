-- Gold Wallet Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- Drop existing tables (if any, to start fresh)
-- ============================================
DROP TABLE IF EXISTS "KycDocument" CASCADE;
DROP TABLE IF EXISTS "Payout" CASCADE;
DROP TABLE IF EXISTS "Price" CASCADE;
DROP TABLE IF EXISTS "Ledger" CASCADE;
DROP TABLE IF EXISTS "UserBalance" CASCADE;
DROP TABLE IF EXISTS "Pool" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ============================================
-- Create User table
-- ============================================
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN DEFAULT false NOT NULL,
    "kycStatus" TEXT DEFAULT 'pending' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================
-- Create Pool table (Physical Gold Inventory)
-- ============================================
CREATE TABLE "Pool" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "totalGrams" DECIMAL(18, 6) NOT NULL,
    "availableGrams" DECIMAL(18, 6) NOT NULL,
    "purity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================
-- Create UserBalance table
-- ============================================
CREATE TABLE "UserBalance" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    "grams" DECIMAL(18, 6) DEFAULT 0 NOT NULL,
    "lockedGrams" DECIMAL(18, 6) DEFAULT 0 NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserBalance_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- Create Ledger table (Transaction History)
-- ============================================
CREATE TABLE "Ledger" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "grams" DECIMAL(18, 6) NOT NULL,
    "pricePerGram" DECIMAL(18, 2) NOT NULL,
    "totalKes" DECIMAL(20, 2) NOT NULL,
    "poolId" TEXT,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Ledger_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ledger_poolId_fkey" FOREIGN KEY ("poolId") 
        REFERENCES "Pool"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for Ledger
CREATE INDEX "Ledger_userId_createdAt_idx" ON "Ledger"("userId", "createdAt");
CREATE INDEX "Ledger_status_idx" ON "Ledger"("status");

-- ============================================
-- Create Price table (Buy/Sell Prices)
-- ============================================
CREATE TABLE "Price" (
    "id" TEXT PRIMARY KEY,
    "buyPricePerGram" DECIMAL(18, 2) NOT NULL,
    "sellPricePerGram" DECIMAL(18, 2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index for Price
CREATE INDEX "Price_effectiveFrom_idx" ON "Price"("effectiveFrom");

-- ============================================
-- Create Payout table (Sell Transactions)
-- ============================================
CREATE TABLE "Payout" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amountKes" DECIMAL(20, 2) NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mpesaTransactionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for Payout
CREATE INDEX "Payout_userId_status_idx" ON "Payout"("userId", "status");
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- ============================================
-- Create KycDocument table
-- ============================================
CREATE TABLE "KycDocument" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "s3Path" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT false NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for KycDocument
CREATE INDEX "KycDocument_userId_verified_idx" ON "KycDocument"("userId", "verified");

-- ============================================
-- Success message
-- ============================================
SELECT 'Database schema created successfully!' AS message;

