# 🎯 Next Steps - Gold Wallet MVP

## ✅ What We've Accomplished

### Backend
- ✅ NestJS server running on port 3002
- ✅ Supabase PostgreSQL database connected
- ✅ JWT authentication with Passport.js
- ✅ User registration with strong password validation
- ✅ Password confirmation
- ✅ Rate limiting (10 req/60s)
- ✅ Security headers (Helmet)
- ✅ Input validation with class-validator
- ✅ User model created in database
- ✅ Auth endpoints: `/auth/register`, `/auth/login`, `/user/me`

### Frontend
- ✅ Next.js app running on port 3001
- ✅ Registration page with password strength validation
- ✅ Login page
- ✅ Dashboard with authentication guard
- ✅ Professional UI with Tailwind CSS
- ✅ Error handling and validation feedback

### Documentation
- ✅ `docs/ROADMAP.md` - Complete development roadmap
- ✅ `docs/SECURITY.md` - Security implementation guide
- ✅ `docs/AUTH_FEATURES.md` - Authentication features documentation
- ✅ `docs/MVP.md` - Original MVP specification
- ✅ `docs/ARCHITECTURE.md` - System architecture

---

## 🚀 Immediate Next Steps (Start Here)

### Step 1: Complete Database Schema (2-3 hours)

**What:** Create all the remaining database tables for the full application.

**Why:** We need pools, balances, ledgers, prices, and payouts tables to handle gold transactions.

**How:**
1. Update `backend/prisma/schema.prisma` with:
   - Pool model (physical gold inventory)
   - UserBalance model (user's gold holdings)
   - Ledger model (transaction history)
   - Price model (buy/sell prices)
   - Payout model (sell transactions)
   - KycDocument model (KYC files)

2. Run `npx prisma db push` to create tables

3. Create seed data for testing

**Files to modify:**
- `backend/prisma/schema.prisma`

**Validation:**
- Check Supabase dashboard to see new tables
- Run `npx prisma studio` to view data

---

### Step 2: Build Admin Panel Basics (3-4 hours)

**What:** Create admin interface to manage pools and set gold prices.

**Why:** Before users can buy gold, we need pools of gold to sell and prices to charge.

**Tasks:**

#### Backend:
1. **Create admin guard:**
   - Add `isAdmin: Boolean` to User model
   - Create `@nestjs/common` AdminGuard
   - Protect admin routes

2. **Pools endpoints:**
   - `POST /admin/pools` - Create new pool
   - `GET /admin/pools` - List all pools
   - `PATCH /admin/pools/:id/topup` - Add gold to pool

3. **Prices endpoints:**
   - `POST /admin/prices` - Set new buy/sell prices
   - `GET /prices/current` - Get current prices (public)

#### Frontend:
1. Create `/admin/login` page
2. Create `/admin/dashboard` page
3. Create `/admin/pools` page with:
   - Form to create new pool
   - List of existing pools
   - Top-up functionality
4. Create `/admin/prices` page with:
   - Form to set buy/sell prices
   - Current price display

**Files to create:**
- `backend/src/admin/admin.module.ts`
- `backend/src/admin/admin.controller.ts`
- `backend/src/admin/admin.service.ts`
- `backend/src/pools/pools.module.ts`
- `backend/src/pools/pools.service.ts`
- `backend/src/prices/prices.module.ts`
- `backend/src/prices/prices.service.ts`
- `frontend/src/app/admin/login/page.tsx`
- `frontend/src/app/admin/dashboard/page.tsx`
- `frontend/src/app/admin/pools/page.tsx`
- `frontend/src/app/admin/prices/page.tsx`

**Validation:**
- Admin can log in
- Admin can create a pool (e.g., "Pool 1", 1000g, 24k)
- Admin can set prices (e.g., buy: 15000 KES/g, sell: 14500 KES/g)

---

### Step 3: Wire Dashboard to Real Data (2-3 hours)

**What:** Connect the dashboard to show real gold balance and prices from the database.

**Why:** Users need to see their actual gold holdings, not simulated data.

**Tasks:**

#### Backend:
1. Create balance service to fetch user balance
2. Create endpoint `GET /user/balance` returning:
   ```json
   {
     "grams": 150.000000,
     "lockedGrams": 0,
     "kesEquivalent": 2306047.50,
     "currentPrice": 15373.65
   }
   ```

3. Update `/user/me` to include balance info

#### Frontend:
1. Replace hardcoded balance with API call
2. Fetch and display current gold price from backend
3. Calculate KES equivalent dynamically
4. Show "No balance yet" state for new users

**Files to modify:**
- `backend/src/user/user.service.ts`
- `backend/src/user/user.controller.ts`
- `frontend/src/app/dashboard/page.tsx`

**Validation:**
- Dashboard shows `0.000000 g` for new user
- Price updates when admin changes it
- Balance updates after transactions (once buy/sell implemented)

---

### Step 4: Implement Buy Flow (Foundation) (4-5 hours)

**What:** Allow users to buy gold (without M-Pesa integration yet - just simulate payment).

**Why:** Core functionality of the app. We'll add real M-Pesa later.

**Tasks:**

#### Backend:
1. Create `TradeModule` with endpoints:
   - `POST /trade/buy` - Initiate buy
   - `GET /trade/:id` - Get transaction status

2. Implement buy logic:
   ```typescript
   // 1. Get current buy price
   // 2. Calculate grams = kesAmount / buyPrice
   // 3. Check if enough gold in pools (SELECT FOR UPDATE)
   // 4. Create pending ledger entry
   // 5. For MVP: Auto-complete (simulate successful payment)
   // 6. Deduct from pool, credit user balance
   ```

3. Add database transaction support (Prisma `$transaction`)

#### Frontend:
1. Update dashboard buy section:
   - Input: KES amount
   - Show: Grams you'll receive
   - Button: "Buy Now"
2. Show transaction status
3. Update balance on success

**Files to create:**
- `backend/src/trade/trade.module.ts`
- `backend/src/trade/trade.service.ts`
- `backend/src/trade/trade.controller.ts`
- `backend/src/trade/dto/buy.dto.ts`

**Files to modify:**
- `frontend/src/app/dashboard/page.tsx`

**Validation:**
- User can enter 1000 KES
- System calculates ~0.065g (at 15373 KES/g)
- Click "Buy" → Balance increases by 0.065g
- Pool decreases by 0.065g
- Transaction appears in ledger

---

### Step 5: Implement Sell Flow (Foundation) (3-4 hours)

**What:** Allow users to sell gold (manual payout for MVP).

**Why:** Users need to be able to cash out their gold holdings.

**Tasks:**

#### Backend:
1. Add endpoint `POST /trade/sell`:
   - Check user has enough balance
   - Calculate KES = grams × sellPrice
   - Lock grams (increase lockedGrams)
   - Create pending payout entry
   - Create pending ledger entry

2. Add endpoint `POST /admin/payouts/:id/approve`:
   - Admin manually approves payout
   - Deduct user balance
   - Return grams to pool
   - Mark payout as completed

#### Frontend:
1. Update dashboard sell section:
   - Input: Grams to sell
   - Show: KES you'll receive
   - Input: Phone number for payout
   - Button: "Request Payout"

2. Show pending payout status
3. Admin page to approve payouts

**Files to create:**
- `backend/src/trade/dto/sell.dto.ts`
- `backend/src/payouts/payouts.module.ts`
- `backend/src/payouts/payouts.service.ts`
- `backend/src/payouts/payouts.controller.ts`
- `frontend/src/app/admin/payouts/page.tsx`

**Validation:**
- User with 0.065g can request to sell
- System calculates ~943 KES (at 14500 KES/g)
- Grams are locked during pending payout
- Admin sees pending payout request
- Admin approves → User balance decreases, pool increases

---

## 📅 Suggested Timeline

| Day | Focus | Deliverable |
|-----|-------|-------------|
| **Day 1** | Database Schema | All tables created, seed data loaded |
| **Day 2** | Admin Panel | Can create pools and set prices |
| **Day 3** | Real Dashboard | Dashboard shows actual balance and prices |
| **Day 4** | Buy Flow | Users can buy gold (simulated payment) |
| **Day 5** | Sell Flow | Users can request payouts (manual approval) |
| **Week 2** | M-Pesa Integration | Real STK Push for buy, B2C for sell |
| **Week 3** | KYC, Testing, Deployment | Full MVP launch |

---

## 🎯 Definition of Done for Each Step

### Step 1 - Database Schema ✅
- [ ] All 6 models defined in Prisma
- [ ] Tables created in Supabase
- [ ] Can view tables in Prisma Studio
- [ ] Seed script creates test data

### Step 2 - Admin Panel ✅
- [ ] Admin can log in with special flag
- [ ] Admin can create Pool 1 (1000g, 24k)
- [ ] Admin can set buy price (15000 KES/g)
- [ ] Admin can set sell price (14500 KES/g)
- [ ] Changes are saved to database

### Step 3 - Real Dashboard ✅
- [ ] Dashboard fetches balance from API
- [ ] Shows 0.000000 g for new user
- [ ] Shows current buy/sell prices
- [ ] Calculates KES equivalent correctly

### Step 4 - Buy Flow ✅
- [ ] User can enter 1000 KES
- [ ] System shows grams preview
- [ ] Click Buy → Creates transaction
- [ ] Balance increases immediately (simulated)
- [ ] Pool decreases accordingly
- [ ] Transaction in ledger with status "completed"

### Step 5 - Sell Flow ✅
- [ ] User can enter grams to sell
- [ ] System shows KES preview
- [ ] Creates pending payout
- [ ] Grams are locked
- [ ] Admin can view pending requests
- [ ] Admin approves → Balance decreases, pool increases

---

## 💡 Tips for Success

1. **Work incrementally:** Complete one step fully before moving to the next
2. **Test as you go:** After each feature, test it manually in the browser
3. **Use Prisma Studio:** Great for viewing/editing database data during development
4. **Keep servers running:** Have both frontend (3001) and backend (3002) running
5. **Check console logs:** Both browser console and terminal for errors
6. **Commit often:** Git commit after each working feature

---

## 🆘 If You Get Stuck

1. **Check the logs:**
   - Backend: Terminal where `npm run start:dev` is running
   - Frontend: Browser console (F12)
   - Database: Supabase dashboard logs

2. **Verify the flow:**
   - Is the API endpoint created?
   - Is it registered in the module?
   - Is the frontend calling the correct URL?
   - Is CORS enabled?

3. **Test with curl or Postman:**
   ```bash
   # Test buy endpoint
   curl -X POST http://localhost:3002/trade/buy \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"kesAmount": 1000}'
   ```

4. **Check documentation:**
   - `docs/ROADMAP.md` - Full roadmap
   - `docs/MVP.md` - Original specification
   - `docs/SECURITY.md` - Security details

---

## 🎉 You're on the Right Track!

You've completed Phase 1 (Authentication & Security) successfully. The foundation is solid, and you're ready to build the core business logic.

**Next step: Start with the database schema (Step 1). Let me know when you're ready to begin, and I'll help you implement it!**

Good luck! 🚀

