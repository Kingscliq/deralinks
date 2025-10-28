# Decentralized KYC & Compliance Strategy

## The Fundamental Challenge

**The Tension:**
- **Compliance Requirements**: Real-world asset (RWA) platforms must verify investor identity, prevent money laundering, and comply with securities regulations
- **Decentralization Goals**: Users should control their data, maintain privacy, and not rely on single points of failure

**The Solution:** A hybrid approach that separates identity verification from identity storage and uses cryptographic proofs

---

## Recommended Approach: Privacy-Preserving KYC

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│           DECENTRALIZED KYC ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────┘

User Identity                        Blockchain (Hedera)
     │                                      │
     ↓                                      ↓
┌──────────────┐                   ┌──────────────────┐
│   User's     │                   │   Smart Contract │
│  HashPack    │                   │   or Token       │
│   Wallet     │                   │   Collection     │
│ 0.0.123456   │                   │                  │
└──────┬───────┘                   └────────┬─────────┘
       │                                     │
       │                                     │
       ↓                                     ↓
┌──────────────────────┐            ┌──────────────────┐
│  Decentralized ID    │            │  On-Chain        │
│  (DID) System        │◄───────────│  Attestation     │
│  - Self-sovereign    │  Verifies  │  (Hash only)     │
│  - User controls     │            │                  │
└──────┬───────────────┘            └──────────────────┘
       │
       ↓
┌──────────────────────┐
│  KYC Verification    │
│  (Off-chain)         │
│  - Onfido/Jumio      │
│  - Data encrypted    │
│  - User controlled   │
└──────────────────────┘
```

---

## Option 1: Decentralized Identity (DID) + Verifiable Credentials (RECOMMENDED)

### How It Works

**Step 1: User Creates Decentralized Identifier (DID)**
```
User → Generates DID (e.g., did:hedera:testnet:0.0.123456)
       ↓
     Stores DID on Hedera (via HCS or File Service)
       ↓
     User controls private keys (in HashPack wallet)
```

**Step 2: User Completes KYC with Trusted Provider**
```
User → Submits documents to KYC provider (Onfido, etc.)
       ↓
     KYC provider verifies identity
       ↓
     Issues Verifiable Credential (VC) to User's DID
       ↓
     User stores VC locally (encrypted in wallet/browser)
```

**Step 3: User Proves Compliance On-Demand**
```
User wants to buy NFT
       ↓
     Platform requests proof of KYC
       ↓
     User presents VC (cryptographically signed by KYC provider)
       ↓
     Platform verifies signature (no personal data shared)
       ↓
     NFT purchase allowed
```

### Key Benefits

✅ **User Controls Data**: KYC documents stored locally or in user's encrypted storage
✅ **Privacy**: Only proof of verification shared, not actual identity documents
✅ **Portable**: User can use same VC across multiple platforms
✅ **Revocable**: User can revoke access to credentials
✅ **Auditable**: All verifications recorded on blockchain (as hashes)
✅ **Decentralized**: No single point of failure or data honey pot

### Implementation

**Use Hedera DID Method:**
```bash
# Install Hedera DID SDK
npm install @hashgraph/did-sdk-js
```

**Create DID Document:**
```typescript
import { HcsDid } from '@hashgraph/did-sdk-js';

// Create DID anchored to Hedera HCS topic
const did = new HcsDid({
  identifier: "0.0.123456", // User's Hedera account
  privateKey: userPrivateKey,
  client: hederaClient
});

// Register DID on Hedera
await did.register();

// DID: did:hedera:testnet:0.0.123456_0.0.7127453
```

**Issue Verifiable Credential:**
```typescript
import { VerifiableCredential } from '@veramo/core';

// KYC provider issues credential
const credential = {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "KYCCredential"],
  "issuer": "did:hedera:testnet:kyc-provider",
  "issuanceDate": "2025-10-27T00:00:00Z",
  "credentialSubject": {
    "id": "did:hedera:testnet:0.0.123456_0.0.7127453",
    "kycVerified": true,
    "kycLevel": "basic",
    "accreditedInvestor": false,
    "jurisdiction": "US",
    "verificationType": "identity-document"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-10-27T00:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:hedera:testnet:kyc-provider#key-1",
    "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..."
  }
};

// User stores this credential locally (browser storage, wallet)
```

**Verify Credential On-Chain:**
```typescript
// Smart contract or backend verifies
async function verifyKYC(userDID: string, credential: any) {
  // 1. Verify credential signature
  const isValid = await verifyCredentialSignature(credential);

  // 2. Check issuer is trusted KYC provider
  const trustedIssuers = ["did:hedera:testnet:kyc-provider"];
  const isTrusted = trustedIssuers.includes(credential.issuer);

  // 3. Check credential hasn't expired
  const isNotExpired = new Date(credential.expirationDate) > new Date();

  // 4. Record verification hash on Hedera (privacy-preserving)
  if (isValid && isTrusted && isNotExpired) {
    const proofHash = hashCredential(credential);
    await recordVerificationOnChain(userDID, proofHash);
    return true;
  }

  return false;
}
```

---

## Option 2: Zero-Knowledge Proofs (ZKP) - Maximum Privacy

### How It Works

User proves they are KYC-verified without revealing ANY personal information.

**Example: Prove Age > 18 without revealing actual age**

```typescript
// User generates ZK proof
const proof = generateZKProof({
  claim: "age >= 18",
  actualAge: 25, // Private input
  publicOutput: true // Only reveals: "proof is valid"
});

// Platform verifies proof
const isValid = verifyZKProof(proof);
// Result: true (but platform doesn't know user is 25, only that age >= 18)
```

### Implementation Options

**Option A: Use Existing ZK Frameworks**
- **zkSNARKs**: Using Circom + SnarkJS
- **zkSTARKs**: Using StarkNet/Cairo
- **Hedera Integration**: Store proof hashes on HCS

**Option B: Polygon ID (Recommended for RWA)**
```bash
npm install @0xpolygonid/js-sdk
```

**Example: Polygon ID Integration**
```typescript
import { auth, resolver, loaders } from '@0xpolygonid/js-sdk';

// User proves KYC status with ZK proof
async function createKYCProof(userDID: string) {
  // User has credential from KYC provider (off-chain)
  const credential = loadUserCredential();

  // Create ZK proof that credential is valid
  const proofRequest = {
    id: "1",
    circuitId: "credentialAtomicQuerySigV2",
    query: {
      allowedIssuers: ["*"],
      type: "KYCCredential",
      credentialSubject: {
        kycVerified: { $eq: true }
      }
    }
  };

  const proof = await generateProof(credential, proofRequest);
  return proof; // Contains no personal data!
}

// Platform verifies proof
async function verifyKYCProof(proof: any) {
  const isValid = await verifyProof(proof);
  // isValid = true/false (no personal info revealed)
  return isValid;
}
```

### Benefits

✅ **Maximum Privacy**: Zero personal data shared
✅ **Regulatory Compliant**: Still proves compliance
✅ **User Control**: Users own their credentials
✅ **Selective Disclosure**: Prove only what's needed (age, citizenship, accreditation)

### Challenges

⚠️ **Complexity**: ZK proofs are technically complex
⚠️ **Performance**: Proof generation can be slow
⚠️ **Adoption**: Fewer KYC providers support ZK credentials yet

---

## Option 3: Tiered Access Model (Pragmatic Hybrid)

### How It Works

Different features require different verification levels:

```
┌─────────────────────────────────────────────────────────┐
│                  ACCESS TIERS                           │
└─────────────────────────────────────────────────────────┘

Tier 0: Anonymous (No KYC)
├─ View NFTs and marketplace
├─ Browse property details
└─ Read-only access

Tier 1: Basic Verification (Email + Wallet)
├─ Create account linked to Hedera wallet
├─ Participate in DAO voting (small holdings)
└─ Receive platform notifications

Tier 2: Identity Verified (KYC Basic)
├─ Purchase NFTs up to $10,000
├─ List NFTs for sale
├─ Full DAO participation
└─ Receive distributions

Tier 3: Accredited Investor (KYC Advanced)
├─ Purchase NFTs over $10,000
├─ Access exclusive high-value properties
├─ Propose governance changes
└─ Enhanced distribution options
```

### Implementation

**Database Schema:**
```typescript
interface InvestorAccount {
  id: string;
  hederaAccountId: string;
  walletAddress: string;

  // Verification levels
  emailVerified: boolean;
  phoneVerified: boolean;

  // KYC status (stored as hash only)
  kycStatus: 'none' | 'pending' | 'basic' | 'accredited';
  kycVerificationHash: string; // SHA256 of verification data
  kycProvider: string; // "onfido" | "jumio" | etc.
  kycCompletedAt?: Date;
  kycExpiresAt?: Date;

  // Jurisdiction info (for compliance)
  jurisdiction: string; // "US" | "EU" | etc.

  // Attestation (on-chain proof)
  attestationTopicId?: string;
  attestationMessageId?: string;
}
```

**Smart Contract / Backend Check:**
```typescript
async function checkPurchaseAllowed(
  accountId: string,
  nftPrice: number
): Promise<{ allowed: boolean; reason?: string }> {
  const investor = await getInvestor(accountId);

  // Tier 0: Anonymous users can't buy
  if (!investor) {
    return { allowed: false, reason: "Account required" };
  }

  // Tier 1: Email verified only (small purchases)
  if (nftPrice <= 1000 && investor.emailVerified) {
    return { allowed: true };
  }

  // Tier 2: Basic KYC (up to $10k)
  if (nftPrice <= 10000 && investor.kycStatus === 'basic') {
    return { allowed: true };
  }

  // Tier 3: Accredited investor (any amount)
  if (investor.kycStatus === 'accredited') {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Purchase of $${nftPrice} requires KYC verification`
  };
}
```

**On-Chain Attestation (Privacy-Preserving):**
```typescript
// Record ONLY verification status on Hedera (not personal data)
async function attestKYCOnChain(
  accountId: string,
  kycLevel: 'basic' | 'accredited'
) {
  const message = {
    timestamp: Date.now(),
    accountId: accountId,
    verificationType: kycLevel,
    verificationHash: sha256(`${accountId}:${kycLevel}:${Date.now()}`),
    // NO PERSONAL DATA
  };

  // Submit to HCS topic for transparency
  await submitToTopic(KYC_ATTESTATION_TOPIC, JSON.stringify(message));
}
```

---

## Option 4: Decentralized KYC Providers (Emerging Solutions)

### Use Decentralized KYC Services

**Fractal ID** (Blockchain-native KYC)
- User completes KYC once
- Gets reusable identity credential
- Can use across multiple platforms
- Privacy-preserving

**Civic Pass** (Solana, but adaptable)
- On-chain identity verification
- Gateway tokens prove compliance
- No personal data on-chain

**SelfKey** (Self-sovereign identity)
- User controls identity wallet
- Shares credentials selectively
- Works across platforms

**Hedera-Specific Solution:**
```typescript
// Use Hedera Guardian for verifiable credentials
import { Guardian } from '@guardian/interfaces';

async function issueKYCCredential(userDID: string) {
  const guardian = new Guardian(hederaClient);

  // Issue credential via Hedera Guardian
  const credential = await guardian.issueVerifiableCredential({
    did: userDID,
    schema: 'KYC-Basic-v1',
    data: {
      verified: true,
      level: 'basic',
      // Minimal data
    }
  });

  return credential;
}
```

---

## Recommended Implementation Strategy

### Phase 1: MVP (Minimum Viable Privacy)

**Start Simple, Stay Private:**

1. **Off-Chain KYC, On-Chain Attestation**
   ```typescript
   // User completes KYC with Onfido/Jumio (off-chain)
   // Store verification status on Hedera as HASH only

   const kycHash = sha256(JSON.stringify({
     accountId: user.hederaAccountId,
     verified: true,
     timestamp: Date.now(),
     provider: 'onfido'
   }));

   // Submit hash to HCS topic (public, auditable, but private)
   await submitToTopic(KYC_TOPIC, kycHash);
   ```

2. **Database Stores Minimal Data**
   ```typescript
   interface KYCRecord {
     hederaAccountId: string; // Public
     kycStatus: 'verified' | 'pending' | 'rejected'; // Status only
     verificationHash: string; // Link to on-chain attestation
     provider: string; // Which KYC provider
     completedAt: Date;
     expiresAt: Date;
     // NO personal information (name, address, DOB, etc.)
   }
   ```

3. **User Data Encrypted & User-Controlled**
   - KYC documents stored by provider (Onfido/Jumio)
   - User can request deletion (GDPR compliant)
   - Platform never stores sensitive data

### Phase 2: Decentralized Identity

**Add DID Support:**
1. Integrate Hedera DID method
2. Issue Verifiable Credentials
3. Users store credentials in wallet
4. Platform verifies credentials on-demand

### Phase 3: Zero-Knowledge Proofs

**Maximum Privacy:**
1. Integrate Polygon ID or similar
2. Users prove compliance with ZK proofs
3. No data sharing, full privacy

---

## Compliance Strategy

### Regulatory Requirements vs Decentralization

| Requirement | Centralized Approach | Decentralized Approach |
|-------------|---------------------|------------------------|
| **Identity Verification** | Store user data in database | Issue Verifiable Credential to user's DID |
| **AML Screening** | Check against sanctions lists | Use ZK proof of "not sanctioned" |
| **Accredited Investor** | Store accreditation status | User presents credential proving accreditation |
| **Audit Trail** | Database records | HCS topic messages (hashes only) |
| **Data Privacy (GDPR)** | User requests deletion | User controls data, can revoke credentials |

### Compliance Features That Support Decentralization

✅ **Wallet-Based Identity**: Hedera account = user identity
✅ **On-Chain Attestations**: Proof of verification (not data) on Hedera
✅ **Revocable Credentials**: Users can revoke if compromised
✅ **Selective Disclosure**: Share only what regulators require
✅ **Time-Limited Verification**: Credentials expire, must re-verify
✅ **Jurisdiction-Specific Rules**: Smart contracts enforce based on location

---

## Implementation Roadmap

### Week 1-2: Foundation
- [ ] Choose KYC provider (Onfido, Jumio, or Sumsub)
- [ ] Implement off-chain verification flow
- [ ] Store verification STATUS only (no personal data)
- [ ] Create HCS topic for attestations
- [ ] Submit verification hashes to HCS

### Week 3-4: Decentralized Identity
- [ ] Integrate Hedera DID SDK
- [ ] Allow users to create DIDs
- [ ] Issue Verifiable Credentials
- [ ] Implement credential verification

### Week 5-6: Smart Contract Integration
- [ ] Add KYC checks to NFT purchase flow
- [ ] Implement tiered access control
- [ ] Add credential verification to smart contracts

### Week 7-8: Advanced Privacy (Optional)
- [ ] Research ZK proof solutions
- [ ] Implement Polygon ID or similar
- [ ] Add selective disclosure features

---

## Code Example: Complete Flow

```typescript
// 1. User initiates KYC
async function startKYC(hederaAccountId: string) {
  // Create DID for user
  const did = await createHederaDID(hederaAccountId);

  // Redirect to KYC provider
  const kycUrl = await createKYCSession({
    userId: hederaAccountId,
    returnUrl: 'https://deralinks.com/kyc/callback'
  });

  return { did, kycUrl };
}

// 2. KYC provider webhook (user completed verification)
async function handleKYCComplete(data: {
  userId: string,
  status: 'approved' | 'rejected',
  sessionId: string
}) {
  if (data.status === 'approved') {
    // Issue Verifiable Credential
    const credential = await issueKYCCredential({
      did: `did:hedera:testnet:${data.userId}`,
      level: 'basic',
      provider: 'onfido'
    });

    // Submit attestation hash to Hedera
    const attestationHash = sha256(JSON.stringify(credential));
    await submitToHCS(KYC_TOPIC, {
      type: 'kyc-verification',
      accountId: data.userId,
      hash: attestationHash,
      timestamp: Date.now()
    });

    // Store minimal data in database
    await db.kycRecords.create({
      hederaAccountId: data.userId,
      kycStatus: 'verified',
      verificationHash: attestationHash,
      provider: 'onfido',
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });

    // Send credential to user (email or download)
    await sendCredentialToUser(data.userId, credential);
  }
}

// 3. User wants to buy NFT
async function purchaseNFT(buyerAccountId: string, nftId: string) {
  // Check if user has valid KYC
  const kycRecord = await db.kycRecords.findOne({
    hederaAccountId: buyerAccountId,
    kycStatus: 'verified',
    expiresAt: { $gt: new Date() }
  });

  if (!kycRecord) {
    throw new Error('KYC verification required');
  }

  // Verify attestation exists on Hedera (optional extra check)
  const attestationExists = await verifyAttestationOnChain(
    buyerAccountId,
    kycRecord.verificationHash
  );

  if (!attestationExists) {
    throw new Error('KYC attestation not found on-chain');
  }

  // Proceed with NFT purchase
  await executeNFTTransfer(nftId, buyerAccountId);
}

// 4. User presents credential (future: with ZK proof)
async function verifyCredentialPresentation(credential: any) {
  // Verify signature
  const isValid = await verifyCredentialSignature(credential);

  // Check issuer is trusted
  const trustedIssuers = await getTrustedKYCProviders();
  const isTrusted = trustedIssuers.includes(credential.issuer);

  // Check expiration
  const isNotExpired = new Date(credential.expirationDate) > new Date();

  return isValid && isTrusted && isNotExpired;
}
```

---

## Best Practices

### Data Minimization
✅ **DO**: Store only verification status and hash
❌ **DON'T**: Store name, address, DOB, SSN in your database

### User Control
✅ **DO**: Issue credentials users can store in their wallet
❌ **DON'T**: Lock identity data in your centralized database

### Transparency
✅ **DO**: Record verification hashes on HCS (public audit trail)
❌ **DON'T**: Hide verification process from users

### Privacy by Default
✅ **DO**: Use ZK proofs when possible
❌ **DON'T**: Share more data than legally required

### Portability
✅ **DO**: Use standard formats (W3C Verifiable Credentials)
❌ **DON'T**: Create proprietary credential format

---

## Conclusion

**You CAN have both compliance AND decentralization!**

**Recommended Approach:**
1. **Start**: Off-chain KYC, on-chain attestations (hashes only)
2. **Evolve**: Add Decentralized Identity (DIDs + VCs)
3. **Advanced**: Implement Zero-Knowledge Proofs

This gives you:
- ✅ Regulatory compliance
- ✅ User privacy
- ✅ User control of data
- ✅ Decentralized verification
- ✅ Portable credentials
- ✅ Transparent audit trail

**The key**: Separate identity verification (can be centralized initially) from identity storage (user-controlled) and use cryptographic proofs instead of sharing raw data.

---

## Resources

**Hedera DID:**
- https://github.com/hashgraph/did-method
- https://docs.hedera.com/hedera/core-concepts/decentralized-identifiers-dids

**Verifiable Credentials:**
- https://www.w3.org/TR/vc-data-model/
- https://github.com/decentralized-identity/verifiable-credentials

**Zero-Knowledge Proofs:**
- Polygon ID: https://polygon.technology/polygon-id
- zkSNARKs: https://z.cash/technology/zksnarks/

**Decentralized KYC Providers:**
- Fractal ID: https://fractal.id/
- Civic: https://www.civic.com/
- SelfKey: https://selfkey.org/

**Compliance Resources:**
- FATF Guidelines for Virtual Assets
- SEC Accredited Investor Rules
- GDPR Data Minimization Principles
