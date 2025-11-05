-- Gold Wallet Seed Data
-- Run this AFTER manual-migration.sql

-- ============================================
-- Create Admin User
-- ============================================
-- Password: Admin123! (hashed with bcrypt cost 12)
INSERT INTO "User" ("id", "email", "passwordHash", "isAdmin", "kycStatus", "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'admin@goldwallet.com',
    '$2b$12$sLvbFMxtEw6NVqRMTJVoJ.IzNxmtZyOCmqxQqJpvsyTh7WtNy1bfq',
    true,
    'verified',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================
-- Create Test User
-- ============================================
-- Password: Test123! (hashed with bcrypt cost 12)
INSERT INTO "User" ("id", "email", "passwordHash", "isAdmin", "kycStatus", "createdAt", "updatedAt")
VALUES (
    'user-test-001',
    'test@example.com',
    '$2b$12$H9fW2YuDgYVW6qadqcPZr.vB6t4SicOfup4yH.q8xA3h2JVkQ7u4i',
    false,
    'pending',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================
-- Create User Balance for Test User
-- ============================================
INSERT INTO "UserBalance" ("id", "userId", "grams", "lockedGrams", "updatedAt")
VALUES (
    'balance-test-001',
    'user-test-001',
    0,
    0,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("userId") DO NOTHING;

-- ============================================
-- Create Initial Gold Pool
-- ============================================
INSERT INTO "Pool" ("id", "name", "totalGrams", "availableGrams", "purity", "createdAt", "updatedAt")
VALUES (
    'pool-1-initial',
    'Pool 1 - 1kg 24k Gold',
    1000.000000,
    1000.000000,
    '24k',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- ============================================
-- Set Initial Prices
-- ============================================
INSERT INTO "Price" ("id", "buyPricePerGram", "sellPricePerGram", "effectiveFrom", "createdBy", "createdAt")
VALUES (
    'price-initial',
    15000.00,
    14500.00,
    CURRENT_TIMESTAMP,
    'admin-001',
    CURRENT_TIMESTAMP
);

-- ============================================
-- Verify seed data
-- ============================================
SELECT 'Seed data inserted successfully!' AS message;
SELECT 'Admin login: admin@goldwallet.com / Admin123!' AS admin_credentials;
SELECT 'Test user login: test@example.com / Test123!' AS test_credentials;

-- Show what was created
SELECT 'Users:' AS summary;
SELECT email, "isAdmin", "kycStatus" FROM "User";

SELECT 'Pools:' AS summary;
SELECT name, "totalGrams", "availableGrams", purity FROM "Pool";

SELECT 'Prices:' AS summary;
SELECT "buyPricePerGram", "sellPricePerGram", "effectiveFrom" FROM "Price";

