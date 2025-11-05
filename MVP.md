# Gold Wallet MVP - Developer Handbook

## Table of Contents
- Overview
- Key Concepts
- Suggested Tech Stack (MVP)
- Data Model
- Admin UI Requirements (Minimal)
- User Flows
  - User Registration / KYC
  - Buy (STK Push)
  - Sell
- API Endpoints (Example)
- Concurrency & Consistency (Critical)
- Pool Allocation Strategy
- M-Pesa Specifics (Implementation Notes)
- Ledger & Reconciliation
- Security & Compliance (MVP Essentials)
- Edge Cases & UX Considerations
- Example SQL Snippets (Postgres)
- Example Buy Pseudocode (Simplified)
- Testing & Monitoring
- Minimum Features for MVP Release

---

## Overview (one-line)
User accounts hold balances denominated in grams (or fractions) which are backed by one or more pools of physical gold. Buying removes quantity from a pool and credits a user balance; selling debits a user balance and returns quantity to a pool while paying the user in KES via M-Pesa.

---

## Key Concepts
- **Pool** — a physical lot of gold in the system (e.g., Pool 1 = 1kg 24k). Pools have total weight and remaining available weight.
- **User balance** — the user's ownership in grams (or micrograms) of gold (could be pooled across many pools but tracked as fungible grams).
- **Ledger** — immutable transaction log for every buy/sell/movement (for audit & reconciliation).
- **Buy price / Sell price** — two admin-managed prices (KES per gram). Updated manually through admin UI or API.
- **M-Pesa integration** — use STK Push (Daraja) for collecting buy payments and use instructions for payouts for sell (or integrate Paybill disbursements if available).
- **KYC/AML** — required fields stored securely; KYC status controls user actions.

---

## Suggested Tech Stack (MVP)
- Backend: Node.js (Express / NestJS) or Python (FastAPI) — whichever the team prefers.
- DB: PostgreSQL (supports transactions, row locks).
- Redis: for short-term locks, rate limiting.
- Queue: Redis Queue / RabbitMQ for async reconciliation & webhooks.
- Storage: Encrypted S3 for documents (KYC images).
- Auth: JWT for API, strong password hashing (bcrypt/argon2).
- Payment: Safaricom Daraja API (STK Push).
- Hosting: DigitalOcean / AWS.

---

## Data Model (relational, simplified)

### tables (core)

#### pools
- id (uuid)
- name (string) — e.g., "Pool 1 1kg 24k"
- total_grams (numeric) — original size in grams (e.g., 1000)
- available_grams (numeric) — current available for sale
- purity (string) — "24k"
- created_at, updated_at

#### users
- id (uuid)
- username (string, unique)
- email (string, unique)
- phone (string)
- password_hash (string)
- kyc_status (enum: pending/verified/rejected)
- created_at, updated_at

#### user_balances
- id (uuid)
- user_id (fk)
- grams (numeric) — the total grams owned by user (fungible)
- locked_grams (numeric) — for pending sells or other holds
- updated_at

#### ledgers
- id (uuid)
- user_id
- type (enum: buy/sell/credit/debit/adjustment)
- grams (numeric, positive)
- price_per_gram (numeric, KES) — price used
- total_kes (numeric)
- pool_id (fk, nullable) — pool involved (for buys/sells)
- reference (string) — payment id, mpesa transaction id
- status (enum: pending/completed/failed)
- created_at

#### payouts
- id, user_id, amount_kes, phone, status, mpesa_transaction_id, created_at

#### prices
- id (uuid)
- buy_price_per_gram (numeric) — price users buy at
- sell_price_per_gram (numeric) — price users sell at
- effective_from (timestamp)
- created_by
- created_at

#### kyc_documents
- id, user_id, doc_type, s3_path, verified_by, created_at

---

## Admin UI Requirements (minimal)
- Login (admin).
- Pools list / create / top-up / annotate.
- Set buy & sell prices (effective immediately with timestamp).
- View ledgers & pending payouts.
- KYC review screen (view documents, set kyc_status).
- Manual settlement / reconciliation adjustments.

---

## User Flows (high-level)

### USER REGISTRATION / KYC
1. User registers with username, email, phone, password.
2. Uploads KYC docs (ID front/back, selfie).
3. System stores docs encrypted, sets `kyc_status=pending`.
4. Admin reviews and sets `kyc_status=verified` or `rejected`.
5. Only `verified` users can buy/sell above defined limits.

### BUY (STK Push)
1. User clicks Buy and provides KES amount or grams.
2. Client calls API `POST /api/buy` → server:
   - Checks `prices.buy_price_per_gram`.
   - Calculates grams = amount_kes / buy_price_per_gram.
   - Verifies `sum(pool.available_grams)` ≥ grams. If not, return error.
   - Reserve grams (transactional lock, see concurrency section).
   - Create ledger entry `pending` with reference `client_tx_123`.
   - Initiate M-Pesa STK Push to supplied phone (Daraja).
3. M-Pesa STK Push callback (webhook) confirms payment success/failure.
   - On success: mark ledger `completed`, decrement `pool.available_grams` permanently (or mark allocation), credit `user_balances.grams`. Emit receipt to user.
   - On failure: release reserved grams, mark ledger `failed`.
4. Reconciliation job handles any missed webhooks.

### SELL
1. User clicks Sell and chooses grams to sell.
2. Server verifies user has available grams (i.e., `user_balances.grams - locked_grams ≥ sell_grams`).
3. Compute `amount_kes = sell_grams * sell_price_per_gram`.
4. Create ledger `pending` and lock user's grams (increase `locked_grams`).
5. Provide user with a confirmation screen showing amount and the phone number to which they will receive funds (or allow user to enter a phone number).
6. Admin or automatic payout process:
   - Option A (manual/push): send payment instructions to user with the phone number to receive funds (or do an M-Pesa B2C transfer if available).
   - Option B (automated): use M-Pesa B2C or PayBill to disburse funds to user's phone; on success, mark ledger `completed`, decrease `user_balance.grams` and increase `pool.available_grams` by `sell_grams`; release lock. On failure, release lock and mark failed.
7. Emit notifications.

---

## API Endpoints (example)

### Auth
- POST /auth/register — {username, email, phone, password}
- POST /auth/login — {username, password} → returns JWT

### KYC
- POST /user/kyc/upload — multipart form upload
- GET /user/kyc/status

### Prices (admin)
- GET /prices/current
- POST /prices — {buy_price_per_gram, sell_price_per_gram} (admin)

### Pools (admin)
- GET /pools
- POST /pools — {name, total_grams, purity}
- POST /pools/:id/topup — {added_grams, note}

### Buy
- POST /trade/buy — {amount_kes or grams, phone_for_stk}
- Response: {trade_id, stk_push_initiated: true/false}
- GET /trade/:id — trade status

### Sell
- POST /trade/sell — {grams, payout_phone}
- Response: {trade_id, payout_initiated: true/false}
- GET /trade/:id

### Webhooks
- POST /webhooks/mpesa/stk — M-Pesa callback endpoint (validate signature)

### User balance
- GET /user/balance
- GET /user/ledger?limit=50

---

## Concurrency & Consistency (critical)
- Always use DB transactions for buy/sell flows.
- Reserve-first pattern for buys:
  - `SELECT FOR UPDATE` the pool row(s) you will take from (or a `pool_allocations` table) and decrement `available_grams` inside transaction.
  - Create ledger `pending` row inside same transaction.
  - Commit transaction then call STK Push.
- On STK confirmation, move ledger to `completed` and credit user balance in a new transaction (or same if callback is synchronous and safe).
- For sells:
  - Increase `user_balances.locked_grams` with `SELECT FOR UPDATE`, create ledger pending.
  - On payout success, deduct `locked_grams` and `user_balances.grams`, and increment `pool.available_grams` atomically.
- Use optimistic locking (version column) or serializable transactions if high concurrency expected.
- Consider per-pool locking or use a pools allocation strategy (FIFO) to pick which pool(s) are consumed.

---

## Pool Allocation Strategy
- Simple approach: treat gold as fungible—decrement `available_grams` from the first non-empty pool (admin-defined priority).
- More traceable approach: create `allocations` table that records which pool and how many grams were allocated to the user for each buy (useful for audits and returns to pool on sell).
- Recommended: store `pool_id` on the ledger so returned gold can be credited back to the correct pool.

---

## M-Pesa Specifics (implementation notes)
- Use Safaricom Daraja STK Push for payment prompts (caller triggers prompt on user phone).
- Required:
  - Business Shortcode, Lipa Na M-Pesa Online credentials (ConsumerKey, ConsumerSecret), Passkey, callback URL.
- Flow:
  1. Server requests OAuth token to Daraja.
  2. Server sends `STK Push` request (includes amount, phone, callback URL, external reference).
  3. Daraja will call the configured callback URL when the user completes/declines.
  4. On callback, validate transaction (match amount, phone, merchant request id) and mark ledger accordingly.
- For payouts:
  - If Daraja supports B2C for your business, integrate B2C to send funds to user's phone automatically. Otherwise, provide manual instructions for disbursement and mark ledger when completed.
- Always validate webhook signatures and log webhooks for reconciliation.
- Implement idempotency for webhook handling (check if transaction id already processed).

---

## Ledger & Reconciliation
- Every change to `user_balances`/`pool.available` MUST have a ledger entry.
- Reconciliation job daily:
  - Reconcile M-Pesa transactions with ledgers.
  - Reconcile pools' `available_grams` + `sum(user_balances.grams)` == total gold held (allow small rounding tolerance).
  - Keep audit trail: who updated prices, when pools topped up, who approved KYC.

---

## Security & Compliance (MVP essentials)
- Password hashing: Argon2 or bcrypt.
- Store KYC docs on encrypted S3 with access policies.
- Encrypt sensitive fields in DB (phone, ID number) at rest using application-level encryption keys.
- TLS everywhere.
- Rate limit endpoints (STK requests, login).
- PCI: You’re not storing cards, but M-Pesa flows have their own security. Do not store MPesa credentials in plaintext; use vault or environment secrets.
- Audit logging for admin actions (price changes, pool edits).
- Data retention policy for KYC documents — keep as required by local law.
- Implement session expiration & revoke JWTs on password change.

---

## Edge Cases & UX Considerations
- Partial fills: If a buy order is larger than available pool, either reject with helpful message or allow partial buy.
- Rounding: decide grams precision (e.g., 0.001g) and keep consistency across calculations. Use decimal/numeric types.
- Price update races: If admin updates price while user is in checkout, show final price on confirmation and include TTL (e.g., price locked for 60s).
- Failed transactions: ensure releases of reserved grams and notify user.
- Chargebacks/refunds: design ledger entries to represent reversals.

---

## Example SQL Snippets (Postgres)

Create pools table:
```sql
CREATE TABLE pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_grams numeric(18,6) NOT NULL,
  available_grams numeric(18,6) NOT NULL,
  purity text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

User balances:
```sql
CREATE TABLE user_balances (
  user_id uuid PRIMARY KEY,
  grams numeric(18,6) NOT NULL DEFAULT 0,
  locked_grams numeric(18,6) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
```

Ledger:
```sql
CREATE TABLE ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text,
  grams numeric(18,6),
  price_per_gram numeric(18,2),
  total_kes numeric(20,2),
  pool_id uuid REFERENCES pools(id),
  reference text,
  status text,
  created_at timestamptz DEFAULT now()
);
```

---

## Example Buy Pseudocode (simplified)

```
BEGIN TRANSACTION
// 1. read current buy price
buy_price = SELECT buy_price_per_gram FROM prices ORDER BY effective_from DESC LIMIT 1;
// 2. compute grams
grams = amount_kes / buy_price;
// 3. find a pool with enough available_grams
pool = SELECT * FROM pools WHERE available_grams >= grams ORDER BY created_at LIMIT 1 FOR UPDATE;
IF not pool: ROLLBACK; return {"error":"insufficient_gold"};
// 4. decrement available_grams
UPDATE pools SET available_grams = available_grams - grams WHERE id = pool.id;
// 5. create ledger pending
INSERT INTO ledgers(... status='pending', reference=client_tx_id);
COMMIT TRANSACTION
// 6. trigger STK push to phone with client_tx_id
// 7. on STK callback (successful):
BEGIN TRANSACTION
// mark ledger completed
UPDATE ledgers SET status='completed' WHERE reference=client_tx_id;
// credit user balance (create or update)
UPDATE user_balances SET grams = grams + grams WHERE user_id = ...;
COMMIT
```

---

## Testing & Monitoring
- Unit tests for calculations, rounding, and edge cases.
- Integration tests for buy/sell flows using mocked Daraja endpoints.
- End-to-end tests for concurrency: simulate multiple simultaneous buys to confirm no over-allocation.
- Logging & metrics: number of pending STK pushes, failed transactions, pool shortages.
- Alerts for reconciliation mismatch.

---

## Minimum Features for MVP Release
1. User registration + login + basic KYC upload.
2. Admin CRUD for pools and manual price set (buy/sell).
3. Buy via STK Push and credit user grams on successful payment.
4. Sell request that calculates KES, locks user grams, and records payout request (manual payout or automated B2C if available).
5. Basic ledger, user balance view, and admin dashboard for price/pool.
6. Webhook handling and daily reconciliation script.
