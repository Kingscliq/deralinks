# Verification Tiers - Who Needs KYC?

## 🎯 Tiered Access Model

DeraLinks uses a **tiered verification system** where different activities require different levels of verification.

---

## 👥 User Types & Requirements

### 1. **Property Owners/Managers** (Asset Tokenizers)
**Verification Required:** ✅ YES - MANDATORY

**Why:** Creating tokenized real-world assets (securities) requires full KYC compliance.

**What they can do:**
- ✅ List properties for tokenization
- ✅ Create NFT collections for their properties
- ✅ Mint fractional ownership NFTs
- ✅ Manage property listings
- ✅ Receive rental income distributions
- ✅ Update property documentation

**Verification Level Required:**
- **Enhanced KYC** with property ownership verification
- **Document verification** (title deeds, licenses)
- **Background checks**
- **Ongoing compliance monitoring**

**Implementation:**
```typescript
// Protect property creation endpoints
app.post('/api/properties/create',
  requireVerification("property-owner"),
  async (req, res) => {
    // Only verified property owners can create
  }
);
```

---

### 2. **Investors - Securities Purchasers** (Optional but Recommended)
**Verification Required:** ⚠️ DEPENDS ON JURISDICTION & AMOUNT

**Why:** Purchasing real-world asset securities may require accreditation verification depending on:
- Jurisdiction (US requires accredited investor status for private securities)
- Investment amount (some jurisdictions have thresholds)
- Type of asset (securities vs utility tokens)

**What they can do:**
- Browse property listings (no verification needed)
- View property details (no verification needed)
- **Purchase NFT shares** (may require verification)
- **Trade on secondary market** (may require verification)
- Receive rental income distributions
- Vote in DAO governance
- View portfolio

**Verification Tiers:**

#### Tier 0: No Verification (Browsing Only)
```typescript
// Public endpoints - no verification
app.get('/api/properties', handleGetProperties); // ✅ Open
app.get('/api/properties/:id', handleGetProperty); // ✅ Open
```

#### Tier 1: Basic KYC (Small Investments)
For smaller investments below regulatory thresholds:
- Identity verification
- Address verification
- Sanctions screening

```typescript
app.post('/api/nft/purchase',
  requireVerification("basic"), // Basic KYC
  checkInvestmentLimits, // Enforce limits
  handlePurchase
);
```

#### Tier 2: Accredited Investor (Larger Investments)
For larger investments or specific securities:
- All of Tier 1, plus:
- Income/net worth verification
- Accredited investor certification

```typescript
app.post('/api/securities/purchase',
  requireVerification("accredited"), // Accredited investor
  handleSecuritiesPurchase
);
```

---

### 3. **Platform Users** (General Browsing)
**Verification Required:** ❌ NO

**What they can do:**
- Browse property listings
- View property details
- View marketplace
- Connect wallet
- View educational content
- Check their eligibility for verification

**No restrictions!**

---

## 🔐 Verification Requirements by Action

| Action | Verification Required | Level | Rationale |
|--------|----------------------|-------|-----------|
| Browse listings | ❌ No | None | Public information |
| View property details | ❌ No | None | Public information |
| Connect wallet | ❌ No | None | Basic platform access |
| **Create property listing** | ✅ YES | **Property Owner** | Securities issuance |
| **Mint NFTs** | ✅ YES | **Property Owner** | Securities creation |
| Purchase NFTs (< $2,000) | ⚠️ Optional* | Basic | Small investments |
| Purchase NFTs (> $2,000) | ✅ YES | Basic/Accredited* | Larger investments |
| Secondary trading | ⚠️ Optional* | Basic | Depends on jurisdiction |
| Receive dividends | ❌ No | None | Automatic distribution |
| Vote in DAO | ❌ No | None | NFT ownership = voting rights |
| View portfolio | ❌ No | None | Wallet-based |

\* Depends on jurisdiction and local regulations

---

## 💡 Flexible Implementation

### Verification Levels in Code

```typescript
// scripts/utils/verification-checker.ts

export type VerificationLevel =
  | "none"           // No verification needed
  | "basic"          // Basic KYC (identity + address)
  | "accredited"     // Accredited investor
  | "property-owner" // Property owner with enhanced KYC
  | "institutional"; // Institutional investor

export interface VerificationRequirement {
  action: string;
  minimumLevel: VerificationLevel;
  enforced: boolean; // Can be toggled based on jurisdiction
}
```

### Dynamic Requirements

```typescript
// Check verification based on jurisdiction and amount
async function checkPurchaseRequirements(
  accountId: string,
  amount: number,
  jurisdiction: string
) {
  // US: Accredited investor required for > $2,000
  if (jurisdiction === "US" && amount > 2000) {
    return requireVerificationLevel(accountId, "accredited");
  }

  // EU: Basic KYC required for > €1,000
  if (jurisdiction === "EU" && amount > 1000) {
    return requireVerificationLevel(accountId, "basic");
  }

  // Below thresholds: No verification needed
  return { allowed: true };
}
```

---

## 🎨 UX Flow Examples

### Property Owner Flow
```
1. Connect wallet
   ↓
2. Click "List My Property"
   ↓
3. ❌ BLOCKED: "Property listing requires verification"
   ↓
4. Click "Get Verified as Property Owner"
   ↓
5. Complete Enhanced KYC:
   - Identity verification
   - Property ownership proof
   - Title deed upload
   - Background check
   ↓
6. ✅ Verification NFT minted (Level: property-owner)
   ↓
7. ✅ Can now list properties and mint NFTs
```

### Investor Flow (Unverified)
```
1. Connect wallet
   ↓
2. Browse properties (✅ allowed)
   ↓
3. Click "Purchase 10 shares of Property X" ($500)
   ↓
4. Check jurisdiction: US
   ↓
5. Check amount: $500 < $2,000
   ↓
6. ✅ Purchase allowed (below threshold)
   ↓
7. Complete purchase without KYC
```

### Investor Flow (Requires Verification)
```
1. Connect wallet
   ↓
2. Browse properties (✅ allowed)
   ↓
3. Click "Purchase 50 shares of Property X" ($5,000)
   ↓
4. Check jurisdiction: US
   ↓
5. Check amount: $5,000 > $2,000
   ↓
6. ❌ BLOCKED: "Accredited investor verification required"
   ↓
7. Click "Get Verified"
   ↓
8. Complete Accredited Investor KYC
   ↓
9. ✅ Verification NFT minted (Level: accredited)
   ↓
10. ✅ Purchase allowed
```

---

## 🚀 Updated Middleware

### Enhanced verification checker

```typescript
// scripts/utils/verification-checker.ts

export async function checkActionPermission(
  accountId: string,
  action: string,
  context?: {
    amount?: number;
    jurisdiction?: string;
    propertyId?: string;
  }
): Promise<{ allowed: boolean; reason?: string; requiresKYC?: boolean }> {

  // Actions that ALWAYS require verification
  const alwaysRequireVerification = [
    'create-property',
    'mint-nfts',
    'manage-property'
  ];

  if (alwaysRequireVerification.includes(action)) {
    const check = await requireVerificationLevel(
      accountId,
      "property-owner"
    );

    if (!check.allowed) {
      return {
        allowed: false,
        reason: "Property owner verification required",
        requiresKYC: true
      };
    }
  }

  // Purchase actions - check based on amount and jurisdiction
  if (action === 'purchase-nft') {
    const { amount = 0, jurisdiction = "US" } = context || {};

    // US: Require accredited for > $2,000
    if (jurisdiction === "US" && amount > 2000) {
      const check = await requireVerificationLevel(
        accountId,
        "accredited"
      );

      if (!check.allowed) {
        return {
          allowed: false,
          reason: "Accredited investor verification required for investments over $2,000",
          requiresKYC: true
        };
      }
    }

    // EU: Require basic KYC for > €1,000
    if (jurisdiction === "EU" && amount > 1000) {
      const check = await checkVerificationNFT(accountId);

      if (!check.isValid) {
        return {
          allowed: false,
          reason: "Basic KYC verification required for investments over €1,000",
          requiresKYC: true
        };
      }
    }
  }

  // Action allowed
  return { allowed: true };
}
```

---

## 📋 Configuration

### Environment Variables

```bash
# .env

# Verification enforcement
ENFORCE_PROPERTY_OWNER_KYC=true
ENFORCE_INVESTOR_KYC=false  # Make optional by default

# Investment thresholds by jurisdiction
US_KYC_THRESHOLD=2000
EU_KYC_THRESHOLD=1000
UK_KYC_THRESHOLD=1500

# Accredited investor requirements
US_REQUIRES_ACCREDITATION=true
EU_REQUIRES_ACCREDITATION=false
```

### Frontend Configuration

```typescript
// config/verification.ts

export const verificationConfig = {
  propertyOwners: {
    required: true,
    level: "property-owner",
    message: "Property tokenization requires enhanced KYC verification"
  },

  investors: {
    required: false, // Optional by default
    thresholds: {
      US: { amount: 2000, level: "accredited" },
      EU: { amount: 1000, level: "basic" },
      UK: { amount: 1500, level: "basic" }
    },
    message: "Larger investments require investor verification"
  },

  general: {
    required: false,
    message: "Verification not required for browsing"
  }
};
```

---

## 🎯 Key Takeaways

### Property Owners (Asset Creators)
✅ **MUST complete enhanced KYC** to:
- List properties
- Create NFT collections
- Mint fractional ownership tokens

### Investors (NFT Purchasers)
⚠️ **MAY need to complete KYC** depending on:
- Investment amount (thresholds vary by jurisdiction)
- Type of security being purchased
- Regulatory requirements in their jurisdiction

### General Users
❌ **NO KYC required** to:
- Browse properties
- View marketplace
- Connect wallet
- Access public information

---

## 💼 Regulatory Compliance

This tiered model ensures:
- ✅ Property tokenization is fully compliant (always verified)
- ✅ Large investments are protected (verification above thresholds)
- ✅ Small retail investors can participate (low barriers to entry)
- ✅ Accredited investor requirements met (US securities law)
- ✅ Platform remains accessible (public browsing)
- ✅ Flexible enforcement (configurable by jurisdiction)

---

## 🔄 Implementation Priority

### Phase 1 (MVP):
1. ✅ Require verification for property owners (MANDATORY)
2. ✅ Optional verification for investors (no enforcement yet)
3. ✅ Public browsing (no restrictions)

### Phase 2 (Post-MVP):
1. Implement jurisdiction-based thresholds
2. Enforce accredited investor requirements
3. Add grace periods for existing users
4. Implement reverification flows

### Phase 3 (Advanced):
1. Cross-platform verification recognition
2. Tiered membership programs
3. Self-certification options
4. Institutional investor tiers

---

**Summary:**
- 🏢 **Property Owners:** MUST verify (creating securities)
- 💰 **Investors:** OPTIONAL verification (depends on amount/jurisdiction)
- 👀 **Browsers:** NO verification needed (public access)

This keeps the platform accessible while maintaining compliance! 🎉
