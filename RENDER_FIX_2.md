# 🔧 Render Deployment Fix - Build Issue

## Problem
The `dist` folder is not being created or found. The error path `/opt/render/project/src/backend/dist/main` suggests the root directory might be incorrect.

## Solution

### Step 1: Verify Build Command in Render

Go to your Render service → Settings → Build & Deploy:

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**Root Directory:**
```
backend
```

**IMPORTANT:** Make sure "Root Directory" is exactly `backend` (not `backend/` or `/backend`)

### Step 2: Check Build Logs

In Render, go to "Logs" tab and look for:
- ✅ `npm install` completing
- ✅ `npx prisma generate` completing  
- ✅ `npm run build` completing
- ✅ `dist` folder being created

If you see build errors, share them!

### Step 3: Alternative - Use Full Path

If the build command isn't working, try using the full path:

**Build Command:**
```bash
cd backend && npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
cd backend && npm run start:prod
```

**Root Directory:**
```
.
```
(Leave empty or set to root)

### Step 4: Verify Package Manager

Make sure Render is using `npm` not `yarn`:

1. In Render Settings → Environment
2. Add environment variable:
   - Key: `NPM_CONFIG_PRODUCTION`
   - Value: `false`

Or add to build command:
```bash
npm install --production=false && npx prisma generate && npm run build
```

---

## Quick Checklist

- [ ] Build Command includes `npm run build`
- [ ] Root Directory is set to `backend`
- [ ] Start Command is `npm run start:prod`
- [ ] Check build logs for errors
- [ ] Verify `dist` folder is created in logs

---

## If Still Not Working

1. **Check the actual build logs** - Look for any TypeScript compilation errors
2. **Try manually triggering build** - Go to "Manual Deploy" → "Clear build cache & deploy"
3. **Check if devDependencies are installed** - `@nestjs/cli` is needed for build

Let me know what you see in the build logs!

