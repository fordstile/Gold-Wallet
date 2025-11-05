-- Verify if users exist in database
SELECT 
    email, 
    "isAdmin", 
    "kycStatus",
    LEFT("passwordHash", 20) || '...' as password_preview,
    "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;

