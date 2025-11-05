# 🚀 Step-by-Step Deployment Instructions

## ✅ Step 1: Prepare Your Environment Variables

### Backend Variables (for Render/Railway)

You'll need these values ready. Copy them from your `backend/.env` file:

1. **DATABASE_URL** - Your Supabase connection string
2. **JWT_SECRET** - Generate a strong random string (use: `openssl rand -base64 32`)
3. **MPESA_CONSUMER_KEY** - From M-Pesa Daraja
4. **MPESA_CONSUMER_SECRET** - From M-Pesa Daraja
5. **MPESA_SHORTCODE** - Usually `174379` for sandbox
6. **MPESA_PASSKEY** - From M-Pesa Daraja
7. **MPESA_CALLBACK_URL** - We'll update this after deployment
8. **MPESA_ENVIRONMENT** - `sandbox` for testing
9. **ALLOWED_ORIGINS** - We'll add your frontend URL after deployment

### Frontend Variables (for Vercel)

1. **NEXT_PUBLIC_API_URL** - We'll add this after backend deployment

---

## 🖥️ Step 2: Deploy Backend to Render.com

### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

### 2.2 Connect Your Repository
1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub account if not already connected
3. Select your repository: `Gold Wallet`
4. Click "Connect"

### 2.3 Configure the Service
1. **Name:** `gold-wallet-backend` (or any name you prefer)
2. **Region:** Choose closest to your users
3. **Branch:** `main` or `master`
4. **Root Directory:** `backend`
5. **Runtime:** `Node`
6. **Build Command:** `npm install && npx prisma generate`
7. **Start Command:** `npm run start:prod`
8. **Plan:** Free (or Paid if you need 24/7 uptime)

### 2.4 Add Environment Variables
Scroll to "Environment Variables" section and add:

```
DATABASE_URL = your_supabase_connection_string
JWT_SECRET = your_generated_secret
MPESA_CONSUMER_KEY = your_consumer_key
MPESA_CONSUMER_SECRET = your_consumer_secret
MPESA_SHORTCODE = 174379
MPESA_PASSKEY = your_passkey
MPESA_CALLBACK_URL = https://your-service-name.onrender.com/mpesa/callback
MPESA_ENVIRONMENT = sandbox
ALLOWED_ORIGINS = http://localhost:3001
PORT = 3002
```

**Note:** For `MPESA_CALLBACK_URL` and `ALLOWED_ORIGINS`, use placeholder values first. We'll update them after deployment.

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. You'll see build logs in real-time
4. Once deployed, copy your service URL (e.g., `https://gold-wallet-backend.onrender.com`)

### 2.6 Update Environment Variables
After deployment, go back to Environment Variables and update:
- `MPESA_CALLBACK_URL` = `https://your-service-name.onrender.com/mpesa/callback`
- `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app,http://localhost:3001` (we'll add frontend URL in Step 3)

Click "Save Changes" - this will trigger a redeploy.

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

### 3.2 Import Your Project
1. In Vercel dashboard, click "Add New..." → "Project"
2. Import your GitHub repository: `Gold Wallet`
3. Click "Import"

### 3.3 Configure the Project
1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

### 3.4 Add Environment Variable
1. Scroll to "Environment Variables"
2. Add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend-service-name.onrender.com` (use your actual backend URL from Step 2)

### 3.5 Deploy
1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Once deployed, copy your frontend URL (e.g., `https://gold-wallet.vercel.app`)

### 3.6 Update Backend CORS
Go back to Render dashboard → Your backend service → Environment Variables:
- Update `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app,http://localhost:3001`
- Save changes (this will redeploy backend)

---

## ✅ Step 4: Test Your Deployment

### 4.1 Test Frontend
1. Visit your Vercel URL
2. Check if landing page loads
3. Try clicking "Sign In" or "Get Started"

### 4.2 Test Backend
1. Visit your backend URL directly (e.g., `https://gold-wallet-backend.onrender.com`)
2. You should see API response or error (this is normal)

### 4.3 Test Full Flow
1. **Register:** Create a new account on your deployed frontend
2. **Login:** Sign in with your credentials
3. **Dashboard:** Check if user dashboard loads
4. **Buy Gold:** Try buying gold (M-Pesa sandbox)
5. **Admin:** Login as admin and test admin features

### 4.4 Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors
4. Go to Network tab to verify API calls are going to your backend

---

## 🔧 Step 5: Troubleshooting

### Backend not connecting to database
- **Check:** Supabase database is not paused
- **Check:** DATABASE_URL is correct in Render environment variables
- **Check:** Password is URL-encoded (replace `@` with `%40`)

### Frontend can't connect to backend
- **Check:** `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- **Check:** Backend CORS includes your frontend URL
- **Check:** Backend is deployed and running (visit backend URL directly)

### M-Pesa callbacks not working
- **Check:** `MPESA_CALLBACK_URL` matches your deployed backend URL
- **Check:** Backend is accessible (no 404 errors)
- **Check:** M-Pesa credentials are correct

### Free tier limitations
- **Render:** Free tier spins down after 15 min inactivity (first request will be slow)
- **Vercel:** Free tier is very generous, no issues
- **Solution:** Upgrade to paid plan for 24/7 uptime, or use a ping service to keep Render alive

---

## 📝 Quick Reference

### Backend URL Structure
```
https://your-service-name.onrender.com
```

### Frontend URL Structure
```
https://your-project-name.vercel.app
```

### Environment Variables Summary

**Backend (Render):**
- DATABASE_URL
- JWT_SECRET
- MPESA_* (all M-Pesa variables)
- ALLOWED_ORIGINS
- PORT

**Frontend (Vercel):**
- NEXT_PUBLIC_API_URL

---

## 🎉 You're Done!

Once everything is deployed and tested, your Gold Wallet app is live! 🚀

**Need help?** Check the logs in Render/Vercel dashboards for any errors.

