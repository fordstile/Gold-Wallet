# Gold Wallet

Monorepo for the Gold Wallet MVP. This repo contains a backend API and a frontend web app that implement the MVP described in `MVP.md`.

## Structure
```
backend/   # API, database, jobs
frontend/  # Web app (user + admin)
MVP.md     # Full product & technical spec
```

## Getting Started (high level)
- Choose backend stack: FastAPI (Python) or NestJS (Node). We will scaffold based on your choice.
- Bring up infra via Docker Compose (Postgres, Redis).
- Run backend, then run frontend pointed at the backend URL.

Detailed setup instructions will be added as we scaffold both apps.

## Prototype Alignment
We will replicate and improve the prototype flows:
- Register/Login and KYC upload
- Dashboard with balance, KES equivalent, gold price
- Buy (KES→grams) via M-Pesa STK
- Sell (grams→KES) with payout request
- Admin: pools, prices, KYC review, ledgers

See `MVP.md` for the full scope.
