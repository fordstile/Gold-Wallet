# 🚀 How to Start the Gold Wallet Application

## Prerequisites
Both backend and frontend must be running simultaneously.

---

## ✅ Step 1: Start the Backend (Terminal 1)

Open a **NEW terminal** and run:

```powershell
cd "C:\Users\user\OneDrive\Desktop\Gold Wallet\backend"
npm run start:dev
```

**Wait for this message:**
```
🚀 Application is running on: http://localhost:3002
```

---

## ✅ Step 2: Start the Frontend (Terminal 2)

Open **ANOTHER NEW terminal** and run:

```powershell
cd "C:\Users\user\OneDrive\Desktop\Gold Wallet\frontend"
npm run dev
```

**Wait for this message:**
```
▲ Next.js 15.x.x
- Local: http://localhost:3001
```

---

## ✅ Step 3: Access the Application

Open your browser and go to:
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3002

---

## 🔐 Test Accounts

### Regular User
- **Email:** test@example.com
- **Password:** Test123!

### Admin User
- **Email:** admin@goldwallet.com
- **Password:** Admin123!

---

## 🎯 What You Can Do Now

### As a Regular User:
1. **View Balance** - See your gold balance and KES value
2. **Buy Gold** - Enter KES amount and click "Buy Gold"
3. **Sell Gold** - Enter grams and click "Sell Gold"
4. **View Transactions** - See your recent transactions
5. **Profile & Settings** - View your account info

### As an Admin:
1. **Manage Pools** - Create and top-up gold pools
2. **Set Prices** - Update buy/sell prices
3. **View Stats** - Monitor system statistics
4. **All User Features** - Admin can also trade gold

---

## 🐛 Troubleshooting

### Backend not starting?
```powershell
cd backend
npm install
npm run build
npm run start:dev
```

### Frontend not starting?
```powershell
cd frontend
npm install
npm run dev
```

### Database connection error?
Check your `backend/.env` file has the correct `DATABASE_URL`

### Port already in use?
Kill the process using the port:
```powershell
# For port 3002 (backend)
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# For port 3001 (frontend)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## 📊 Features Implemented

✅ User Authentication (Login/Register)
✅ Admin Panel (Pools & Prices)
✅ User Dashboard (Real Data)
✅ Buy Gold (Simulated Payment)
✅ Sell Gold (Manual Payout)
✅ Transaction History
✅ Real-time Balance Updates
✅ Beautiful UI/UX

---

## 🚧 Coming Soon

⏳ M-Pesa STK Push Integration
⏳ KYC Document Upload
⏳ Admin Payout Management
⏳ Real-time Notifications
⏳ Transaction Reports

---

## 📝 Notes

- Buy transactions complete automatically after 2 seconds (simulated payment)
- Sell transactions are marked as pending (admin needs to process)
- All transactions are recorded in the ledger
- Database transactions ensure data consistency
- Gold is reserved from pools during buy transactions


