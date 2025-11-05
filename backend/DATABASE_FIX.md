# Database Connection Fix

## Issue
`Can't reach database server at aws-1-us-east-1.pooler.supabase.com:6543`

## Causes
1. **Database is paused** (free tier Supabase pauses after inactivity)
2. **Incorrect DATABASE_URL** in `.env` file
3. **Network/firewall blocking connection**

## Fix Steps

### Step 1: Check Supabase Database Status
1. Go to https://supabase.com/dashboard
2. Select your project
3. If you see "Paused" or "Restore" button, click it
4. Wait 1-2 minutes for database to fully start

### Step 2: Verify DATABASE_URL Format
Your `backend/.env` file should have:

```bash
# For Connection Pooler (recommended for production)
DATABASE_URL="postgresql://postgres.rebjaclzrrjlaxlwyqms:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# OR for Direct Connection (if pooler doesn't work)
DATABASE_URL="postgresql://postgres.rebjaclzrrjlaxlwyqms:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your actual Supabase database password
- If your password contains `@`, encode it as `%40`
- Use the **Transaction pooler** connection string from Supabase dashboard

### Step 3: Get Correct Connection String
1. Go to Supabase Dashboard → Your Project → Settings → Database
2. Scroll to "Connection string"
3. Select "Transaction pooler" mode
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password (URL-encode special characters)

### Step 4: Test Connection
After updating `.env`, restart your backend:
```bash
cd backend
npm run start:dev
```

## Alternative: Use Direct Connection
If pooler connection doesn't work, try direct connection:

1. In Supabase Dashboard → Settings → Database
2. Select "Direct connection" (port 5432)
3. Copy that connection string
4. Update `DATABASE_URL` in `backend/.env`
5. Restart backend

## Still Not Working?
1. **Check your Supabase project status** - Make sure it's not paused
2. **Verify your password** - Copy it fresh from Supabase
3. **Check network** - Make sure you're not behind a firewall blocking port 6543/5432
4. **Try direct connection** - Sometimes pooler has issues

## Quick Test
You can test the connection directly:
```bash
# Install psql if you don't have it
# Then test connection:
psql "postgresql://postgres.rebjaclzrrjlaxlwyqms:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

