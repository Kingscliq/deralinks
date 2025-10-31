# Platform Fee Configuration Guide

All platform fees can be configured via environment variables without code changes.

## Environment Variables

### Phase 1: Minting Fees (Upfront Revenue)

```bash
MINTING_BASE_FEE=50           # Base fee in USD (charged once per collection)
MINTING_PER_NFT_FEE=0.5       # Fee per NFT in USD
```

**Example Calculations:**
- 100 NFTs: $50 + (100 × $0.50) = **$100**
- 1,000 NFTs: $50 + (1,000 × $0.50) = **$550**
- 10,000 NFTs: $50 + (10,000 × $0.50) = **$5,050**

---

### Phase 1: Primary Sale Commission

```bash
PRIMARY_SALE_COMMISSION=10    # Commission percentage when property owner sells from treasury
```

**Example:**
- Owner sells 100 NFTs at $1,000 each = $100,000
- Platform commission: 10% × $100,000 = **$10,000**
- Owner receives: **$90,000**

---

### Phase 2: Platform Transaction Fee

```bash
PLATFORM_TRANSACTION_FEE=2.5  # Fee percentage on all marketplace sales
```

**Example:**
- User sells 10 NFTs at $1,200 each = $12,000
- Platform fee: 2.5% × $12,000 = **$300**
- Seller receives: $12,000 - $300 - royalty = **$11,100**

---

### Phase 2: Listing Fees

```bash
LISTING_FEE_STANDARD=25       # Standard listing fee in USD
LISTING_FEE_PREMIUM=100       # Premium/featured listing fee in USD
LISTING_FEE_DURATION=90       # Listing validity in days
```

---

### NFT Royalty Fee

```bash
ROYALTY_FEE=5                 # Royalty percentage (enforced by Hedera)
```

**Note:** Royalty fees are automatically enforced by Hedera smart contracts on all secondary sales. This fee goes to the original property owner.

---

### Fee Collection Account

```bash
FEE_COLLECTOR_ACCOUNT_ID=0.0.xxxxx  # Hedera account that receives platform fees
```

If not set, defaults to `OPERATOR_ID`.

---

## Production Deployment

### Render.com

1. Navigate to your service dashboard
2. Click **Environment** tab
3. Add/update environment variables
4. Click **Save Changes**
5. Service will automatically restart with new fees

### Docker

Update your `.env` file or pass environment variables:

```bash
docker run -e MINTING_BASE_FEE=75 -e PRIMARY_SALE_COMMISSION=12 ...
```

### Kubernetes

Update ConfigMap or Secret:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: deralinks-fees
data:
  MINTING_BASE_FEE: "75"
  PRIMARY_SALE_COMMISSION: "12"
  PLATFORM_TRANSACTION_FEE: "3.0"
```

---

## Fee Examples by Scenario

### Scenario 1: Premium Property ($1M, 10,000 NFTs at $100)

| Fee Type | Calculation | Amount |
|----------|-------------|--------|
| Minting Fee | $50 + (10,000 × $0.50) | $5,050 |
| Primary Sales (5,000 NFTs) | 10% × $500,000 | $50,000 |
| **Total Platform Revenue** | | **$55,050** |

---

### Scenario 2: Mid-tier Property ($500K, 5,000 NFTs at $100)

| Fee Type | Calculation | Amount |
|----------|-------------|--------|
| Minting Fee | $50 + (5,000 × $0.50) | $2,550 |
| Primary Sales (3,000 NFTs) | 10% × $300,000 | $30,000 |
| **Total Platform Revenue** | | **$32,550** |

---

### Scenario 3: Small Property ($100K, 1,000 NFTs at $100)

| Fee Type | Calculation | Amount |
|----------|-------------|--------|
| Minting Fee | $50 + (1,000 × $0.50) | $550 |
| Primary Sales (500 NFTs) | 10% × $50,000 | $5,000 |
| **Total Platform Revenue** | | **$5,550** |

---

## Fee Optimization Strategies

### For Maximum Revenue
```bash
MINTING_BASE_FEE=100
MINTING_PER_NFT_FEE=1.0
PRIMARY_SALE_COMMISSION=15
PLATFORM_TRANSACTION_FEE=3.5
LISTING_FEE_STANDARD=50
```

### For Market Penetration
```bash
MINTING_BASE_FEE=25
MINTING_PER_NFT_FEE=0.25
PRIMARY_SALE_COMMISSION=7.5
PLATFORM_TRANSACTION_FEE=2.0
LISTING_FEE_STANDARD=15
```

### For Balanced Approach (Default)
```bash
MINTING_BASE_FEE=50
MINTING_PER_NFT_FEE=0.5
PRIMARY_SALE_COMMISSION=10
PLATFORM_TRANSACTION_FEE=2.5
LISTING_FEE_STANDARD=25
```

---

## Testing Fee Changes

Test locally before deploying:

```bash
# Update .env
MINTING_BASE_FEE=100
PRIMARY_SALE_COMMISSION=15

# Restart server
npm run dev

# Test mint endpoint
curl -X POST http://localhost:3600/api/v1/properties/mint \
  -H "Content-Type: application/json" \
  -d '{...}' | jq '.data.fees'
```

Expected response shows updated fees:
```json
{
  "mintingFee": 150,  // $100 + (100 × $0.50)
  "currency": "USD"
}
```

---

## Implementation Details

Fees are loaded from environment variables in `/src/config/fees.config.ts`:

```typescript
export const PLATFORM_FEES = {
  MINTING_FEE: {
    BASE_FEE: parseFloat(process.env.MINTING_BASE_FEE || '50'),
    PER_NFT_FEE: parseFloat(process.env.MINTING_PER_NFT_FEE || '0.5'),
  },
  PRIMARY_SALE_COMMISSION: parseFloat(process.env.PRIMARY_SALE_COMMISSION || '10'),
  // ... etc
};
```

All fees have sensible defaults if environment variables are not set.

---

## Monitoring Fee Revenue

Track platform revenue by querying the `platform_revenue` table:

```sql
-- Total revenue by type
SELECT 
  revenue_type, 
  SUM(amount) as total,
  COUNT(*) as count
FROM platform_revenue 
WHERE payment_status = 'paid'
GROUP BY revenue_type;

-- Revenue in last 30 days
SELECT 
  DATE(created_at) as date,
  SUM(amount) as daily_revenue
FROM platform_revenue
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Support

For questions or issues with fee configuration:
- Documentation: `/backend/API-DOCUMENTATION.md`
- Fee Config: `/backend/src/config/fees.config.ts`
- Environment: `/backend/.env.example`
