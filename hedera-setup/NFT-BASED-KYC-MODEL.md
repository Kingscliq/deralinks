# NFT-Based KYC: The "Verification Badge" Model

## Your Idea: Use NFT Ownership as Proof of Verification

**Concept:**
1. KYC happens off-chain (with Onfido/Sumsub)
2. Upon successful verification → User receives a **DeraLinks Verification NFT**
3. To use the platform → Must own verification NFT
4. NFT = Your access pass / credential

**This is actually how many Web3 platforms are implementing compliance!**

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│         NFT-BASED VERIFICATION FLOW                     │
└─────────────────────────────────────────────────────────┘

Step 1: User Connects Wallet
├─ HashPack wallet: 0.0.123456
└─ Platform checks: Do they own Verification NFT?

Step 2: No NFT Found
├─ Redirect to KYC flow
├─ User completes verification with Onfido
└─ Onfido confirms: "Verified"

Step 3: Mint Verification NFT
├─ Platform mints NFT to user's wallet
├─ NFT ID: "DeraLinks Verified User #001"
├─ Metadata: { verified: true, level: "basic", expires: "2026" }
└─ NO PERSONAL DATA in NFT

Step 4: User Can Now Access Platform
├─ Own NFT → Can buy/sell property NFTs
├─ Don't own NFT → Blocked
└─ NFT expired → Must re-verify

Step 5: Ongoing Compliance
├─ Platform can freeze NFT (if sanctioned)
├─ Platform can burn NFT (if fraud detected)
├─ User can transfer NFT? (NO - make it Soulbound)
└─ User can sell verification? (NO - non-transferable)
```

---

## Implementation Architecture

### NFT Collection: "DeraLinks Verified Users"

**Create a separate NFT collection just for verification badges:**

```typescript
// Create Verification NFT Collection
const verificationCollection = await new TokenCreateTransaction()
  .setTokenName("DeraLinks Verified Users")
  .setTokenSymbol("DLVERIFY")
  .setTokenType(TokenType.NonFungibleUnique)
  .setTreasuryAccountId(platformTreasuryId)
  .setSupplyType(TokenSupplyType.Infinite)
  .setSupplyKey(platformSupplyKey)

  // Important: Make it non-transferable (Soulbound)
  .setFreezeKey(platformFreezeKey) // Can freeze/unfreeze
  .setFreezeDefault(false) // Not frozen by default

  // Optional: Can wipe if needed (fraud, sanctions)
  .setWipeKey(platformWipeKey)

  // Metadata
  .setTokenMemo("DeraLinks - Verified User Credentials - Non-Transferable")

  .execute(client);

const verificationTokenId = receipt.tokenId;
// e.g., 0.0.7200000
```

**Key Properties:**
- ✅ **Non-Transferable**: User can't sell their verification
- ✅ **Freezable**: Platform can freeze if user becomes sanctioned
- ✅ **Wipable**: Platform can revoke if fraud detected
- ✅ **Infinite Supply**: Can verify unlimited users
- ✅ **Unique Serials**: Each user gets unique NFT

---

## Database Schema

```typescript
interface VerificationNFT {
  // NFT info
  nft_token_id: string; // "0.0.7200000" (collection)
  nft_serial_number: number; // Unique per user

  // User info
  hedera_account_id: string; // "0.0.123456"

  // KYC info (off-chain)
  kyc_provider: string; // "onfido"
  kyc_applicant_id: string; // "onfido-abc-123" (link to their DB)
  kyc_level: string; // "basic" | "accredited"
  jurisdiction: string; // "US"

  // Verification status
  verification_status: string; // "active" | "expired" | "revoked" | "frozen"
  issued_at: Date;
  expires_at: Date;
  last_verified_at: Date;

  // Compliance
  sanctions_checked_at: Date;
  risk_level: string; // "low" | "medium" | "high"

  // Actions
  frozen: boolean;
  frozen_reason?: string; // "sanctions" | "investigation" | etc.
  frozen_at?: Date;

  // Audit
  created_at: Date;
  updated_at: Date;
}
```

**Important:** Still link to KYC provider (`kyc_applicant_id`) for regulatory requests!

---

## Minting Flow

```typescript
// After user completes KYC successfully
async function mintVerificationNFT(params: {
  hederaAccountId: string,
  kycApplicantId: string,
  kycLevel: 'basic' | 'accredited',
  jurisdiction: string
}) {
  try {
    // 1. Create NFT metadata
    const metadata = {
      name: "DeraLinks Verified User",
      description: "Proof of identity verification for DeraLinks platform",
      verified: true,
      level: params.kycLevel,
      jurisdiction: params.jurisdiction,
      issuedDate: new Date().toISOString(),
      expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      // NO PERSONAL DATA
      attributes: [
        { trait_type: "Verification Level", value: params.kycLevel },
        { trait_type: "Jurisdiction", value: params.jurisdiction },
        { trait_type: "Verified", value: "Yes" },
        { trait_type: "Type", value: "Identity Verification" }
      ]
    };

    // 2. Upload metadata to IPFS
    const metadataCID = await uploadJSON(metadata);

    // 3. Mint NFT to user's account
    const mintTx = await new TokenMintTransaction()
      .setTokenId(VERIFICATION_TOKEN_ID)
      .setMetadata([Buffer.from(metadataCID)])
      .freezeWith(client);

    const signedMintTx = await mintTx.sign(platformSupplyKey);
    const mintResponse = await signedMintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);

    const serialNumber = mintReceipt.serials[0].toNumber();

    // 4. Associate token with user's account
    // (User must sign this transaction via HashPack)
    // OR auto-associate if they have unlimited associations

    // 5. Transfer NFT to user
    const transferTx = await new TransferTransaction()
      .addNftTransfer(
        VERIFICATION_TOKEN_ID,
        serialNumber,
        platformTreasuryId,
        params.hederaAccountId
      )
      .freezeWith(client);

    const signedTransferTx = await transferTx.sign(platformTreasuryKey);
    const transferResponse = await signedTransferTx.execute(client);
    await transferResponse.getReceipt(client);

    // 6. Save to database
    await db.verificationNFTs.create({
      nft_token_id: VERIFICATION_TOKEN_ID,
      nft_serial_number: serialNumber,
      hedera_account_id: params.hederaAccountId,
      kyc_provider: 'onfido',
      kyc_applicant_id: params.kycApplicantId,
      kyc_level: params.kycLevel,
      jurisdiction: params.jurisdiction,
      verification_status: 'active',
      issued_at: new Date(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      last_verified_at: new Date(),
      frozen: false,
      risk_level: 'low'
    });

    // 7. Submit attestation to Hedera HCS
    await submitToHCS({
      topic: KYC_ATTESTATION_TOPIC,
      message: {
        type: 'verification-nft-minted',
        accountId: params.hederaAccountId,
        tokenId: VERIFICATION_TOKEN_ID,
        serialNumber: serialNumber,
        timestamp: Date.now()
        // NO PERSONAL DATA
      }
    });

    return {
      success: true,
      tokenId: VERIFICATION_TOKEN_ID,
      serialNumber,
      transactionId: transferResponse.transactionId.toString()
    };

  } catch (error) {
    console.error('Failed to mint verification NFT:', error);
    throw error;
  }
}
```

---

## Access Control (Middleware)

```typescript
// Middleware: Check if user owns verification NFT
async function requireVerificationNFT(
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  try {
    const { hederaAccountId } = req.body;

    // 1. Check if user owns verification NFT
    const ownsNFT = await checkVerificationNFTOwnership(hederaAccountId);

    if (!ownsNFT.isValid) {
      return res.status(403).json({
        error: 'Verification required',
        reason: ownsNFT.reason,
        requiresKYC: true,
        kycUrl: '/kyc/start'
      });
    }

    // 2. Check if NFT is expired
    if (ownsNFT.isExpired) {
      return res.status(403).json({
        error: 'Verification expired',
        reason: 'Your verification has expired. Please re-verify.',
        requiresReverification: true,
        expiresAt: ownsNFT.expiresAt
      });
    }

    // 3. Check if NFT is frozen
    if (ownsNFT.isFrozen) {
      return res.status(403).json({
        error: 'Account frozen',
        reason: ownsNFT.frozenReason,
        contactSupport: true
      });
    }

    // All checks passed - proceed
    req.verificationLevel = ownsNFT.level;
    next();

  } catch (error) {
    console.error('Verification check failed:', error);
    res.status(500).json({ error: 'Verification check failed' });
  }
}

// Check NFT ownership via Hedera Mirror Node
async function checkVerificationNFTOwnership(accountId: string) {
  try {
    // Query Mirror Node for NFT balance
    const response = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts?token.id=${VERIFICATION_TOKEN_ID}`
    );

    const data = await response.json();

    if (data.nfts.length === 0) {
      return {
        isValid: false,
        reason: 'No verification NFT found'
      };
    }

    // User should only have ONE verification NFT
    const nft = data.nfts[0];
    const serialNumber = nft.serial_number;

    // Get NFT details from database
    const verificationRecord = await db.verificationNFTs.findOne({
      nft_serial_number: serialNumber,
      hedera_account_id: accountId
    });

    if (!verificationRecord) {
      return {
        isValid: false,
        reason: 'Verification record not found'
      };
    }

    // Check if expired
    const isExpired = new Date(verificationRecord.expires_at) < new Date();

    // Check if frozen
    const isFrozen = verificationRecord.frozen;

    return {
      isValid: !isExpired && !isFrozen,
      isExpired,
      isFrozen,
      expiresAt: verificationRecord.expires_at,
      frozenReason: verificationRecord.frozen_reason,
      level: verificationRecord.kyc_level,
      serialNumber
    };

  } catch (error) {
    console.error('Failed to check NFT ownership:', error);
    return {
      isValid: false,
      reason: 'Failed to verify ownership'
    };
  }
}

// Use middleware on protected endpoints
app.post('/api/nft/purchase', requireVerificationNFT, async (req, res) => {
  // User has valid verification NFT
  // Proceed with NFT purchase
  const { nftTokenId, serialNumber } = req.body;

  // req.verificationLevel is available (from middleware)
  // Can enforce tier limits based on verification level

  await purchaseNFT({
    buyer: req.body.hederaAccountId,
    tokenId: nftTokenId,
    serial: serialNumber
  });

  res.json({ success: true });
});
```

---

## Making It Soulbound (Non-Transferable)

### Option 1: Freeze All Transfers

```typescript
// After minting, freeze the specific NFT so it can't be transferred
async function makeNFTSoulbound(tokenId: string, serialNumber: number) {
  const freezeTx = await new TokenFreezeTransaction()
    .setTokenId(tokenId)
    .setAccountId(ownerAccountId) // Can't transfer FROM this account
    .execute(client);

  await freezeTx.getReceipt(client);
}
```

**Problem**: User can't transfer it, but also can't receive other NFTs of this type

### Option 2: Smart Contract Enforcement (Better)

```solidity
// Hedera smart contract to prevent transfers
contract SoulboundVerification {
    mapping(address => bool) public isVerified;

    function mintVerification(address user) external onlyPlatform {
        require(!isVerified[user], "Already verified");
        isVerified[user] = true;
        // Emit event, mint NFT, etc.
    }

    function transfer(address from, address to, uint256 tokenId) external {
        revert("Verification NFTs are non-transferable");
    }
}
```

### Option 3: Backend Enforcement (Simplest)

```typescript
// Monitor transfers and auto-revoke if transferred
async function monitorVerificationNFTTransfers() {
  // Subscribe to NFT transfer events
  const mirrorNodeQuery = `
    /api/v1/transactions?transactionType=CRYPTOTRANSFER&token.id=${VERIFICATION_TOKEN_ID}
  `;

  // When transfer detected
  if (transfer.from !== platformTreasuryId) {
    // Someone is trying to transfer their verification NFT!

    // Option A: Burn both NFTs (sender and receiver)
    await burnNFT(VERIFICATION_TOKEN_ID, transfer.serialNumber);

    // Option B: Freeze both accounts
    await freezeAccount(transfer.from);
    await freezeAccount(transfer.to);

    // Log for investigation
    await db.violations.create({
      type: 'unauthorized_transfer',
      account_from: transfer.from,
      account_to: transfer.to,
      serial_number: transfer.serialNumber,
      timestamp: new Date()
    });
  }
}
```

---

## Compliance Features

### 1. Revoke Verification (Fraud, Sanctions)

```typescript
async function revokeVerification(accountId: string, reason: string) {
  // 1. Get their verification NFT
  const verification = await db.verificationNFTs.findOne({
    hedera_account_id: accountId,
    verification_status: 'active'
  });

  if (!verification) {
    throw new Error('No active verification found');
  }

  // 2. Wipe NFT from their account
  const wipeTx = await new TokenWipeTransaction()
    .setTokenId(verification.nft_token_id)
    .setAccountId(accountId)
    .setSerialNumbers([verification.nft_serial_number])
    .freezeWith(client);

  const signedWipeTx = await wipeTx.sign(platformWipeKey);
  const wipeResponse = await signedWipeTx.execute(client);
  await wipeResponse.getReceipt(client);

  // 3. Update database
  await db.verificationNFTs.update(
    { id: verification.id },
    {
      verification_status: 'revoked',
      frozen: true,
      frozen_reason: reason,
      frozen_at: new Date()
    }
  );

  // 4. Log to HCS
  await submitToHCS({
    topic: KYC_ATTESTATION_TOPIC,
    message: {
      type: 'verification-revoked',
      accountId: accountId,
      serialNumber: verification.nft_serial_number,
      reason: reason,
      timestamp: Date.now()
    }
  });

  // 5. Notify user
  await sendNotification(accountId, {
    type: 'verification_revoked',
    message: `Your verification has been revoked. Reason: ${reason}`,
    action: 'contact_support'
  });
}

// Use cases:
await revokeVerification('0.0.123456', 'Added to OFAC sanctions list');
await revokeVerification('0.0.789012', 'Fraudulent activity detected');
await revokeVerification('0.0.345678', 'Failed re-verification');
```

### 2. Temporary Freeze (Investigation)

```typescript
async function freezeVerification(accountId: string, reason: string) {
  const verification = await db.verificationNFTs.findOne({
    hedera_account_id: accountId
  });

  // Freeze the NFT (user still owns it, but it's marked frozen)
  await db.verificationNFTs.update(
    { id: verification.id },
    {
      frozen: true,
      frozen_reason: reason,
      frozen_at: new Date()
    }
  );

  // Platform checks frozen status in requireVerificationNFT middleware
  // User can't use platform while frozen
}

// Later, if investigation clears them:
async function unfreezeVerification(accountId: string) {
  await db.verificationNFTs.update(
    { hedera_account_id: accountId },
    {
      frozen: false,
      frozen_reason: null,
      frozen_at: null
    }
  );
}
```

### 3. Re-verification (Expired)

```typescript
async function requireReverification(accountId: string) {
  const verification = await db.verificationNFTs.findOne({
    hedera_account_id: accountId
  });

  // Check if expired
  const isExpired = new Date(verification.expires_at) < new Date();

  if (isExpired) {
    // Update status
    await db.verificationNFTs.update(
      { id: verification.id },
      { verification_status: 'expired' }
    );

    // Notify user
    await sendNotification(accountId, {
      type: 'verification_expired',
      message: 'Your verification has expired. Please re-verify to continue using the platform.',
      action: '/kyc/reverify'
    });

    // User must complete KYC again
    // Upon success, update existing NFT instead of minting new one
  }
}
```

---

## Frontend Integration

```tsx
// components/VerificationBadge.tsx
import { useEffect, useState } from 'react';

export function VerificationBadge({ accountId }: { accountId: string }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerification();
  }, [accountId]);

  const checkVerification = async () => {
    const response = await fetch('/api/verification/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId })
    });

    const data = await response.json();
    setVerification(data);
    setLoading(false);
  };

  if (loading) return <div>Checking verification...</div>;

  if (!verification?.isValid) {
    return (
      <div className="verification-required">
        <h3>⚠️ Verification Required</h3>
        <p>You must complete identity verification to use this platform.</p>
        <button onClick={() => window.location.href = '/kyc/start'}>
          Start Verification
        </button>
      </div>
    );
  }

  if (verification.isExpired) {
    return (
      <div className="verification-expired">
        <h3>⚠️ Verification Expired</h3>
        <p>Your verification expired on {verification.expiresAt}</p>
        <button onClick={() => window.location.href = '/kyc/reverify'}>
          Re-verify Now
        </button>
      </div>
    );
  }

  return (
    <div className="verification-badge">
      <div className="badge-icon">✅</div>
      <div className="badge-text">
        <strong>Verified User</strong>
        <small>Level: {verification.level}</small>
        <small>Expires: {new Date(verification.expiresAt).toLocaleDateString()}</small>
      </div>
    </div>
  );
}

// Use in app
function App() {
  const { accountId } = useHashPack(); // HashPack connection

  return (
    <div>
      <VerificationBadge accountId={accountId} />

      {/* Rest of app */}
    </div>
  );
}
```

---

## Benefits of This Approach

### ✅ Pros

1. **Transparent**: Anyone can see on-chain that account owns verification NFT
2. **Composable**: Other platforms could recognize DeraLinks verification
3. **Revocable**: Platform can wipe/freeze NFT if needed
4. **Portable**: User proves verification by showing NFT ownership
5. **Privacy**: NFT contains no PII, only verification status
6. **Compliant**: Still linked to KYC provider for regulatory requests
7. **User-friendly**: Visual badge in wallet
8. **Programmatic**: Smart contracts can check ownership

### ⚠️ Cons

1. **Not truly soulbound on Hedera** (requires workarounds)
2. **User could create new account** (need to prevent in smart contracts)
3. **NFT could be lost** (if user loses wallet keys)
4. **Cost**: Minting NFT per user (~$0.05 on mainnet)

---

## Comparison: Traditional vs NFT-Based KYC

| Feature | Traditional KYC | NFT-Based KYC |
|---------|----------------|---------------|
| **Verification Proof** | Database record | NFT ownership |
| **Transferable** | N/A | No (soulbound) |
| **On-chain** | No | Yes (NFT) |
| **Privacy** | Database has status | NFT has status (no PII) |
| **Revocable** | Delete from DB | Burn/wipe NFT |
| **Composable** | No | Yes (other platforms can see) |
| **Visual** | No | Yes (badge in wallet) |
| **Cost** | $0 | ~$0.05/user (minting) |
| **Compliance** | Link to KYC provider | Link to KYC provider |

---

## Real-World Examples

### 1. **Civic Pass** (Solana)
- Gateway tokens (NFTs) prove verification
- Used by DeFi protocols for compliance
- Exactly this model

### 2. **Proof of Humanity** (Ethereum)
- Verification creates on-chain credential
- Other apps check if you have it

### 3. **Galxe Passport** (Multi-chain)
- Identity NFTs
- Composable across platforms

### 4. **Fractal ID** (Multi-chain)
- Verification credentials as NFTs
- Used by regulated platforms

**This is becoming the STANDARD for Web3 compliance.**

---

## Implementation Checklist

**Phase 1: Basic NFT Verification**
- [ ] Create Verification NFT collection
- [ ] Implement minting after KYC success
- [ ] Add middleware to check NFT ownership
- [ ] Enforce verification on all protected endpoints
- [ ] Test on Hedera testnet

**Phase 2: Compliance Features**
- [ ] Implement NFT revocation (wipe)
- [ ] Implement freeze functionality
- [ ] Add expiration checks
- [ ] Build re-verification flow
- [ ] Monitor for unauthorized transfers

**Phase 3: Advanced Features**
- [ ] Make NFT truly soulbound (smart contract)
- [ ] Add verification levels (basic, accredited)
- [ ] Implement automatic renewal
- [ ] Build admin dashboard for managing verifications

---

## Cost Analysis

**Per User on Mainnet:**
- KYC verification: $0.30 - $1.00 (Onfido/Sumsub)
- Mint verification NFT: ~$0.05 (Hedera)
- Transfer NFT to user: ~$0.01 (Hedera)
- **Total: ~$0.36 - $1.06 per user**

**For 1,000 users:** ~$360 - $1,060

**This is VERY affordable for a compliance system.**

---

## Conclusion

**Your idea is EXCELLENT and actually the direction Web3 is heading!**

**Benefits:**
- ✅ KYC stays off-chain (private)
- ✅ Verification is on-chain (transparent)
- ✅ NFT ownership = access pass
- ✅ Platform controls (can revoke)
- ✅ User-friendly (badge in wallet)
- ✅ Compliant (linked to KYC provider)
- ✅ Composable (other platforms could use)

**This gives you the best of both worlds:**
- Regulatory compliance (via KYC provider link)
- Decentralization (verification on-chain)
- Privacy (no PII in NFT)
- User control (NFT in their wallet)

**Recommendation: Implement this!** It's modern, compliant, and aligns with Web3 principles.

Want me to help you build this?
