# 🔧 Render Root Directory Fix

## Problem Identified ✅

The error path shows:
```
/opt/render/project/src/backend/dist/main.js
```

But it should be:
```
/opt/render/project/backend/dist/main.js
```

This means the **Root Directory** in Render is set to `src/backend` instead of `backend`.

---

## Solution

### Step 1: Update Root Directory in Render

1. Go to your Render service dashboard
2. Click **Settings** (left sidebar)
3. Scroll to **Build & Deploy** section
4. Find **Root Directory**
5. Change it to exactly:
   ```
   backend
   ```
   (NOT `src/backend`, NOT `./backend`, just `backend`)

### Step 2: Verify All Settings

While you're in Settings, confirm these are correct:

**Root Directory:**
```
backend
```

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

### Step 3: Save and Deploy

1. Click **Save Changes** at the bottom
2. This will automatically trigger a new deployment
3. Watch the logs - the path should now be correct

---

## Expected Result

After fixing the root directory, you should see:
- ✅ Build completes successfully
- ✅ Prisma generates client
- ✅ TypeScript compiles to `dist/`
- ✅ Start command finds `dist/main.js`
- ✅ Service starts on port 3002

The service should then be live at your Render URL!

---

## Next Steps After Success

Once the service is running:
1. Copy your Render service URL (e.g., `https://gold-wallet-backend.onrender.com`)
2. Update M-Pesa callback URL to use this URL
3. Deploy frontend to Vercel with the backend URL
4. Test the full application!

Let me know once you've updated the Root Directory setting!

