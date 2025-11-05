# ⚡ Quick M-Pesa Setup Checklist

## 🎯 What You Need

Follow these steps in order:

---

## ✅ Step 1: Get Daraja Credentials (5 minutes)

1. **Go to:** https://developer.safaricom.co.ke/
2. **Sign Up** (or Login if you have an account)
3. **Create a New App:**
   - Click "My Apps" → "Add a New App"
   - Name: "Gold Wallet Dev"
   - Select: "Lipa Na M-Pesa Online"
   - Click "Create App"

4. **Copy These Credentials:**
   - ✏️ Consumer Key
   - ✏️ Consumer Secret  
   - ✏️ Passkey (under Lipa Na M-Pesa section)
   - ✏️ Shortcode: `174379` (sandbox default)

---

## ✅ Step 2: Install ngrok (2 minutes)

**Option A - Chocolatey (if you have it):**
```powershell
choco install ngrok
```

**Option B - Download:**
1. Go to: https://ngrok.com/download
2. Download Windows version
3. Extract and run

**Start ngrok:**
```powershell
ngrok http 3002
```

**Copy the HTTPS URL:**
```
https://abc123.ngrok.io
```
(Your URL will be different)

---

## ✅ Step 3: Update .env File (2 minutes)

Edit `backend/.env`:

```env
# Add these M-Pesa settings (replace with YOUR values):
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=paste_your_consumer_key_here
MPESA_CONSUMER_SECRET=paste_your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=paste_your_passkey_here
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/mpesa/callback
```

**Important:** 
- Replace all "paste_your_X_here" with actual values from Daraja
- Use YOUR ngrok HTTPS URL for callback

---

## ✅ Step 4: Restart Backend (1 minute)

```powershell
# Stop current backend (Ctrl+C)
cd backend
npm run start:dev
```

Wait for:
```
🚀 Application is running on: http://localhost:3002
```

---

## ✅ Step 5: Test It! (2 minutes)

1. **Login to app:**
   - Email: `test@example.com`
   - Password: `Test123!`

2. **Buy gold:**
   - Amount: `100` KES
   - Phone: `254708374149` (sandbox test number)
   - Click "Buy with M-Pesa"

3. **Check backend logs:**
   ```
   🚀 Initiating STK Push
   ✅ STK Push response
   📞 M-Pesa Callback received
   ✅ Payment successful
   ```

4. **Verify gold credited in dashboard!**

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to authenticate" | Check Consumer Key/Secret in .env |
| "Callback not received" | Make sure ngrok is running and URL is in .env |
| "Invalid shortcode" | Use `174379` for sandbox |
| Backend not connecting | Restart backend after changing .env |

---

## 📱 Test Phone Numbers

**Success (approves payment):**
```
254708374149
```

**Failure (rejects payment):**
```
254711223344
```

---

## 🎉 That's It!

Total time: **~12 minutes**

If everything works, you'll see:
- ✅ STK Push sent
- ✅ Callback received  
- ✅ Gold credited automatically
- ✅ Transaction in history

---

## 📖 Need More Details?

See: `MPESA_CREDENTIALS_GUIDE.md` for detailed step-by-step guide

## 🆘 Need Help?

1. Check backend logs for errors
2. Make sure ngrok is running
3. Verify all credentials in .env
4. Restart backend after .env changes

---

## 🚀 Next: Going to Production

When ready for real payments:

1. Apply for "Go Live" on Daraja Portal
2. Get production credentials
3. Deploy backend to cloud (Heroku/AWS/DigitalOcean)
4. Update .env with production values:
   ```env
   MPESA_ENVIRONMENT=production
   ```

---

**Let's go! 💰📱**






