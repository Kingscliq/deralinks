# Phase 6B: KYC & Verification - Quick Start Guide

**Status:** ✅ Infrastructure Complete - Ready for KYC Provider Integration

## 🎯 Overview

Phase 6B implements a **NFT-Based Verification System** combining off-chain KYC with on-chain proof via Soulbound NFTs.

### The Model

```
User → Complete KYC (Onfido/Sumsub) → Platform mints Verification NFT → User owns NFT in wallet → Access Granted
```

**Key Benefits:**
- ✅ Regulatory compliant (can access identity via KYC provider)
- ✅ Privacy-preserving (no PII stored on-chain)
- ✅ Transparent (verification visible on-chain)
- ✅ Composable (other platforms could recognize)
- ✅ User-friendly (badge visible in wallet)

### 🎭 Tiered Access Model

**Important:** Not all users need verification!

| User Type | Verification Required? | Level | Purpose |
|-----------|----------------------|-------|---------|
| **Property Owners** | ✅ **MANDATORY** | `property-owner` | To tokenize/create NFTs |
| **Large Investors** | ⚠️ Optional* | `accredited` or `basic` | Based on amount/jurisdiction |
| **Small Investors** | ❌ Usually not required | None | Browse & small purchases |
| **Browsers** | ❌ No | None | View listings |

\* Depends on jurisdiction and investment amount

**See `VERIFICATION-TIERS.md` for complete details on who needs what.**

---

## 📚 Architecture Documentation

Four comprehensive guides have been created:

### 1. `DECENTRALIZED-KYC-STRATEGY.md`
Complete analysis of 4 different KYC approaches:
- **Option 1:** Traditional Centralized (⭐)
- **Option 2:** Custodial KYC (⭐⭐⭐) - Recommended
- **Option 3:** Decentralized Identity (⭐⭐⭐⭐)
- **Option 4:** Zero-Knowledge Proofs (⭐⭐⭐⭐⭐)

### 2. `KYC-PURPOSE-AND-COMPLIANCE.md`
Explains the hard truth about KYC and regulatory compliance:
- Why pure privacy doesn't work
- What regulators actually require
- How to respond to court orders
- The real trade-offs

### 3. `KYC-IMPLEMENTATION-GUIDE.md`
Practical implementation guide with code:
- Database schema
- API endpoints
- Webhook handlers
- Frontend integration

### 4. `NFT-BASED-KYC-MODEL.md`
Complete documentation of the NFT verification badge system (our chosen approach):
- Architecture overview
- Complete code examples
- Middleware implementation
- Revocation mechanisms
- Real-world examples (Civic Pass, Fractal ID)

---

## 🛠️ Scripts Created

### Script 09: Create Verification Collection
```bash
npm run kyc:create-collection
```

**What it does:**
- Creates HCS topic for KYC attestations
- Creates "DeraLinks Verified Users" NFT collection (DLVERIFY)
- Sets up Soulbound properties (non-transferable)
- Generates management keys (supply, freeze, wipe)
- Saves to `output/verification-collection.json`

**Output:**
- Token ID (e.g., `0.0.7200000`)
- Attestation Topic ID
- Management keys

---

### Script 10: Mint Verification NFT
```bash
npm run kyc:mint <account-id> [level] [jurisdiction]
```

**Verification Levels:**
- `property-owner` - Property owner/tokenizer (REQUIRED to create NFTs)
- `accredited` - Accredited investor verification
- `basic` - Basic KYC for investors (default)

**Examples:**
```bash
# Property owner verification (MOST COMMON - for those creating NFTs)
npm run kyc:mint 0.0.1234567 property-owner US

# Accredited investor verification
npm run kyc:mint 0.0.1234567 accredited US

# Basic KYC verification
npm run kyc:mint 0.0.1234567 basic US
```

**What it does:**
1. Creates verification metadata (NO PERSONAL DATA)
2. Uploads metadata to IPFS
3. Creates verification hash
4. Submits attestation to HCS
5. Mints verification NFT
6. Associates token with recipient (if operator)
7. Transfers NFT to recipient's wallet
8. Saves record to `output/verification-nfts.json`

**When to run:** After user completes KYC verification with your provider

---

### Script 11: Revoke/Freeze Verification
```bash
npm run kyc:revoke <account-id> <action> <reason>
```

**Actions:**
- `freeze` - Temporary suspension (reversible)
- `wipe` - Permanent revocation (removes NFT)

**Examples:**
```bash
# Temporary freeze
npm run kyc:revoke 0.0.1234567 freeze "Suspicious activity detected"

# Permanent revocation
npm run kyc:revoke 0.0.1234567 wipe "OFAC sanctions list match"
```

**What it does:**
1. Submits revocation attestation to HCS
2. Freezes account or wipes NFT from wallet
3. Saves revocation record to `output/verification-revocations.json`
4. Updates verification records

**When to use:**
- Terms of service violation
- Failed reverification
- Sanctions list match
- Regulatory requirement
- Suspicious activity

---

## 🔧 Utility Module: Verification Checker

**File:** `scripts/utils/verification-checker.ts`

### Functions

#### `checkVerificationNFT(accountId, network?)`
Checks if account owns valid verification NFT.

```typescript
const result = await checkVerificationNFT("0.0.1234567", "testnet");

if (result.isValid) {
  console.log(`User verified at ${result.level} level`);
} else {
  console.log(`Invalid: ${result.reason}`);
}
```

**Returns:**
```typescript
{
  isValid: boolean;
  isExpired: boolean;
  isFrozen: boolean;
  hasNFT: boolean;
  reason?: string;
  level?: "basic" | "accredited";
  serialNumber?: number;
  expiresAt?: string;
}
```

---

#### `requireVerificationLevel(accountId, requiredLevel, network?)`
Checks if account has specific verification level.

```typescript
const result = await requireVerificationLevel(
  "0.0.1234567",
  "accredited",
  "testnet"
);

if (result.allowed) {
  // Allow purchase of accredited-only securities
} else {
  console.log(`Denied: ${result.reason}`);
}
```

---

#### `batchCheckVerification(accountIds, network?)`
Check multiple accounts in parallel.

```typescript
const results = await batchCheckVerification([
  "0.0.1111111",
  "0.0.2222222",
  "0.0.3333333"
], "testnet");

results.forEach((result, accountId) => {
  console.log(`${accountId}: ${result.isValid}`);
});
```

---

#### `requireVerification(requiredLevel?)`
Express middleware for protecting routes.

```typescript
import { requireVerification } from './utils/verification-checker';

// Require any verification
app.post('/api/nft/purchase', requireVerification(), handlePurchase);

// Require specific level
app.post('/api/securities/purchase',
  requireVerification("accredited"),
  handleSecuritiesPurchase
);
```

**Response on failure:**
```json
{
  "error": "Verification required",
  "requiresKYC": true,
  "kycUrl": "/kyc/start",
  "requiredLevel": "accredited",
  "currentLevel": "basic"
}
```

---

#### `getVerificationStatus(accountId, network?)`
Get user-friendly verification status.

```typescript
const status = await getVerificationStatus("0.0.1234567", "testnet");

console.log(status);
// {
//   status: "verified",
//   message: "This account is verified and in good standing",
//   level: "basic",
//   expiresAt: "2026-01-15T00:00:00.000Z",
//   daysUntilExpiry: 325
// }
```

**Possible statuses:**
- `verified` - Active and valid
- `expired` - Needs reverification
- `frozen` - Account suspended
- `not_verified` - No verification NFT found

---

## 🔄 Complete Workflow

### Step 1: Create Verification Collection (One-time setup)
```bash
npm run kyc:create-collection
```

This creates:
- Verification NFT collection
- HCS attestation topic
- Management keys

**Do this once per environment (testnet/mainnet)**

---

### Step 2: User Registration & KYC

**Frontend Flow:**
```
1. User connects HashPack wallet
   ↓
2. Check if they own verification NFT
   ↓
3. If NO NFT → Redirect to KYC flow
   ↓
4. User completes KYC with Onfido/Sumsub
   ↓
5. Webhook triggers NFT minting
   ↓
6. User now owns verification NFT
   ↓
7. Access granted to platform
```

**Backend webhook handler (pseudo-code):**
```typescript
app.post('/api/kyc/webhook', async (req, res) => {
  const { applicantId, status, accountId } = req.body;

  if (status === 'approved') {
    // Mint verification NFT
    await mintVerificationNFT({
      hederaAccountId: accountId,
      kycApplicantId: applicantId,
      kycLevel: 'basic',
      jurisdiction: 'US'
    });

    // Notify user
    await sendEmail(accountId, 'KYC Approved - Verification NFT Minted');
  }

  res.status(200).send('OK');
});
```

---

### Step 3: Access Control

**Protect API endpoints:**
```typescript
import { requireVerification } from './scripts/utils/verification-checker';

// Basic verification required
app.post('/api/nft/purchase',
  requireVerification(),
  async (req, res) => {
    // User is verified, proceed with purchase
  }
);

// Accredited investor only
app.post('/api/securities/purchase',
  requireVerification("accredited"),
  async (req, res) => {
    // User is accredited investor, proceed
  }
);
```

**Frontend checks:**
```typescript
import { checkVerificationNFT } from './utils/verification-checker';

async function checkAccess(accountId: string) {
  const verification = await checkVerificationNFT(accountId, 'testnet');

  if (!verification.isValid) {
    // Show KYC modal
    showKYCModal({
      reason: verification.reason,
      kycUrl: '/kyc/start'
    });
    return false;
  }

  return true;
}
```

---

### Step 4: Compliance Actions

**Freeze account (temporary):**
```bash
npm run kyc:revoke 0.0.1234567 freeze "Failed reverification"
```

**Revoke permanently:**
```bash
npm run kyc:revoke 0.0.1234567 wipe "OFAC sanctions match"
```

**All actions are logged to HCS for audit trail.**

---

## 💰 Cost Estimates

### One-time setup:
- Create Verification NFT Collection: ~$1 USD
- Create HCS Attestation Topic: ~$1 USD
- **Total setup: ~$2 USD**

### Per user:
- KYC verification (Sumsub): $0.30 - $1.00
- Mint verification NFT: ~$0.05
- Transfer to user: ~$0.0001
- HCS attestation: ~$0.0001
- **Total per user: ~$0.36 - $1.06 USD**

### Revocation:
- Freeze account: ~$0.01
- Wipe NFT: ~$0.05

**Very affordable at scale!**

---

## 🔐 Security Considerations

### Keys Storage
All management keys are stored in `output/verification-collection.json`:
- ✅ File is gitignored
- ✅ Keep backups in secure location
- ✅ Use environment variables in production
- ✅ Consider using Hedera key management service

### PII Storage
**NEVER store PII on-chain or in your database:**
- ✅ Only store link to KYC provider (`kycApplicantId`)
- ✅ Only store verification hash
- ✅ Request identity from provider when needed

### Access Control
- ✅ Always check verification before operations
- ✅ Check both validity AND level for sensitive operations
- ✅ Implement rate limiting on verification endpoints
- ✅ Log all verification checks for audit

---

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Total verifications issued
- Verification levels distribution (basic vs accredited)
- Expiring verifications (renewal needed)
- Frozen/revoked accounts
- Verification requests by jurisdiction
- Average time from registration to verification

### HCS Attestation Topic
All events are logged to HCS:
- Verification issued
- Verification frozen
- Verification revoked
- Verification renewed

View on HashScan:
```
https://hashscan.io/testnet/topic/<attestation-topic-id>
```

---

## 🚀 Next Steps

### Immediate (Phase 6B completion):
1. ✅ Create KYC provider account (Sumsub recommended)
2. ✅ Get API credentials
3. ✅ Configure `.env` with credentials
4. ✅ Test KYC flow end-to-end
5. ✅ Create webhook handler for verification completion

### Integration with Phase 6C (Database & Backend):
1. Create API endpoint: `POST /api/kyc/start`
2. Create API endpoint: `POST /api/kyc/webhook`
3. Create API endpoint: `GET /api/kyc/status/:accountId`
4. Add verification checks to all protected endpoints
5. Create admin dashboard for compliance management

### Future Enhancements:
- Automatic reverification reminders (before expiry)
- Tiered verification (additional levels)
- Cross-platform verification recognition
- Self-service verification renewal
- Compliance reporting dashboard

---

## 📖 References

### Documentation Files
- `DECENTRALIZED-KYC-STRATEGY.md` - KYC architecture analysis
- `KYC-PURPOSE-AND-COMPLIANCE.md` - Regulatory compliance
- `KYC-IMPLEMENTATION-GUIDE.md` - Implementation details
- `NFT-BASED-KYC-MODEL.md` - NFT verification model

### Scripts
- `scripts/09-create-verification-collection.ts`
- `scripts/10-mint-verification-nft.ts`
- `scripts/11-revoke-verification.ts`
- `scripts/utils/verification-checker.ts`

### Real-World Examples
- **Civic Pass** (Solana) - Gateway Protocol
- **Fractal ID** (Multiple chains) - Identity verification
- **Galxe Passport** - Credential system
- **Proof of Humanity** (Ethereum) - Sybil resistance

---

## ❓ FAQ

### Q: Do users need to pay for verification?
**A:** No. The platform pays for KYC verification (~$0.36-1.06 per user). You can optionally charge a registration fee.

### Q: Can verification NFTs be transferred?
**A:** No. They are Soulbound (non-transferable) and permanently bound to the verified wallet.

### Q: What happens if user loses their wallet?
**A:** They need to:
1. Create new wallet
2. Complete KYC again with new wallet address
3. Platform mints new verification NFT to new wallet

### Q: Can we revoke a verification?
**A:** Yes. Two options:
- **Freeze:** Temporary (can be unfrozen)
- **Wipe:** Permanent (removes NFT)

### Q: Is this compliant with regulations?
**A:** Yes. You maintain ability to:
- Identify users (via KYC provider link)
- Respond to court orders
- Freeze/revoke access
- Maintain audit trail (via HCS)

### Q: Can other platforms recognize our verification NFTs?
**A:** Yes! Since it's on-chain, any platform can:
- Check if wallet owns verification NFT
- Read the verification level
- Decide whether to accept it

### Q: How long does verification last?
**A:** Default is 1 year. You can customize the expiry period in the minting script.

### Q: Can we have more than 2 verification levels?
**A:** Yes! You can add more levels:
- `basic` - Standard KYC
- `accredited` - Accredited investor
- `institutional` - Institutional investor
- `enhanced` - Enhanced due diligence

Just modify the type in the minting script.

---

## 🎉 Summary

**Phase 6B Infrastructure is COMPLETE!**

✅ **Architecture:** 4 comprehensive documentation files
✅ **Scripts:** Collection creation, minting, revocation
✅ **Utilities:** Middleware & verification checking
✅ **Model:** NFT-based verification badges (Soulbound)
✅ **Compliance:** Audit trail via HCS, revocation mechanisms
✅ **Cost:** ~$0.36-1.06 per user (very affordable)

**Ready for:** KYC provider integration and backend API development (Phase 6C)

---

**Questions?** Review the documentation files or check the inline code comments in each script.

**Need help?** All scripts have detailed error messages and usage instructions.

**Let's go!** 🚀
