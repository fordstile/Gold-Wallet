# 🚀 Gold Wallet - Step-by-Step Deployment Guide

## 📋 Pre-Deployment Checklist

### Backend Requirements
- [ ] Database is running (Supabase)
- [ ] All environment variables ready
- [ ] M-Pesa credentials configured
- [ ] ngrok URL for callbacks (if testing locally)

### Frontend Requirements
- [ ] API configuration ready
- [ ] All environment variables ready

---

## 🎯 Step 1: Prepare Environment Variables

### Backend Environment Variables
Create a file with these variables for your backend hosting:

```bash
# Database
DATABASE_URL=postgresql://postgres.rebjaclzrrjlaxlwyqms:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# JWT Secret (USE A STRONG RANDOM STRING!)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# M-Pesa Daraja Sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-backend-url.onrender.com/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# Server Port (usually auto-set by hosting)
PORT=3002
```

### Frontend Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

---

## 🖥️ Step 2: Deploy Backend (Render.com)

### Option A: Render.com (Recommended - Free Tier Available)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

3. **Configure Build Settings**
   ```
   Build Command: npm install && npx prisma generate
   Start Command: npm run start:prod
   ```

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add all backend environment variables from Step 1

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

6. **Get Your Backend URL**
   - Copy the URL (e.g., `https://gold-wallet-backend.onrender.com`)
   - Update `MPESA_CALLBACK_URL` with this URL

### Option B: Railway.app (Alternative)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Deploy from GitHub repo
   - Select `backend` folder

3. **Configure**
   - Add all environment variables
   - Railway auto-detects Node.js
   - Set root directory to `backend`

4. **Deploy**
   - Railway auto-deploys
   - Get your URL from dashboard

---

## 🌐 Step 3: Deploy Frontend (Vercel)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` folder

3. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```

4. **Add Environment Variable**
   - Go to "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)

6. **Get Your Frontend URL**
   - Copy the URL (e.g., `https://gold-wallet.vercel.app`)

---

## ✅ Step 4: Post-Deployment Configuration

### Update M-Pesa Callback URL
1. Go to your backend hosting dashboard
2. Update `MPESA_CALLBACK_URL` environment variable:
   ```
   MPESA_CALLBACK_URL=https://your-backend-url.onrender.com/mpesa/callback
   ```
3. Restart/Redeploy the backend

### Update CORS (if needed)
1. In backend code (`backend/src/main.ts`)
2. Update CORS to allow your frontend domain:
   ```typescript
   app.enableCors({
     origin: ['https://your-frontend.vercel.app', 'http://localhost:3001'],
     credentials: true,
   });
   ```

---

## 🧪 Step 5: Test Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Check landing page loads
   - Try registration/login

2. **Test Backend**
   - Visit `https://your-backend-url.onrender.com`
   - Should see API response

3. **Test API Connection**
   - Try logging in from frontend
   - Check browser console for errors
   - Verify API calls are going to deployed backend

4. **Test M-Pesa Integration**
   - Try buying gold
   - Check M-Pesa callback is received
   - Verify transactions

---

## 🔧 Step 6: Production Optimizations

### Backend
- [ ] Set up proper logging (Winston/Pino)
- [ ] Add monitoring (Sentry)
- [ ] Set up database backups
- [ ] Configure rate limiting properly
- [ ] Enable HTTPS only

### Frontend
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking
- [ ] Configure custom domain (optional)
- [ ] Add favicon and meta tags

---

## 📝 Notes

- **Free Tier Limitations:**
  - Render: Free tier spins down after 15 min inactivity
  - Vercel: Free tier is generous, no spin-down
  - Supabase: Free tier pauses after 7 days inactivity

- **Costs:**
  - Free tier should work for MVP
  - Upgrade only if you need 24/7 uptime

- **Database:**
  - Keep Supabase database running
  - Monitor usage to avoid pausing

---

## 🆘 Troubleshooting

### Backend not connecting to database
- Check DATABASE_URL is correct
- Verify Supabase database is not paused
- Check connection string format

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is deployed and running

### M-Pesa callbacks not working
- Verify callback URL is publicly accessible
- Check ngrok if testing locally
- Verify MPESA_CALLBACK_URL matches deployed URL

---

**Ready to start? Let's begin with Step 1!** 🚀

