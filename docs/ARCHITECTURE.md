# Gold Wallet MVP — Architecture Overview

```
Frontend (Next.js + Tailwind + shadcn)
  • Auth (login/register), KYC upload
  • Dashboard (balance, ledger)
  • Buy/Sell flows using live price
      │ HTTPS (REST)
      ▼
Backend API (NestJS)
  • Modules: Auth, Users, Wallet, Prices, Trades, Webhooks
  • Services: MpesaService, GoldPriceService, LedgerService
  • Security: JWT, rate limit, CORS, validation
      │
      ▼
Database (PostgreSQL via Prisma/Migrations)
  • users, user_balances, pools, prices, ledgers, payouts, kyc_documents
      │
      ▼
External Services
  • M-Pesa Daraja (STK Push, B2C)
  • Gold price API (MetalsAPI / GoldAPI)
  • S3/Cloudinary (KYC docs)
```

## Key Flows
- Registration/KYC: store docs securely, admin verify.
- Buy (STK): reserve grams → STK push → webhook confirm → credit grams.
- Sell: lock grams → payout (B2C/manual) → on success debit grams → credit pool.
- Ledger: immutable entries for every change.

## Deployment
- Frontend: Vercel
- Backend: Render/Railway
- DB: Supabase/Neon
- Monitoring: Sentry, logs
