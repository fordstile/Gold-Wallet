# 🚀 M-Pesa Integration Setup Guide

## 📋 Prerequisites

1. **Safaricom Daraja Account**
   - Go to: https://developer.safaricom.co.ke/
   - Create an account
   - Create a new app

2. **Get Your Credentials**
   - Consumer Key
   - Consumer Secret
   - Business Short Code
   - Lipa Na M-Pesa Passkey

---

## ⚙️ Environment Variables

Add these to your `backend/.env` file:

```env
# M-Pesa Configuration
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/mpesa/callback
```

---

## 🌐 Callback URL Setup (Development)

M-Pesa needs to send callbacks to your server. For local development, use **ngrok**:

### Step 1: Install ngrok
```bash
# Download from: https://ngrok.com/download
# Or use chocolatey on Windows:
choco install ngrok
```

### Step 2: Start ngrok
```bash
ngrok http 3002
```

### Step 3: Copy the HTTPS URL
You'll see something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3002
```

### Step 4: Update .env
```env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/mpesa/callback
```

---

## 📝 Sandbox Credentials (Testing)

For testing, you can use Safaricom's sandbox credentials:

```env
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=Get_from_daraja_portal
MPESA_CONSUMER_SECRET=Get_from_daraja_portal
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=Get_from_daraja_portal
```

### Test Phone Numbers (Sandbox):
- **254708374149** - Will approve payment
- **254711223344** - Will reject payment

---

## 🔐 How to Get Daraja Credentials

### Step 1: Create Daraja Account
1. Visit: https://developer.safaricom.co.ke/
2. Sign up or log in
3. Click "My Apps" → "Create App"

### Step 2: Create an App
1. App Name: Gold Wallet
2. Select: Lipa Na M-Pesa Online
3. Submit

### Step 3: Get Credentials
After creating the app, you'll see:
- **Consumer Key**
- **Consumer Secret**
- **Passkey** (specific to Lipa Na M-Pesa)

### Step 4: Get Business Short Code
- Sandbox: Use `174379`
- Production: Use your actual Paybill/Till number

---

## 🧪 Testing the Integration

### Test 1: Direct STK Push
```bash
POST http://localhost:3002/mpesa/test-stk
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "phoneNumber": "254708374149",
  "amount": 100
}
```

### Test 2: Buy Gold with Real M-Pesa
1. Login to the app
2. Click "Buy Gold"
3. Enter amount
4. You'll receive an M-Pesa prompt on your phone
5. Enter PIN
6. Gold will be credited automatically

### Test 3: Check Callback
Monitor backend logs to see:
```
📞 M-Pesa Callback received
✅ Payment successful
📝 Found ledger entry
✅ Transaction completed for user
```

---

## 🔍 Troubleshooting

### Issue: "Failed to authenticate with M-Pesa"
**Solution:** Check your Consumer Key and Consumer Secret

### Issue: "Callback URL not reachable"
**Solution:** 
- Make sure ngrok is running
- Update callback URL in .env
- Restart backend server

### Issue: "Invalid Business Short Code"
**Solution:** 
- Sandbox: Use `174379`
- Production: Use your actual shortcode

### Issue: "STK Push times out"
**Solution:**
- Check phone number format (254XXXXXXXXX)
- Ensure phone is M-Pesa registered
- Check phone has network connection

---

## 🚀 Production Deployment

### Step 1: Get Production Credentials
- Apply for Go Live on Daraja Portal
- Get production Consumer Key/Secret
- Use your actual Paybill number

### Step 2: Setup Production Callback
- Deploy backend to a server (Heroku, AWS, DigitalOcean)
- Use HTTPS domain for callback URL
- Example: `https://api.goldwallet.com/mpesa/callback`

### Step 3: Update Environment
```env
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=production_key
MPESA_CONSUMER_SECRET=production_secret
MPESA_BUSINESS_SHORTCODE=your_paybill
MPESA_PASSKEY=production_passkey
MPESA_CALLBACK_URL=https://api.goldwallet.com/mpesa/callback
```

### Step 4: Register Callback URL
- Log in to Daraja Portal
- Register your production callback URL
- Test with small amounts first

---

## 📊 M-Pesa Transaction Flow

```
┌─────────────┐
│   USER      │
│ Clicks Buy  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│   BACKEND        │
│ Reserves Gold    │
│ Creates Ledger   │
│ Calls M-Pesa API │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   M-PESA         │
│ Sends STK Push   │
│ to User Phone    │
└──────┬───────────┘
       │
       ▼
┌─────────────┐
│   USER      │
│ Enters PIN  │
│ Confirms    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│   M-PESA         │
│ Processes Payment│
│ Calls Backend    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   BACKEND        │
│ Receives Callback│
│ Credits Gold     │
│ Updates Balance  │
└──────────────────┘
```

---

## 💡 Important Notes

1. **Callback URL Must Be HTTPS** (except localhost in dev)
2. **Phone Number Format:** 254XXXXXXXXX (no + or 0)
3. **Amount Must Be Integer** (no decimals)
4. **Keep Credentials Secret** (never commit to git)
5. **Test in Sandbox First** before going live
6. **Monitor Callbacks** for failed payments
7. **Handle Timeouts** gracefully

---

## 🆘 Support

- **Daraja Portal:** https://developer.safaricom.co.ke/
- **Documentation:** https://developer.safaricom.co.ke/docs
- **Support Email:** apisupport@safaricom.co.ke

---

## ✅ Checklist

- [ ] Created Daraja account
- [ ] Created app and got credentials
- [ ] Added credentials to .env
- [ ] Installed ngrok (for development)
- [ ] Started ngrok and got HTTPS URL
- [ ] Updated callback URL in .env
- [ ] Restarted backend server
- [ ] Tested STK Push
- [ ] Monitored callback logs
- [ ] Verified gold credit after payment

---

## 🎉 You're Ready!

Once all steps are complete, your M-Pesa integration is live!

Users can now buy gold with real M-Pesa payments! 💰📱





