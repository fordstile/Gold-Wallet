# Gold Wallet MVP — Master Development Prompt

This document details the end-to-end plan to build the Gold Wallet MVP: features, stack, milestones, integrations, security, and deployment.

## Stack
- Frontend: Next.js (TypeScript), Tailwind, shadcn/ui
- Backend: NestJS (TypeScript), Prisma, PostgreSQL
- Payments: M-Pesa Daraja (STK Push, B2C)
- Gold Price: MetalsAPI / GoldAPI
- Storage: S3/Cloudinary (KYC)
- Background: node-cron / BullMQ + Redis
- Hosting: Vercel (FE), Render/Railway (BE)

## Milestones
1) System Foundations
- init repos, envs, health checks, DB connection (Prisma)

2) Core User Flows
- Auth (register/login), JWT, `/dashboard`

3) Gold Pricing & Precision
- price fetcher, `/gold/price`, rounding policies

4) M-Pesa Integration
- STK Push deposits, webhook, B2C payouts

5) Buy/Sell Operations
- buy: KES→grams, sell: grams→KES, ledger entries

6) Security & Tests
- validation, RBAC, unit/integration tests

7) Deployment
- FE on Vercel, BE on Render/Railway, DB hosted, monitoring

## Env Variables (example)
```
DATABASE_URL=postgresql://gold:goldpass@localhost:5432/goldwallet
JWT_SECRET=change_me
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=http://localhost:3002/webhooks/mpesa/stk
GOLD_API_KEY=
REDIS_URL=redis://localhost:6379
```

## APIs (initial)
- POST /auth/register
- POST /auth/login
- GET /gold/price
- GET /user/balance
- GET /user/ledger
- POST /trade/buy
- POST /trade/sell
- POST /webhooks/mpesa/stk

See `MVP.md` for detailed functional scope and data model.
