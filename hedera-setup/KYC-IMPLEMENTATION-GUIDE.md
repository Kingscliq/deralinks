# KYC Implementation Guide - Practical Steps

This guide shows **exactly** how to implement privacy-preserving KYC for DeraLinks.

---

## Recommended Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   PRIVACY-FIRST KYC                        │
└────────────────────────────────────────────────────────────┘

Step 1: User Wallet ──────► Step 2: KYC Provider
(HashPack)                   (Onfido/Jumio/Sumsub)
   │                               │
   │ Hedera Account ID             │ Verification
   │ 0.0.123456                    │ (Off-chain)
   │                               │
   ↓                               ↓
Step 3: Database          Step 4: Hedera Blockchain
(PostgreSQL)              (HCS Topic)
   │                               │
   │ Status: "verified"            │ Hash: "0x3f2a..."
   │ Hash: "0x3f2a..."             │ AccountId: 0.0.123456
   │ Provider: "onfido"            │ Timestamp: ...
   │ Expires: 2026-01-01           │
   │                               │
   │ ❌ NO PERSONAL DATA           │ ❌ NO PERSONAL DATA
   └───────────────────────────────┘

Personal Data ONLY at KYC Provider (Onfido/Jumio)
- User can request deletion (GDPR compliant)
- Platform NEVER sees or stores it
```

---

## Implementation Steps

### Phase 1: Basic KYC (Week 1-2)

**Goal**: Verify users with minimal centralization

#### Step 1.1: Choose KYC Provider

**Recommended Options:**

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **Onfido** | Best documentation, good UX | Higher cost | ~$1-3 per check |
| **Jumio** | Good for global coverage | Complex integration | ~$0.50-2 per check |
| **Sumsub** | Affordable, good API | Less mature | ~$0.30-1 per check |
| **Persona** | US-focused, simple | Limited international | ~$1-2 per check |

**Recommendation**: Start with **Sumsub** (affordable + good API)

```bash
# Install Sumsub SDK
npm install @sumsub/websdk @sumsub/websdk-react
```

#### Step 1.2: Set Up Environment Variables

```bash
# .env
SUMSUB_APP_TOKEN=your_app_token_here
SUMSUB_SECRET_KEY=your_secret_key_here
SUMSUB_LEVEL_NAME=basic-kyc-level
```

#### Step 1.3: Create KYC Database Schema

```sql
-- migrations/001_create_kyc_table.sql
CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to Hedera account (public)
  hedera_account_id VARCHAR(50) NOT NULL UNIQUE,

  -- Verification status (public)
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Options: 'pending' | 'submitted' | 'verified' | 'rejected' | 'expired'

  -- KYC level (public)
  kyc_level VARCHAR(20) NOT NULL DEFAULT 'none',
    -- Options: 'none' | 'basic' | 'accredited'

  -- Provider info (public)
  provider VARCHAR(50) NOT NULL DEFAULT 'sumsub',
  provider_applicant_id VARCHAR(100),

  -- Attestation (public)
  verification_hash VARCHAR(64) UNIQUE,
    -- SHA256 hash submitted to Hedera HCS
  hedera_topic_id VARCHAR(50),
  hedera_message_id VARCHAR(100),

  -- Jurisdiction (public - needed for compliance)
  jurisdiction VARCHAR(10),
    -- e.g., 'US', 'EU', 'GB', 'NG', etc.

  -- Timestamps (public)
  submitted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ❌ NO PERSONAL DATA (name, address, DOB, etc.)

  -- Indices
  INDEX idx_hedera_account (hedera_account_id),
  INDEX idx_status (kyc_status),
  INDEX idx_expires_at (expires_at)
);

-- Audit trail
CREATE TABLE kyc_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hedera_account_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
    -- 'kyc_started' | 'kyc_submitted' | 'kyc_verified' | 'kyc_rejected'
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Step 1.4: Create Backend API Endpoints

```typescript
// api/kyc/start.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hederaAccountId } = req.body;

    // Validate Hedera account format
    if (!hederaAccountId || !/^0\.0\.\d+$/.test(hederaAccountId)) {
      return res.status(400).json({ error: 'Invalid Hedera account ID' });
    }

    // Check if already verified
    const existing = await db.kycVerifications.findOne({
      hedera_account_id: hederaAccountId,
      kyc_status: 'verified',
      expires_at: { $gt: new Date() }
    });

    if (existing) {
      return res.status(200).json({
        status: 'already_verified',
        expiresAt: existing.expires_at
      });
    }

    // Create applicant in Sumsub
    const applicantId = await createSumsubApplicant({
      externalUserId: hederaAccountId,
      levelName: process.env.SUMSUB_LEVEL_NAME
    });

    // Generate access token for Sumsub WebSDK
    const accessToken = generateSumsubAccessToken(applicantId);

    // Save to database
    await db.kycVerifications.create({
      hedera_account_id: hederaAccountId,
      kyc_status: 'pending',
      provider: 'sumsub',
      provider_applicant_id: applicantId
    });

    // Audit log
    await db.kycAuditLog.create({
      hedera_account_id: hederaAccountId,
      event_type: 'kyc_started',
      event_data: { provider: 'sumsub', applicant_id: applicantId }
    });

    res.status(200).json({
      status: 'initiated',
      accessToken,
      applicantId
    });

  } catch (error) {
    console.error('KYC start error:', error);
    res.status(500).json({ error: 'Failed to initiate KYC' });
  }
}

// Helper: Create Sumsub applicant
async function createSumsubApplicant(params: {
  externalUserId: string,
  levelName: string
}) {
  const response = await fetch(
    'https://api.sumsub.com/resources/applicants',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Token': process.env.SUMSUB_APP_TOKEN!,
        'X-App-Access-Sig': generateSumsubSignature(params),
        'X-App-Access-Ts': Date.now().toString()
      },
      body: JSON.stringify({
        externalUserId: params.externalUserId,
        levelName: params.levelName
      })
    }
  );

  const data = await response.json();
  return data.id; // applicantId
}

// Helper: Generate Sumsub access token
function generateSumsubAccessToken(applicantId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${applicantId}${timestamp}`;

  const signature = crypto
    .createHmac('sha256', process.env.SUMSUB_SECRET_KEY!)
    .update(payload)
    .digest('hex');

  return Buffer.from(JSON.stringify({
    applicantId,
    timestamp,
    signature
  })).toString('base64');
}
```

```typescript
// api/kyc/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature (important for security!)
    const signature = req.headers['x-payload-digest'] as string;
    const isValid = verifySumsubWebhook(req.body, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const {
      applicantId,
      externalUserId, // This is our hederaAccountId
      reviewStatus,
      type
    } = req.body;

    // Handle verification complete
    if (type === 'applicantReviewed') {
      if (reviewStatus === 'completed') {
        await handleKYCVerified(externalUserId, applicantId);
      } else if (reviewStatus === 'rejected') {
        await handleKYCRejected(externalUserId, applicantId);
      }
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Handle successful verification
async function handleKYCVerified(
  hederaAccountId: string,
  applicantId: string
) {
  // 1. Create verification hash (for Hedera)
  const verificationData = {
    accountId: hederaAccountId,
    verified: true,
    level: 'basic',
    timestamp: Date.now(),
    provider: 'sumsub'
  };

  const verificationHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(verificationData))
    .digest('hex');

  // 2. Submit attestation to Hedera HCS
  const { topicId, messageId } = await submitAttestationToHedera({
    accountId: hederaAccountId,
    verificationHash,
    timestamp: Date.now()
  });

  // 3. Update database
  await db.kycVerifications.update(
    { hedera_account_id: hederaAccountId },
    {
      kyc_status: 'verified',
      kyc_level: 'basic',
      verification_hash: verificationHash,
      hedera_topic_id: topicId,
      hedera_message_id: messageId,
      verified_at: new Date(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  );

  // 4. Audit log
  await db.kycAuditLog.create({
    hedera_account_id: hederaAccountId,
    event_type: 'kyc_verified',
    event_data: {
      verification_hash: verificationHash,
      hedera_message_id: messageId
    }
  });

  // 5. Send notification to user
  await sendNotification(hederaAccountId, {
    type: 'kyc_verified',
    message: 'Your identity verification is complete!'
  });
}

// Submit attestation to Hedera HCS
async function submitAttestationToHedera(data: {
  accountId: string,
  verificationHash: string,
  timestamp: number
}) {
  const message = {
    type: 'kyc-attestation',
    accountId: data.accountId,
    hash: data.verificationHash,
    timestamp: data.timestamp,
    // NO PERSONAL DATA
  };

  const topicId = process.env.KYC_ATTESTATION_TOPIC_ID!;
  const response = await submitMessageToTopic(
    topicId,
    JSON.stringify(message)
  );

  return {
    topicId,
    messageId: response.consensusTimestamp.toString()
  };
}
```

#### Step 1.5: Frontend KYC Flow

```tsx
// components/KYCFlow.tsx
import { useState } from 'react';
import SumsubWebSdk from '@sumsub/websdk-react';

export function KYCFlow({ hederaAccountId }: { hederaAccountId: string }) {
  const [kycStatus, setKycStatus] = useState<'idle' | 'loading' | 'active' | 'complete'>('idle');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const startKYC = async () => {
    setKycStatus('loading');

    try {
      // Call your backend
      const response = await fetch('/api/kyc/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hederaAccountId })
      });

      const data = await response.json();

      if (data.status === 'already_verified') {
        setKycStatus('complete');
        return;
      }

      setAccessToken(data.accessToken);
      setKycStatus('active');

    } catch (error) {
      console.error('KYC start failed:', error);
      setKycStatus('idle');
    }
  };

  if (kycStatus === 'complete') {
    return (
      <div className="kyc-complete">
        <h2>✅ Verification Complete</h2>
        <p>Your identity has been verified on-chain.</p>
      </div>
    );
  }

  if (kycStatus === 'active' && accessToken) {
    return (
      <div className="kyc-iframe">
        <SumsubWebSdk
          accessToken={accessToken}
          expirationHandler={() => console.log('Token expired')}
          config={{
            lang: 'en',
            theme: 'dark'
          }}
          options={{
            addViewportTag: false,
            adaptIframeHeight: true
          }}
          onMessage={(type, payload) => {
            console.log('Sumsub event:', type, payload);
            if (type === 'idCheck.onApplicantSubmitted') {
              setKycStatus('complete');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="kyc-start">
      <h2>Identity Verification Required</h2>
      <p>
        To purchase NFTs, you must complete identity verification.
        Your personal information is <strong>NOT stored on our platform</strong>.
      </p>

      <div className="privacy-info">
        <h3>🔒 Your Privacy is Protected</h3>
        <ul>
          <li>✅ Verification handled by certified KYC provider (Sumsub)</li>
          <li>✅ Only verification status stored on Hedera blockchain (as hash)</li>
          <li>✅ Your personal documents never touch our servers</li>
          <li>✅ You can request data deletion at any time (GDPR compliant)</li>
        </ul>
      </div>

      <button
        onClick={startKYC}
        disabled={kycStatus === 'loading'}
        className="btn-primary"
      >
        {kycStatus === 'loading' ? 'Starting...' : 'Start Verification'}
      </button>
    </div>
  );
}
```

#### Step 1.6: Enforce KYC on NFT Purchase

```typescript
// api/nft/purchase.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { buyerAccountId, nftTokenId, serialNumber, price } = req.body;

  try {
    // 1. Check KYC status
    const kyc = await db.kycVerifications.findOne({
      hedera_account_id: buyerAccountId,
      kyc_status: 'verified',
      expires_at: { $gt: new Date() }
    });

    if (!kyc) {
      return res.status(403).json({
        error: 'KYC verification required',
        kycRequired: true
      });
    }

    // 2. Verify attestation exists on Hedera (optional extra check)
    const attestationValid = await verifyAttestationOnChain(
      buyerAccountId,
      kyc.verification_hash
    );

    if (!attestationValid) {
      return res.status(403).json({
        error: 'KYC attestation invalid',
        kycRequired: true
      });
    }

    // 3. Check tier limits (optional)
    if (kyc.kyc_level === 'basic' && price > 10000) {
      return res.status(403).json({
        error: 'Accredited investor verification required for purchases over $10,000',
        upgradeRequired: true
      });
    }

    // 4. Proceed with NFT transfer
    const transfer = await executeNFTTransfer({
      tokenId: nftTokenId,
      serialNumber,
      from: treasuryAccount,
      to: buyerAccountId,
      price
    });

    res.status(200).json({
      success: true,
      transactionId: transfer.transactionId
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
}
```

---

### Phase 2: Decentralized Identity (Week 3-4)

**Goal**: Give users control of their credentials

#### Step 2.1: Install Hedera DID SDK

```bash
npm install @hashgraph/did-sdk-js
```

#### Step 2.2: Create DID for Users

```typescript
// utils/hedera-did.ts
import { HcsDid, HcsDidMessage, PrivateKey } from '@hashgraph/did-sdk-js';
import { Client } from '@hashgraph/sdk';

export async function createUserDID(
  hederaAccountId: string,
  privateKey: PrivateKey,
  client: Client
) {
  // Create DID
  const did = new HcsDid({
    identifier: hederaAccountId,
    privateKey: privateKey,
    client: client
  });

  // Register DID on Hedera HCS
  const registrationMessage = did.register();
  await registrationMessage.execute(client);

  // Get DID string
  const didString = did.getIdentifier();
  // e.g., "did:hedera:testnet:0.0.123456_0.0.7127453"

  return {
    did: didString,
    didDocument: did.getDocument()
  };
}
```

#### Step 2.3: Issue Verifiable Credential

```typescript
// utils/verifiable-credentials.ts
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { issue } from '@digitalbazaar/vc';

export async function issueKYCCredential(params: {
  userDID: string,
  kycLevel: 'basic' | 'accredited',
  jurisdiction: string,
  provider: string
}) {
  const credential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://deralinks.com/credentials/v1'
    ],
    type: ['VerifiableCredential', 'KYCCredential'],
    issuer: 'did:hedera:testnet:deralinks-kyc-issuer',
    issuanceDate: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    credentialSubject: {
      id: params.userDID,
      kycVerified: true,
      kycLevel: params.kycLevel,
      jurisdiction: params.jurisdiction,
      verificationProvider: params.provider,
      // NO PERSONAL DATA
    }
  };

  // Sign credential
  const suite = new Ed25519Signature2020({
    key: await issuerKeyPair()
  });

  const signedCredential = await issue({
    credential,
    suite,
    documentLoader
  });

  return signedCredential;
}

// User stores this credential in their wallet or browser storage
// User presents it when needed (no personal data shared!)
```

#### Step 2.4: Verify Credential

```typescript
// utils/verify-credential.ts
import { verify } from '@digitalbazaar/vc';

export async function verifyKYCCredential(credential: any) {
  try {
    // Verify signature
    const result = await verify({
      credential,
      suite: new Ed25519Signature2020(),
      documentLoader
    });

    if (!result.verified) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Check expiration
    const expirationDate = new Date(credential.expirationDate);
    if (expirationDate < new Date()) {
      return { valid: false, error: 'Credential expired' };
    }

    // Check issuer is trusted
    const trustedIssuers = [
      'did:hedera:testnet:deralinks-kyc-issuer'
    ];

    if (!trustedIssuers.includes(credential.issuer)) {
      return { valid: false, error: 'Untrusted issuer' };
    }

    return {
      valid: true,
      subject: credential.credentialSubject
    };

  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

---

## Security Best Practices

### 1. Data Minimization

```typescript
// ✅ GOOD: Store only what's needed
interface KYCRecord {
  hederaAccountId: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  verificationHash: string;
  expiresAt: Date;
}

// ❌ BAD: Don't store personal data
interface KYCRecordBad {
  hederaAccountId: string;
  fullName: string; // ❌
  dateOfBirth: string; // ❌
  ssn: string; // ❌
  address: string; // ❌
}
```

### 2. Hash Everything

```typescript
// Always hash before storing on-chain
function createVerificationHash(data: {
  accountId: string;
  timestamp: number;
  provider: string;
}) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}
```

### 3. Webhook Security

```typescript
// Always verify webhook signatures
function verifySumsubWebhook(payload: any, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.SUMSUB_SECRET_KEY!)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === expectedSignature;
}
```

### 4. Audit Everything

```typescript
// Log all KYC events for compliance
await db.kycAuditLog.create({
  hedera_account_id: accountId,
  event_type: 'kyc_verified',
  event_data: {
    verification_hash: hash,
    timestamp: Date.now()
  },
  ip_address: req.ip,
  user_agent: req.headers['user-agent']
});
```

---

## Cost Estimates

### KYC Provider Costs

**Per Verification:**
- Sumsub: $0.30 - $1.00
- Onfido: $1.00 - $3.00
- Jumio: $0.50 - $2.00

**For 1,000 users:**
- Sumsub: $300 - $1,000
- Onfido: $1,000 - $3,000

**Recommendation**: Start with Sumsub (most affordable)

### Hedera Costs

**HCS Message Submission:**
- ~$0.0001 per message
- For 1,000 attestations: ~$0.10

**Storage:**
- Negligible (only hashes stored)

**Total Platform Cost per User**: ~$0.30 - $1.10

---

## Testing Strategy

```bash
# Test environment
SUMSUB_APP_TOKEN=test_app_token
SUMSUB_SECRET_KEY=test_secret
HEDERA_NETWORK=testnet
```

**Test Cases:**

1. ✅ User starts KYC → Sumsub session created
2. ✅ User completes verification → Webhook received
3. ✅ Attestation submitted to Hedera → HCS message confirmed
4. ✅ User tries to buy NFT → KYC checked, purchase allowed
5. ✅ Non-verified user tries to buy → Purchase blocked
6. ✅ Expired KYC → User prompted to re-verify

---

## Launch Checklist

**Before Production:**

- [ ] KYC provider account created and configured
- [ ] Webhook endpoint secured with signature verification
- [ ] Database schema deployed
- [ ] HCS attestation topic created
- [ ] Frontend KYC flow tested
- [ ] Purchase enforcement tested
- [ ] Audit logging implemented
- [ ] GDPR compliance verified (data deletion flow)
- [ ] Terms of service updated (KYC requirements)
- [ ] Privacy policy updated (data handling)

---

## Conclusion

This implementation gives you:

✅ **Compliance**: Meets KYC/AML requirements
✅ **Privacy**: No personal data stored on your platform
✅ **Decentralization**: Attestations on Hedera blockchain
✅ **User Control**: Users can request data deletion
✅ **Transparency**: All verifications publicly auditable (as hashes)
✅ **Scalability**: Can handle millions of users
✅ **Cost-Effective**: ~$0.30-1.10 per user

**You're ready to implement privacy-preserving KYC!**
