-- Add missing columns to existing User table
-- Run this if the User table already existed before

-- Add isAdmin column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'isAdmin'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN DEFAULT false NOT NULL;
    END IF;
END $$;

-- Add kycStatus column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'kycStatus'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "kycStatus" TEXT DEFAULT 'pending' NOT NULL;
    END IF;
END $$;

-- Update existing admin user
UPDATE "User" 
SET "isAdmin" = true, "kycStatus" = 'verified'
WHERE email = 'admin@goldwallet.com';

-- Verify the fix
SELECT email, "isAdmin", "kycStatus" FROM "User";

