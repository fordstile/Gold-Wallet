# 📱 M-Pesa Daraja Credentials - Complete Setup Guide

## Step 1: Create Daraja Developer Account

### 1.1 Go to Daraja Portal
- Visit: **https://developer.safaricom.co.ke/**
- Click **"Get Started"** or **"Sign Up"**

### 1.2 Fill Registration Form
- **Email:** Your email address
- **First Name:** Your first name
- **Last Name:** Your last name
- **Organization:** Your company/project name (e.g., "Gold Wallet")
- **Phone Number:** Your M-Pesa registered phone
- **Password:** Create a strong password

### 1.3 Verify Email
- Check your email inbox
- Click the verification link
- Your account is now active!

---

## Step 2: Login and Create an App

### 2.1 Login to Daraja
- Go to: https://developer.safaricom.co.ke/
- Click **"Login"**
- Enter your email and password

### 2.2 Navigate to Apps
- After login, you'll see the dashboard
- Click **"My Apps"** in the top menu
- Click **"Add a New App"** button (green button)

### 2.3 Fill App Details
**App Name:**
```
Gold Wallet - Development
```

**Select APIs:**
- ✅ Check **"Lipa Na M-Pesa Online"** (This is STK Push)
- ✅ You can also check "M-Pesa Express" (same as above)

**App Description:** (Optional)
```
Digital gold trading platform with M-Pesa payments
```

### 2.4 Create App
- Click **"Create App"** button
- Your app is now created!

---

## Step 3: Get Your Credentials

### 3.1 View App Details
- After creating the app, you'll be redirected to app details
- You'll see several sections:
  - **Production Keys**
  - **Sandbox Keys**
  - **Lipa Na M-Pesa Online**

### 3.2 Sandbox Credentials (For Testing)

Look for the **"Sandbox"** or **"Test Credentials"** section:

#### Consumer Key
- Copy the **Consumer Key** (long alphanumeric string)
- Example: `A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6`

#### Consumer Secret
- Copy the **Consumer Secret** (long alphanumeric string)
- Example: `Z9y8X7w6V5u4T3s2R1q0P9o8N7m6L5k4`

#### Business Short Code
- For Sandbox: **174379** (Default test shortcode)

#### Passkey (Lipa Na M-Pesa Passkey)
- Look for **"Lipa Na M-Pesa Online"** section
- Click on it to expand
- Copy the **Passkey** (very long alphanumeric string)
- Example: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`

---

## Step 4: Configure Your Application

### 4.1 Create/Update .env File

In your `backend` folder, create or edit `.env` file:

```env
# Database (your existing config)
DATABASE_URL="your_database_url_here"
JWT_SECRET="your-jwt-secret"
PORT=3002

# M-Pesa Sandbox Configuration
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=paste_your_consumer_key_here
MPESA_CONSUMER_SECRET=paste_your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=paste_your_passkey_here
MPESA_CALLBACK_URL=http://localhost:3002/mpesa/callback
```

### 4.2 Example with Real Values

```env
# M-Pesa Sandbox Configuration (EXAMPLE - USE YOUR OWN!)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6
MPESA_CONSUMER_SECRET=Z9y8X7w6V5u4T3s2R1q0P9o8N7m6L5k4
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=http://localhost:3002/mpesa/callback
```

⚠️ **IMPORTANT:** 
- Replace the example values with YOUR actual credentials from Daraja Portal
- Keep these credentials SECRET
- Never commit .env file to git

---

## Step 5: Setup Callback URL (ngrok)

M-Pesa needs to send payment confirmations to your server. For local development, use ngrok:

### 5.1 Install ngrok

**Windows (using Chocolatey):**
```powershell
choco install ngrok
```

**OR Download Manually:**
- Visit: https://ngrok.com/download
- Download for Windows
- Extract to a folder
- Add to PATH or run from folder

### 5.2 Create ngrok Account (Optional but recommended)
- Visit: https://ngrok.com/
- Sign up for free account
- Get your auth token
- Run: `ngrok authtoken YOUR_TOKEN`

### 5.3 Start ngrok
```powershell
ngrok http 3002
```

You'll see output like:
```
Session Status    online
Forwarding        http://abc123.ngrok.io -> http://localhost:3002
Forwarding        https://abc123.ngrok.io -> http://localhost:3002
```

### 5.4 Copy HTTPS URL
- Copy the **HTTPS** URL (e.g., `https://abc123.ngrok.io`)
- Update your `.env`:

```env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/mpesa/callback
```

⚠️ **Note:** ngrok URLs change every time you restart ngrok (unless you have a paid plan)

---

## Step 6: Test Your Setup

### 6.1 Restart Backend
```powershell
cd backend
npm run start:dev
```

Wait for:
```
🚀 Application is running on: http://localhost:3002
```

### 6.2 Keep ngrok Running
In another terminal:
```powershell
ngrok http 3002
```

### 6.3 Test STK Push
Open your browser or use Postman:

```
POST http://localhost:3002/mpesa/test-stk
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "phoneNumber": "254708374149",
  "amount": 10
}
```

**Expected Result:**
- Backend logs show: "🚀 Initiating STK Push"
- M-Pesa prompt appears on test phone
- Callback received after entering PIN

---

## Step 7: Sandbox Test Numbers

Use these phone numbers for testing:

### ✅ Success Number
```
254708374149
```
- This number will automatically approve the payment
- Use this to test successful transactions

### ❌ Failure Number
```
254711223344
```
- This number will automatically reject the payment
- Use this to test failed transactions

---

## Step 8: Troubleshooting

### Issue: "Failed to authenticate with M-Pesa"
**Causes:**
- Wrong Consumer Key or Consumer Secret
- Credentials have spaces or extra characters

**Fix:**
- Double-check credentials in Daraja Portal
- Copy-paste carefully
- No spaces before/after

### Issue: "Invalid Shortcode"
**Causes:**
- Wrong business shortcode

**Fix:**
- Use `174379` for sandbox
- Make sure no quotes around the number in .env

### Issue: "Callback not received"
**Causes:**
- ngrok not running
- Wrong callback URL
- Backend not restarted after .env changes

**Fix:**
- Start ngrok: `ngrok http 3002`
- Update callback URL in .env with ngrok HTTPS URL
- Restart backend server

### Issue: "Invalid phone number format"
**Causes:**
- Wrong phone number format

**Fix:**
- Use format: `254XXXXXXXXX`
- No spaces, no + symbol
- Start with 254

---

## Step 9: Verify Everything is Working

### Checklist:
- [ ] Daraja account created
- [ ] App created on Daraja Portal
- [ ] Consumer Key copied to .env
- [ ] Consumer Secret copied to .env
- [ ] Passkey copied to .env
- [ ] ngrok installed and running
- [ ] Callback URL updated in .env
- [ ] Backend restarted
- [ ] Test STK Push successful

---

## Step 10: Test in Your Gold Wallet App

### 10.1 Login as Regular User
- Email: `test@example.com`
- Password: `Test123!`

### 10.2 Buy Gold
1. Go to Dashboard
2. Enter amount: `100` KES
3. Phone number: `254708374149` (sandbox test)
4. Click "📱 Buy with M-Pesa"

### 10.3 Check Your Backend Logs
You should see:
```
🚀 Initiating STK Push: { phone: '254708374149', amount: 100 }
✅ STK Push response
📞 M-Pesa Callback received
✅ Payment successful
📝 Found ledger entry
✅ Transaction completed for user
```

### 10.4 Verify Gold Credit
- Check your balance in the dashboard
- Should show the new gold amount
- Transaction appears in history

---

## 🎉 Success!

You now have M-Pesa integration working! 

### Next Steps:

**For Production:**
1. Apply for "Go Live" on Daraja Portal
2. Get production credentials
3. Use real paybill number
4. Deploy backend to cloud
5. Use production callback URL

**For Now (Development):**
- Keep using sandbox credentials
- Test different amounts
- Test with both success and failure numbers
- Monitor backend logs

---

## 📞 Need Help?

**Safaricom Daraja Support:**
- Email: apisupport@safaricom.co.ke
- Portal: https://developer.safaricom.co.ke/
- Docs: https://developer.safaricom.co.ke/docs

**Common Questions:**

**Q: How long does Daraja account approval take?**
A: Usually instant, but can take up to 24 hours

**Q: Can I test with my own phone number?**
A: In sandbox, only use the provided test numbers

**Q: Do I need to pay for ngrok?**
A: Free plan works fine for development

**Q: When should I apply for Go Live?**
A: When you're ready to accept real payments in production

---

## 🔒 Security Reminders

1. **Never commit .env file to git**
2. **Keep credentials secret**
3. **Use environment variables in production**
4. **Rotate keys periodically**
5. **Monitor for suspicious activity**

---

Good luck! 🚀💰






