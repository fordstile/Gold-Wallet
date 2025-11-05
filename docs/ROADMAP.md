# Gold Wallet MVP - Development Roadmap

## ✅ Phase 1: Foundation & Authentication (COMPLETED)

### Infrastructure
- [x] Project structure (frontend, backend, docs)
- [x] NestJS backend setup with TypeScript
- [x] Next.js frontend with Tailwind CSS
- [x] Supabase PostgreSQL database connection
- [x] Prisma ORM setup
- [x] Environment configuration

### Authentication & Security
- [x] JWT authentication with Passport.js
- [x] User registration with strong password requirements
- [x] Password confirmation validation
- [x] Login/logout functionality
- [x] Protected routes (dashboard guard)
- [x] Password hashing (bcrypt, cost: 12)
- [x] Email validation
- [x] Rate limiting (10 req/60s)
- [x] Security headers (Helmet)
- [x] Input validation & sanitization
- [x] CORS configuration
- [x] Error handling

### UI/UX
- [x] Landing page
- [x] Registration page with validation feedback
- [x] Login page
- [x] Dashboard layout (static gold balance demo)
- [x] Professional styling with Tailwind

---

## 🚧 Phase 2: Core Database Schema (NEXT - HIGH PRIORITY)

### Database Models to Implement

#### 1. **Pools Table** (Physical Gold Inventory)
```prisma
model Pool {
  id              String   @id @default(uuid())
  name            String
  totalGrams      Decimal  @db.Decimal(18, 6)
  availableGrams  Decimal  @db.Decimal(18, 6)
  purity          String   // e.g., "24k"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  ledgers         Ledger[]
}
```

#### 2. **UserBalance Table** (User's Gold Holdings)
```prisma
model UserBalance {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  grams       Decimal  @default(0) @db.Decimal(18, 6)
  lockedGrams Decimal  @default(0) @db.Decimal(18, 6)
  updatedAt   DateTime @updatedAt
}
```

#### 3. **Ledger Table** (Transaction History)
```prisma
model Ledger {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  type          String   // buy, sell, credit, debit, adjustment
  grams         Decimal  @db.Decimal(18, 6)
  pricePerGram  Decimal  @db.Decimal(18, 2)
  totalKes      Decimal  @db.Decimal(20, 2)
  poolId        String?
  pool          Pool?    @relation(fields: [poolId], references: [id])
  reference     String   // mpesa transaction ID
  status        String   // pending, completed, failed
  createdAt     DateTime @default(now())
}
```

#### 4. **Prices Table** (Gold Price Management)
```prisma
model Price {
  id               String   @id @default(uuid())
  buyPricePerGram  Decimal  @db.Decimal(18, 2)
  sellPricePerGram Decimal  @db.Decimal(18, 2)
  effectiveFrom    DateTime @default(now())
  createdBy        String   // admin user ID
  createdAt        DateTime @default(now())
}
```

#### 5. **Payouts Table** (Sell Transactions)
```prisma
model Payout {
  id                  String   @id @default(uuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id])
  amountKes           Decimal  @db.Decimal(20, 2)
  phone               String
  status              String   // pending, processing, completed, failed
  mpesaTransactionId  String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

#### 6. **KYC Documents Table**
```prisma
model KycDocument {
  id         String    @id @default(uuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  docType    String    // id_front, id_back, selfie
  s3Path     String    // file storage path
  verifiedBy String?   // admin user ID
  verifiedAt DateTime?
  createdAt  DateTime  @default(now())
}
```

### Tasks for Phase 2:
- [ ] Update Prisma schema with all models
- [ ] Run `prisma db push` to create tables
- [ ] Generate Prisma client
- [ ] Create seed data for testing (initial pool, default prices)
- [ ] Update User model to include relations
- [ ] Test database connections and queries

**Estimated Time:** 2-3 hours

---

## 📦 Phase 3: Admin Panel - Pools & Prices Management

### Backend API Endpoints

#### Pools Management
- [ ] `GET /admin/pools` - List all pools
- [ ] `POST /admin/pools` - Create new pool
- [ ] `GET /admin/pools/:id` - Get pool details
- [ ] `PATCH /admin/pools/:id/topup` - Add gold to pool
- [ ] `GET /admin/pools/:id/allocations` - View pool allocations

#### Prices Management
- [ ] `GET /prices/current` - Get current buy/sell prices (public)
- [ ] `POST /admin/prices` - Set new prices (admin only)
- [ ] `GET /admin/prices/history` - View price history

### Frontend Admin Pages
- [ ] `/admin/login` - Admin authentication
- [ ] `/admin/dashboard` - Admin overview
- [ ] `/admin/pools` - Pool management UI
- [ ] `/admin/prices` - Price management UI
- [ ] `/admin/ledgers` - Transaction monitoring
- [ ] `/admin/kyc` - KYC review queue

### Features
- [ ] Admin role in User model
- [ ] Admin JWT guard
- [ ] Pool CRUD operations
- [ ] Price setting with timestamp
- [ ] Real-time pool availability display
- [ ] Audit logging for admin actions

**Estimated Time:** 4-5 hours

---

## 💰 Phase 4: Buy Gold Flow (STK Push Integration)

### Backend Implementation

#### Buy Endpoints
- [ ] `POST /trade/buy` - Initiate buy transaction
- [ ] `GET /trade/:id` - Get transaction status
- [ ] `POST /webhooks/mpesa/stk` - M-Pesa callback handler

### M-Pesa Integration (Daraja API)
- [ ] Set up Daraja credentials (ConsumerKey, ConsumerSecret, Passkey)
- [ ] Implement OAuth token generation
- [ ] Implement STK Push request
- [ ] Handle M-Pesa callbacks
- [ ] Webhook signature verification
- [ ] Idempotency handling

### Transaction Flow
1. [ ] User enters KES amount
2. [ ] Calculate grams = KES / buyPrice
3. [ ] Check pool availability (SELECT FOR UPDATE)
4. [ ] Create pending ledger entry
5. [ ] Reserve grams in transaction
6. [ ] Trigger STK Push to user's phone
7. [ ] Handle callback:
   - Success: Complete ledger, credit user balance, decrement pool
   - Failure: Rollback, release reserved grams
8. [ ] Reconciliation job for missed webhooks

### Frontend
- [ ] Buy form UI (enter KES amount)
- [ ] Real-time gold price display
- [ ] Grams calculation preview
- [ ] STK push initiated message
- [ ] Polling for transaction status
- [ ] Success/failure feedback
- [ ] Transaction history view

**Estimated Time:** 6-8 hours

---

## 💸 Phase 5: Sell Gold Flow (B2C/Payout)

### Backend Implementation

#### Sell Endpoints
- [ ] `POST /trade/sell` - Initiate sell transaction
- [ ] `GET /trade/sell/:id` - Get sell status
- [ ] `POST /admin/payouts/:id/process` - Manual payout approval

### Sell Flow
1. [ ] User enters grams to sell
2. [ ] Verify user has enough balance (grams - lockedGrams)
3. [ ] Calculate KES = grams * sellPrice
4. [ ] Create pending ledger
5. [ ] Lock user's grams (increase lockedGrams)
6. [ ] Option A: Manual payout (admin approves)
7. [ ] Option B: Automatic B2C transfer (if available)
8. [ ] On success: Deduct balance, return grams to pool
9. [ ] On failure: Release lock

### Frontend
- [ ] Sell form UI (enter grams)
- [ ] KES equivalent calculator
- [ ] Phone number input for payout
- [ ] Confirmation screen
- [ ] Payout status tracking
- [ ] Transaction history

**Estimated Time:** 5-6 hours

---

## 📄 Phase 6: KYC Upload & Verification

### Backend

#### KYC Endpoints
- [ ] `POST /user/kyc/upload` - Upload KYC documents
- [ ] `GET /user/kyc/status` - Check KYC status
- [ ] `GET /admin/kyc/pending` - Admin: View pending KYC
- [ ] `PATCH /admin/kyc/:id/verify` - Admin: Approve/reject KYC

### File Storage Integration
- [ ] Set up Cloudinary or AWS S3
- [ ] Implement file upload middleware
- [ ] Image compression/optimization
- [ ] Secure file access (signed URLs)
- [ ] File type validation (jpg, png, pdf)
- [ ] File size limits (max 5MB per file)

### KYC Workflow
- [ ] User uploads: ID front, ID back, selfie
- [ ] Store securely with encryption
- [ ] Set user kyc_status = 'pending'
- [ ] Admin reviews documents
- [ ] Admin approves/rejects with notes
- [ ] Email notification to user
- [ ] Enforce limits for unverified users (e.g., max 1000 KES)

### Frontend
- [ ] Multi-step KYC upload form
- [ ] Drag-and-drop file upload
- [ ] Image preview before upload
- [ ] Upload progress indicator
- [ ] KYC status badge in dashboard
- [ ] Admin KYC review interface

**Estimated Time:** 5-7 hours

---

## 📊 Phase 7: Dashboard & Balance Management

### User Dashboard Enhancements
- [ ] Real gold balance (from UserBalance table)
- [ ] Live gold price (from Prices table)
- [ ] KES equivalent calculation
- [ ] Recent transactions (from Ledger)
- [ ] Pending transactions status
- [ ] Buy/Sell quick actions
- [ ] Transaction history table with filters
- [ ] Export transaction history (CSV)
- [ ] Charts: Balance over time, transaction trends

### Backend Endpoints
- [ ] `GET /user/balance` - Get user's gold balance
- [ ] `GET /user/ledger?limit=50&offset=0` - Transaction history
- [ ] `GET /user/stats` - User statistics (total bought, sold, etc.)

**Estimated Time:** 3-4 hours

---

## 🔄 Phase 8: Reconciliation & Background Jobs

### Reconciliation System
- [ ] Daily reconciliation job (node-cron or BullMQ)
- [ ] Verify: pool.availableGrams + sum(user_balances.grams) = pool.totalGrams
- [ ] Check for stuck pending transactions
- [ ] M-Pesa transaction verification
- [ ] Automated email alerts for discrepancies
- [ ] Reconciliation report generation

### Background Jobs
- [ ] Scheduled price updates (if using external API)
- [ ] Failed transaction retry logic
- [ ] Automatic payout processing queue
- [ ] Cleanup old pending transactions
- [ ] Generate daily reports

### Monitoring
- [ ] Logging system (Winston or Pino)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Alert system for critical errors

**Estimated Time:** 4-5 hours

---

## 🔐 Phase 9: Security Hardening (Production)

### Authentication Enhancements
- [ ] Email verification on registration
- [ ] Password reset flow with time-limited tokens
- [ ] 2FA (Two-Factor Authentication) with TOTP
- [ ] Account lockout after failed attempts
- [ ] Session management (revoke tokens)
- [ ] Refresh token rotation
- [ ] httpOnly cookies instead of localStorage

### Additional Security
- [ ] CSRF protection
- [ ] Redis for rate limiting state
- [ ] Audit logging for all admin actions
- [ ] Encrypted sensitive fields in database
- [ ] Regular security dependency updates
- [ ] Penetration testing
- [ ] GDPR compliance features (data export, deletion)

**Estimated Time:** 6-8 hours

---

## 🌐 Phase 10: External Integrations

### Real-Time Gold Price API
- [ ] Integrate MetalsAPI.com or GoldAPI.io
- [ ] Scheduled price updates (every hour)
- [ ] Price history tracking
- [ ] Fallback if API unavailable

### M-Pesa Daraja Full Integration
- [ ] Production credentials setup
- [ ] B2C (Business to Customer) for payouts
- [ ] Transaction reconciliation with M-Pesa
- [ ] Webhook reliability improvements
- [ ] Retry logic for failed webhooks

### Email Service
- [ ] Set up SendGrid or AWS SES
- [ ] Welcome email on registration
- [ ] Email verification
- [ ] Transaction confirmations
- [ ] KYC status updates
- [ ] Password reset emails
- [ ] Admin alerts

### SMS Notifications (Optional)
- [ ] Africa's Talking or Twilio integration
- [ ] Transaction confirmations via SMS
- [ ] 2FA codes via SMS

**Estimated Time:** 5-6 hours

---

## 🧪 Phase 11: Testing & Quality Assurance

### Backend Tests
- [ ] Unit tests for services (Jest)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows (buy/sell)
- [ ] Concurrency tests (simultaneous buys)
- [ ] Database transaction tests
- [ ] M-Pesa webhook mock tests

### Frontend Tests
- [ ] Component tests (React Testing Library)
- [ ] Form validation tests
- [ ] Protected route tests
- [ ] E2E tests (Playwright or Cypress)

### Load Testing
- [ ] Simulate high concurrent user load
- [ ] Database connection pooling optimization
- [ ] API response time benchmarks

**Estimated Time:** 6-8 hours

---

## 🚀 Phase 12: Deployment & DevOps

### Infrastructure Setup
- [ ] Frontend: Vercel or Netlify
- [ ] Backend: Railway, Render, or AWS
- [ ] Database: Supabase (production tier) or Neon.tech
- [ ] Redis: Upstash or Redis Cloud
- [ ] File Storage: AWS S3 or Cloudinary

### CI/CD Pipeline
- [ ] GitHub Actions or GitLab CI
- [ ] Automated tests on PR
- [ ] Automated deployment to staging
- [ ] Manual approval for production

### Environment Configuration
- [ ] Production environment variables
- [ ] Staging environment setup
- [ ] Database migrations strategy
- [ ] Secrets management (Vault or cloud provider)

### Monitoring & Logging
- [ ] Application monitoring (Datadog, New Relic)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (LogTail, Papertrail)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (Lighthouse CI)

### Backup & Recovery
- [ ] Automated database backups
- [ ] Disaster recovery plan
- [ ] Rollback strategy

**Estimated Time:** 5-7 hours

---

## 📱 Phase 13: Mobile Optimization & PWA

- [ ] Responsive design for all screen sizes
- [ ] Touch-friendly UI elements
- [ ] Progressive Web App (PWA) setup
- [ ] Offline support (basic caching)
- [ ] Install prompt for mobile
- [ ] Push notifications (optional)

**Estimated Time:** 3-4 hours

---

## 📈 Phase 14: Analytics & Reporting

### User Analytics
- [ ] Google Analytics or Plausible
- [ ] User activity tracking
- [ ] Conversion funnel analysis
- [ ] Transaction volume metrics

### Admin Reports
- [ ] Daily transaction summary
- [ ] Gold inventory report
- [ ] Revenue/profit calculations
- [ ] User growth metrics
- [ ] KYC completion rates

**Estimated Time:** 3-4 hours

---

## 🎨 Phase 15: UI/UX Polish

- [ ] Loading skeletons
- [ ] Smooth animations and transitions
- [ ] Empty states with helpful messages
- [ ] Success/error toast notifications
- [ ] Tooltips for complex features
- [ ] Onboarding tutorial for new users
- [ ] Dark mode (optional)
- [ ] Accessibility audit (WCAG 2.1)

**Estimated Time:** 4-5 hours

---

## 📚 Phase 16: Documentation & Legal

### Technical Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Troubleshooting guide

### User Documentation
- [ ] User guide / Help center
- [ ] FAQ page
- [ ] Video tutorials (optional)

### Legal & Compliance
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] GDPR compliance notices
- [ ] Kenya Data Protection Act compliance
- [ ] AML/KYC compliance documentation

**Estimated Time:** 4-6 hours

---

## 🎯 Immediate Next Steps (This Week)

### Priority 1: Database Schema (Phase 2)
1. Update `backend/prisma/schema.prisma` with all models
2. Run `npx prisma db push`
3. Create seed script for initial data
4. Test all relationships

### Priority 2: Admin Panel Basics (Phase 3)
1. Create admin guard/middleware
2. Implement pools CRUD endpoints
3. Implement prices endpoints
4. Build basic admin UI

### Priority 3: Real Dashboard (Phase 7)
1. Wire dashboard to real user balance
2. Display current gold prices
3. Show transaction history
4. Add buy/sell buttons (UI only)

**Goal:** By end of week, have working admin panel to manage pools and prices, plus real user balance display.

---

## 📊 Project Timeline Estimate

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Auth ✅ | 8 hours | DONE |
| Phase 2: Database | 3 hours | **HIGH** |
| Phase 3: Admin Panel | 5 hours | **HIGH** |
| Phase 4: Buy Flow | 8 hours | **HIGH** |
| Phase 5: Sell Flow | 6 hours | **HIGH** |
| Phase 6: KYC | 6 hours | MEDIUM |
| Phase 7: Dashboard | 4 hours | **HIGH** |
| Phase 8: Reconciliation | 5 hours | MEDIUM |
| Phase 9: Security | 7 hours | MEDIUM |
| Phase 10: Integrations | 6 hours | HIGH |
| Phase 11: Testing | 7 hours | MEDIUM |
| Phase 12: Deployment | 6 hours | HIGH |
| Phase 13: Mobile | 3 hours | LOW |
| Phase 14: Analytics | 3 hours | LOW |
| Phase 15: UI Polish | 5 hours | LOW |
| Phase 16: Docs | 5 hours | MEDIUM |
| **TOTAL** | **~87 hours** | |

**Realistic MVP Timeline:** 2-3 weeks of focused development

---

## 🎯 Definition of "MVP Done"

The MVP is complete when:
- [x] User registration & login works
- [ ] Admin can create pools and set prices
- [ ] Users can buy gold via M-Pesa STK Push
- [ ] Users can sell gold (manual payout acceptable)
- [ ] Users can upload KYC documents
- [ ] Admin can review and approve KYC
- [ ] Dashboard shows real gold balance
- [ ] Transaction history is visible
- [ ] Basic reconciliation works
- [ ] Application is deployed and accessible
- [ ] Core flows are tested and working

---

## 📞 Support & Questions

For questions or clarification on any phase, refer to:
- `docs/MVP.md` - Original specification
- `docs/ARCHITECTURE.md` - System architecture
- `docs/SECURITY.md` - Security implementation details
- `docs/AUTH_FEATURES.md` - Authentication documentation

**Let's build this! 🚀**

