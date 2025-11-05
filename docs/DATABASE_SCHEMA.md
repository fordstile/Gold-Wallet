# Database Schema Documentation

## Overview

The Gold Wallet database consists of 7 main tables that track users, gold inventory, transactions, and compliance.

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │◄─────┐
│ email       │      │
│ password    │      │
│ isAdmin     │      │
│ kycStatus   │      │
└─────────────┘      │
       │             │
       │ 1:1         │ 1:many
       ▼             │
┌──────────────┐     │
│ UserBalance  │     │
├──────────────┤     │
│ userId       │─────┘
│ grams        │        (User has ONE balance)
│ lockedGrams  │        (User has MANY ledgers, payouts, kyc docs)
└──────────────┘


┌──────────────┐
│    Pool      │◄──────┐
├──────────────┤       │
│ id           │       │
│ name         │       │
│ totalGrams   │       │  (Pool can be referenced by many ledgers)
│ available    │       │
│ purity       │       │
└──────────────┘       │
                       │
                       │ many:1
┌──────────────┐       │
│   Ledger     │───────┘
├──────────────┤
│ id           │
│ userId       │───────► User
│ type         │
│ grams        │
│ pricePerGram │
│ totalKes     │
│ poolId       │ (optional)
│ reference    │
│ status       │
└──────────────┘


┌──────────────┐
│    Price     │
├──────────────┤
│ id           │
│ buyPrice     │
│ sellPrice    │
│ effectiveFrom│
│ createdBy    │
└──────────────┘


┌──────────────┐
│   Payout     │
├──────────────┤
│ id           │
│ userId       │───────► User
│ amountKes    │
│ phone        │
│ status       │
│ mpesaTxId    │
└──────────────┘


┌──────────────┐
│ KycDocument  │
├──────────────┤
│ id           │
│ userId       │───────► User
│ docType      │
│ s3Path       │
│ verified     │
│ verifiedBy   │
└──────────────┘
```

---

## 📋 Table Details

### 1. User
**Purpose:** User accounts and authentication

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| passwordHash | String | Bcrypt hashed password |
| isAdmin | Boolean | Admin flag (default: false) |
| kycStatus | String | KYC status: pending, verified, rejected |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- Has ONE `UserBalance`
- Has MANY `Ledger` entries
- Has MANY `Payout` requests
- Has MANY `KycDocument` uploads

---

### 2. Pool
**Purpose:** Physical gold inventory management

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Pool name (e.g., "Pool 1 - 1kg 24k") |
| totalGrams | Decimal(18,6) | Original amount of gold |
| availableGrams | Decimal(18,6) | Currently available for sale |
| purity | String | Gold purity (e.g., "24k", "22k") |
| createdAt | DateTime | Pool creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Business Logic:**
- `availableGrams` decreases when users buy
- `availableGrams` increases when users sell
- `totalGrams` stays constant (unless admin tops up)
- Cannot sell more than `availableGrams`

**Example:**
```
Pool 1:
  totalGrams: 1000.000000      (1 kg)
  availableGrams: 750.000000   (750g left to sell)
  
  Means: 250g has been sold to users
```

---

### 3. UserBalance
**Purpose:** Track each user's gold holdings

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User (unique) |
| grams | Decimal(18,6) | Total gold owned by user |
| lockedGrams | Decimal(18,6) | Grams locked during pending sell |
| updatedAt | DateTime | Last balance update |

**Business Logic:**
- `grams` = Total gold owned
- `lockedGrams` = Temporarily locked during sell transactions
- **Available to sell:** `grams - lockedGrams`

**Example:**
```
User Alice:
  grams: 100.000000
  lockedGrams: 25.000000
  
  Available to sell: 75.000000 grams
```

---

### 4. Ledger
**Purpose:** Immutable transaction history (audit trail)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| type | String | Transaction type: buy, sell, credit, debit, adjustment |
| grams | Decimal(18,6) | Amount of gold transacted |
| pricePerGram | Decimal(18,2) | KES per gram at transaction time |
| totalKes | Decimal(20,2) | Total KES amount |
| poolId | UUID (optional) | Pool involved in transaction |
| reference | String | M-Pesa transaction ID or internal ref |
| status | String | pending, completed, failed |
| createdAt | DateTime | Transaction timestamp |

**Transaction Types:**
- `buy`: User buys gold (KES → grams)
- `sell`: User sells gold (grams → KES)
- `credit`: Manual credit by admin
- `debit`: Manual debit by admin
- `adjustment`: Reconciliation adjustment

**Example Ledger Entry (Buy):**
```json
{
  "id": "led-123",
  "userId": "user-456",
  "type": "buy",
  "grams": 0.065000,
  "pricePerGram": 15000.00,
  "totalKes": 975.00,
  "poolId": "pool-1",
  "reference": "MPESA_ABC123",
  "status": "completed",
  "createdAt": "2025-10-18T10:30:00Z"
}
```

---

### 5. Price
**Purpose:** Gold pricing history

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| buyPricePerGram | Decimal(18,2) | Price users buy at (KES/gram) |
| sellPricePerGram | Decimal(18,2) | Price users sell at (KES/gram) |
| effectiveFrom | DateTime | When this price becomes active |
| createdBy | String | Admin user ID who set price |
| createdAt | DateTime | Record creation timestamp |

**Business Logic:**
- Always use the most recent price (`ORDER BY effectiveFrom DESC LIMIT 1`)
- Buy price > Sell price (business profit margin)
- Price history maintained for auditing

**Example:**
```
Current Price:
  buyPricePerGram: 15000.00 KES
  sellPricePerGram: 14500.00 KES
  Profit margin: 500 KES per gram (3.3%)
```

---

### 6. Payout
**Purpose:** Track sell transactions and M-Pesa disbursements

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| amountKes | Decimal(20,2) | Amount to pay user |
| phone | String | Phone number for M-Pesa |
| status | String | pending, processing, completed, failed |
| mpesaTransactionId | String (optional) | M-Pesa B2C transaction ID |
| notes | String (optional) | Admin notes or failure reason |
| createdAt | DateTime | Payout request timestamp |
| updatedAt | DateTime | Last status update |

**Payout Flow:**
1. User requests to sell gold
2. Payout created with `status: pending`
3. Admin/system processes: `status: processing`
4. M-Pesa transfer: `status: completed` or `failed`

---

### 7. KycDocument
**Purpose:** KYC compliance and document verification

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| docType | String | id_front, id_back, selfie |
| s3Path | String | Cloud storage path (S3/Cloudinary) |
| verified | Boolean | Verification status |
| verifiedBy | String (optional) | Admin user ID who verified |
| verifiedAt | DateTime (optional) | Verification timestamp |
| notes | String (optional) | Admin notes |
| createdAt | DateTime | Upload timestamp |

**Required Documents:**
- `id_front`: National ID front
- `id_back`: National ID back
- `selfie`: User holding ID

---

## 🔄 Transaction Flows

### Buy Gold Flow

```
1. User submits buy request (1000 KES)
   ↓
2. System checks current price (15000 KES/g)
   ↓
3. Calculate grams: 1000 / 15000 = 0.066667g
   ↓
4. Check pool availability (SELECT FOR UPDATE)
   ↓
5. Create Ledger entry (status: pending)
   ↓
6. Reserve grams: pool.availableGrams -= 0.066667
   ↓
7. Trigger M-Pesa STK Push
   ↓
8. M-Pesa callback received (success)
   ↓
9. Update Ledger (status: completed)
   ↓
10. Credit UserBalance: balance.grams += 0.066667
```

### Sell Gold Flow

```
1. User requests to sell 0.05g
   ↓
2. Check UserBalance (has enough?)
   ↓
3. System checks current sell price (14500 KES/g)
   ↓
4. Calculate KES: 0.05 * 14500 = 725 KES
   ↓
5. Lock grams: balance.lockedGrams += 0.05
   ↓
6. Create Ledger entry (status: pending)
   ↓
7. Create Payout entry (status: pending)
   ↓
8. Admin approves payout (or auto B2C)
   ↓
9. M-Pesa B2C transfer
   ↓
10. Update Payout (status: completed)
    ↓
11. Update Ledger (status: completed)
    ↓
12. Deduct balance: balance.grams -= 0.05
    balance.lockedGrams -= 0.05
    ↓
13. Return to pool: pool.availableGrams += 0.05
```

---

## 📐 Data Precision

### Why Decimal(18,6)?
- **18 total digits:** Handles up to 999,999,999,999 grams (999 billion grams)
- **6 decimal places:** Precision to 0.000001 grams (1 microgram)

**Example:**
- `1.000000` = 1 gram
- `0.065432` = 0.065432 grams
- `1000.123456` = 1kg + 0.123456g

### Why Decimal(18,2) for prices?
- **18 total digits**
- **2 decimal places:** Standard for currency (KES 15,373.65)

---

## 🔐 Database Constraints

### Unique Constraints
- `User.email` - One account per email
- `UserBalance.userId` - One balance per user

### Foreign Key Cascades
- Delete User → Cascades to UserBalance, Ledger, Payout, KycDocument
- Ensures data integrity

### Indexes
- `Ledger(userId, createdAt)` - Fast transaction history queries
- `Ledger(status)` - Fast pending transaction lookups
- `Payout(userId, status)` - Fast payout queries
- `Price(effectiveFrom)` - Fast current price lookup
- `KycDocument(userId, verified)` - Fast KYC status checks

---

## 🧪 Sample Data (After Seed)

### Admin User
```
email: admin@goldwallet.com
password: Admin123!
isAdmin: true
kycStatus: verified
```

### Initial Pool
```
name: "Pool 1 - 1kg 24k Gold"
totalGrams: 1000.000000
availableGrams: 1000.000000
purity: "24k"
```

### Initial Prices
```
buyPricePerGram: 15000.00 KES
sellPricePerGram: 14500.00 KES
effectiveFrom: now()
```

### Test User
```
email: test@example.com
password: Test123!
isAdmin: false
kycStatus: pending
balance: 0.000000 grams
```

---

## 🚀 Next Steps

1. **Run database migration:**
   ```bash
   cd backend
   npx prisma db push
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Seed initial data:**
   ```bash
   npm run prisma:seed
   ```

4. **View data in Prisma Studio:**
   ```bash
   npx prisma studio
   ```

---

## 📚 References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Decimal Types](https://www.postgresql.org/docs/current/datatype-numeric.html)
- MVP Specification: `docs/MVP.md`

