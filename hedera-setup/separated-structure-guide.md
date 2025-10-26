# Hedera NFT RWA Platform - Separated Structure

**Clean separation: Frontend app + Hedera setup scripts**

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Directory 1: hedera-setup](#directory-1-hedera-setup)
3. [Directory 2: frontend](#directory-2-frontend)
4. [Setup Workflow](#setup-workflow)
5. [Development Workflow](#development-workflow)

---

## Project Structure

```
diaspora-vault/                      # Root project folder
│
├── hedera-setup/                    # Hedera blockchain setup
│   ├── scripts/                     # Setup scripts
│   │   ├── 1-create-accounts.ts
│   │   ├── 2-create-topics.ts
│   │   ├── 3-create-nft-collections.ts
│   │   ├── 4-mint-sample-nfts.ts
│   │   └── utils/
│   │       ├── client.ts
│   │       └── helpers.ts
│   │
│   ├── contracts/                   # Smart contracts
│   │   ├── src/
│   │   │   ├── RealEstateManagement.sol
│   │   │   ├── BondCoupon.sol
│   │   │   ├── GoldRedemption.sol
│   │   │   ├── InvoiceFactoring.sol
│   │   │   └── CarbonRetirement.sol
│   │   │
│   │   ├── scripts/
│   │   │   └── deploy.ts
│   │   │
│   │   ├── test/
│   │   └── hardhat.config.ts
│   │
│   ├── output/                      # Generated files (gitignored)
│   │   ├── accounts.json
│   │   ├── topics.json
│   │   ├── collections.json
│   │   ├── contracts.json
│   │   └── config.json              # Final config for frontend
│   │
│   ├── .env                         # Hedera credentials
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── frontend/                        # Next.js application
    ├── src/
    │   ├── app/                     # Next.js App Router
    │   │   ├── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── nfts/
    │   │   │   ├── page.tsx
    │   │   │   └── [collectionId]/
    │   │   │       ├── page.tsx
    │   │   │       └── [serialNumber]/
    │   │   │           └── page.tsx
    │   │   ├── portfolio/
    │   │   ├── marketplace/
    │   │   └── admin/
    │   │
    │   ├── components/              # React components
    │   │   ├── wallet/
    │   │   ├── nft/
    │   │   ├── marketplace/
    │   │   └── ui/
    │   │
    │   ├── lib/                     # Core libraries
    │   │   ├── hedera/
    │   │   │   ├── client.ts
    │   │   │   ├── nft.ts
    │   │   │   ├── hcs.ts
    │   │   │   └── mirror.ts
    │   │   ├── wallet/
    │   │   │   └── hashconnect.ts
    │   │   └── utils/
    │   │
    │   ├── hooks/
    │   ├── stores/
    │   ├── types/
    │   └── config/
    │       └── hedera.config.ts     # Import from setup
    │
    ├── public/
    ├── .env.local                   # Frontend environment
    ├── .gitignore
    ├── next.config.js
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## Directory 1: hedera-setup

**Purpose:** Run once to initialize Hedera blockchain infrastructure

### Initialize Project

```bash
# Create directory
mkdir diaspora-vault
cd diaspora-vault

# Create hedera-setup
mkdir hedera-setup
cd hedera-setup

# Initialize npm project
npm init -y

# Install dependencies
npm install @hashgraph/sdk dotenv

# Install dev dependencies
npm install -D typescript tsx @types/node

# Initialize TypeScript
npx tsc --init
```

### File: package.json

```json
{
  "name": "hedera-setup",
  "version": "1.0.0",
  "description": "Hedera blockchain setup scripts for NFT RWA platform",
  "scripts": {
    "setup:1": "tsx scripts/1-create-accounts.ts",
    "setup:2": "tsx scripts/2-create-topics.ts",
    "setup:3": "tsx scripts/3-create-nft-collections.ts",
    "setup:4": "tsx scripts/4-mint-sample-nfts.ts",
    "setup:all": "npm run setup:1 && npm run setup:2 && npm run setup:3 && npm run setup:4",
    "deploy:contracts": "npx hardhat run contracts/scripts/deploy.ts --network testnet",
    "generate:config": "tsx scripts/generate-config.ts"
  },
  "dependencies": {
    "@hashgraph/sdk": "^2.40.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.0.0"
  }
}
```

### File: .env

```bash
# hedera-setup/.env

# ============================================
# HEDERA NETWORK
# ============================================
HEDERA_NETWORK=testnet

# ============================================
# OPERATOR ACCOUNT
# ============================================
# Get this from https://portal.hedera.com
# This account pays for all setup transactions
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=302e020100300506032b657004220420YOUR_PRIVATE_KEY

# ============================================
# CONFIGURATION
# ============================================
# Generate detailed output files
VERBOSE_OUTPUT=true

# Auto-save generated IDs
AUTO_SAVE=true
```

### File: .gitignore

```bash
# hedera-setup/.gitignore

# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env*.local

# Generated files (IMPORTANT - contains private keys)
output/
*.json

# Private keys (NEVER commit)
*.key
*.pem

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### File: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["scripts/**/*", "contracts/scripts/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### File: scripts/utils/client.ts

```typescript
// hedera-setup/scripts/utils/client.ts
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export function getClient(): Client {
  const network = process.env.HEDERA_NETWORK || 'testnet';
  
  let client: Client;
  
  switch (network) {
    case 'mainnet':
      client = Client.forMainnet();
      break;
    case 'testnet':
      client = Client.forTestnet();
      break;
    case 'previewnet':
      client = Client.forPreviewnet();
      break;
    default:
      throw new Error(`Unknown network: ${network}`);
  }

  const operatorId = AccountId.fromString(process.env.OPERATOR_ID!);
  const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY!);
  
  client.setOperator(operatorId, operatorKey);
  
  return client;
}

export function getNetwork(): string {
  return process.env.HEDERA_NETWORK || 'testnet';
}
```

### File: scripts/utils/helpers.ts

```typescript
// hedera-setup/scripts/utils/helpers.ts
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '../../output');

export function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

export function saveToFile(filename: string, data: any) {
  ensureOutputDir();
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`\n📝 Saved to: ${filepath}`);
}

export function loadFromFile(filename: string): any {
  const filepath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

export function fileExists(filename: string): boolean {
  const filepath = path.join(OUTPUT_DIR, filename);
  return fs.existsSync(filepath);
}

export function formatHbar(amount: number): string {
  return `${amount} HBAR`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### File: scripts/1-create-accounts.ts

```typescript
// hedera-setup/scripts/1-create-accounts.ts
import { 
  AccountCreateTransaction, 
  PrivateKey,
  Hbar 
} from '@hashgraph/sdk';
import { getClient } from './utils/client';
import { saveToFile } from './utils/helpers';

async function createAccounts() {
  console.log('🏦 Creating Platform Accounts...\n');

  const client = getClient();
  const accounts: Record<string, any> = {};

  try {
    // 1. Treasury Account
    console.log('Creating Treasury Account...');
    const treasuryKey = PrivateKey.generateED25519();
    
    const treasuryTx = await new AccountCreateTransaction()
      .setKey(treasuryKey.publicKey)
      .setInitialBalance(new Hbar(100))
      .setMaxAutomaticTokenAssociations(-1)
      .setAccountMemo('DeraLinks - Treasury')
      .execute(client);
    
    const treasuryReceipt = await treasuryTx.getReceipt(client);
    const treasuryId = treasuryReceipt.accountId!.toString();

    accounts.treasury = {
      accountId: treasuryId,
      privateKey: treasuryKey.toString(),
      publicKey: treasuryKey.publicKey.toString(),
      purpose: 'Holds all NFTs initially, platform treasury'
    };

    console.log(`✅ Treasury: ${treasuryId}`);

    // 2. Fee Collector Account
    console.log('\nCreating Fee Collector Account...');
    const feeKey = PrivateKey.generateED25519();
    
    const feeTx = await new AccountCreateTransaction()
      .setKey(feeKey.publicKey)
      .setInitialBalance(new Hbar(50))
      .setMaxAutomaticTokenAssociations(-1)
      .setAccountMemo('DeraLinks - Fee Collector')
      .execute(client);
    
    const feeReceipt = await feeTx.getReceipt(client);
    const feeId = feeReceipt.accountId!.toString();

    accounts.feeCollector = {
      accountId: feeId,
      privateKey: feeKey.toString(),
      publicKey: feeKey.publicKey.toString(),
      purpose: 'Receives all platform fees and royalties'
    };

    console.log(`✅ Fee Collector: ${feeId}`);

    // 3. Admin Account
    console.log('\nCreating Admin Account...');
    const adminKey = PrivateKey.generateED25519();
    
    const adminTx = await new AccountCreateTransaction()
      .setKey(adminKey.publicKey)
      .setInitialBalance(new Hbar(100))
      .setMaxAutomaticTokenAssociations(-1)
      .setAccountMemo('DeraLinks - Admin')
      .execute(client);
    
    const adminReceipt = await adminTx.getReceipt(client);
    const adminId = adminReceipt.accountId!.toString();

    accounts.admin = {
      accountId: adminId,
      privateKey: adminKey.toString(),
      publicKey: adminKey.publicKey.toString(),
      purpose: 'Platform administrator, manages NFTs and topics'
    };

    console.log(`✅ Admin: ${adminId}`);

    // Save to file
    saveToFile('accounts.json', accounts);

    console.log('\n✅ All accounts created successfully!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Accounts saved to hedera-setup/output/accounts.json');
    console.log('   2. NEVER commit this file to git!');
    console.log('   3. Keep private keys secure!');
    console.log('\n📋 Next Step: Run npm run setup:2');

  } catch (error) {
    console.error('\n❌ Error creating accounts:', error);
    throw error;
  } finally {
    client.close();
  }
}

createAccounts().catch(console.error);
```

### File: scripts/2-create-topics.ts

```typescript
// hedera-setup/scripts/2-create-topics.ts
import { 
  TopicCreateTransaction,
  PrivateKey,
  AccountId 
} from '@hashgraph/sdk';
import { getClient } from './utils/client';
import { loadFromFile, saveToFile } from './utils/helpers';

async function createTopics() {
  console.log('📢 Creating HCS Topics...\n');

  const client = getClient();
  
  try {
    // Load accounts
    const accounts = loadFromFile('accounts.json');
    const adminKey = PrivateKey.fromString(accounts.admin.privateKey);

    const topics: Record<string, any> = {};

    const topicList = [
      // Global
      { key: 'userProfiles', name: 'User Profiles & KYC' },
      { key: 'auditTrail', name: 'System Audit Trail' },
      { key: 'documents', name: 'Document Registry' },
      
      // Real Estate NFTs
      { key: 'reMetadata', name: 'Real Estate - NFT Metadata' },
      { key: 'reEvents', name: 'Real Estate - Property Events' },
      { key: 'reFinancials', name: 'Real Estate - Financial Data' },
      { key: 'reDistributions', name: 'Real Estate - Distributions' },
      
      // Bond NFTs
      { key: 'bondMetadata', name: 'Bond - NFT Metadata' },
      { key: 'bondCoupons', name: 'Bond - Coupon Payments' },
      { key: 'bondEvents', name: 'Bond - Events' },
      
      // Gold Bar NFTs
      { key: 'goldMetadata', name: 'Gold - NFT Metadata' },
      { key: 'goldVault', name: 'Gold - Vault Events' },
      { key: 'goldRedemptions', name: 'Gold - Redemptions' },
      { key: 'goldPricing', name: 'Gold - Price Updates' },
      
      // Invoice NFTs
      { key: 'invoiceMetadata', name: 'Invoice - NFT Metadata' },
      { key: 'invoiceVerification', name: 'Invoice - Verification' },
      { key: 'invoicePayments', name: 'Invoice - Payments' },
      { key: 'invoiceMarketplace', name: 'Invoice - Trading' },
      
      // Carbon Credit NFTs
      { key: 'carbonMetadata', name: 'Carbon - NFT Metadata' },
      { key: 'carbonProjects', name: 'Carbon - Project Updates' },
      { key: 'carbonRetirements', name: 'Carbon - Retirements' },
      { key: 'carbonVerification', name: 'Carbon - Verification' }
    ];

    for (const topic of topicList) {
      console.log(`Creating topic: ${topic.name}...`);
      
      const tx = await new TopicCreateTransaction()
        .setTopicMemo(topic.name)
        .setSubmitKey(adminKey.publicKey)
        .setAdminKey(adminKey.publicKey)
        .execute(client);
      
      const receipt = await tx.getReceipt(client);
      const topicId = receipt.topicId!.toString();
      
      topics[topic.key] = {
        topicId,
        name: topic.name
      };

      console.log(`✅ ${topic.key}: ${topicId}`);
    }

    // Save topics
    saveToFile('topics.json', topics);

    console.log('\n✅ All topics created successfully!');
    console.log('\n📋 Next Step: Run npm run setup:3');

  } catch (error) {
    console.error('\n❌ Error creating topics:', error);
    throw error;
  } finally {
    client.close();
  }
}

createTopics().catch(console.error);
```

### File: scripts/3-create-nft-collections.ts

```typescript
// hedera-setup/scripts/3-create-nft-collections.ts
import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  CustomRoyaltyFee,
  CustomFixedFee,
  PrivateKey,
  AccountId,
  Hbar
} from '@hashgraph/sdk';
import { getClient } from './utils/client';
import { loadFromFile, saveToFile } from './utils/helpers';

async function createNFTCollections() {
  console.log('🎨 Creating NFT Collections...\n');

  const client = getClient();

  try {
    // Load accounts and topics
    const accounts = loadFromFile('accounts.json');
    const topics = loadFromFile('topics.json');

    const treasuryId = AccountId.fromString(accounts.treasury.accountId);
    const treasuryKey = PrivateKey.fromString(accounts.treasury.privateKey);
    const feeCollectorId = AccountId.fromString(accounts.feeCollector.accountId);
    const adminKey = PrivateKey.fromString(accounts.admin.privateKey);

    const collections: Record<string, any> = {};

    // 1. Real Estate NFT Collection
    console.log('Creating Real Estate NFT Collection...');
    
    const reMemo = JSON.stringify({
      type: 'real_estate_nft',
      metadataTopicId: topics.reMetadata.topicId,
      eventsTopicId: topics.reEvents.topicId,
      financialsTopicId: topics.reFinancials.topicId
    });

    const reTx = await new TokenCreateTransaction()
      .setTokenName('Real Estate NFTs')
      .setTokenSymbol('RENWT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTokenMemo(reMemo)
      .setAdminKey(adminKey)
      .setSupplyKey(adminKey)
      .setKycKey(adminKey)
      .setFreezeKey(adminKey)
      .setPauseKey(adminKey)
      .setWipeKey(adminKey)
      .setCustomFees([
        new CustomRoyaltyFee()
          .setNumerator(5)
          .setDenominator(100)
          .setFeeCollectorAccountId(feeCollectorId)
          .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(5)))
      ])
      .freezeWith(client);

    const reSignedTx = await reTx.sign(treasuryKey);
    const reResponse = await reSignedTx.execute(client);
    const reReceipt = await reResponse.getReceipt(client);

    collections.realEstate = {
      tokenId: reReceipt.tokenId!.toString(),
      name: 'Real Estate NFTs',
      symbol: 'RENWT',
      type: 'real_estate',
      royalty: '5%'
    };

    console.log(`✅ Real Estate: ${collections.realEstate.tokenId}`);

    // 2. Bond NFT Collection
    console.log('\nCreating Bond NFT Collection...');
    
    const bondMemo = JSON.stringify({
      type: 'bond_nft',
      metadataTopicId: topics.bondMetadata.topicId,
      couponsTopicId: topics.bondCoupons.topicId
    });

    const bondTx = await new TokenCreateTransaction()
      .setTokenName('Corporate Bond NFTs')
      .setTokenSymbol('BONDNFT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTokenMemo(bondMemo)
      .setAdminKey(adminKey)
      .setSupplyKey(adminKey)
      .setKycKey(adminKey)
      .setFreezeKey(adminKey)
      .setCustomFees([
        new CustomRoyaltyFee()
          .setNumerator(2)
          .setDenominator(100)
          .setFeeCollectorAccountId(feeCollectorId)
          .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(2)))
      ])
      .freezeWith(client);

    const bondSignedTx = await bondTx.sign(treasuryKey);
    const bondResponse = await bondSignedTx.execute(client);
    const bondReceipt = await bondResponse.getReceipt(client);

    collections.bond = {
      tokenId: bondReceipt.tokenId!.toString(),
      name: 'Corporate Bond NFTs',
      symbol: 'BONDNFT',
      type: 'bond',
      royalty: '2%'
    };

    console.log(`✅ Bond: ${collections.bond.tokenId}`);

    // 3. Gold Bar NFT Collection
    console.log('\nCreating Gold Bar NFT Collection...');
    
    const goldMemo = JSON.stringify({
      type: 'gold_bar_nft',
      metadataTopicId: topics.goldMetadata.topicId,
      vaultTopicId: topics.goldVault.topicId
    });

    const goldTx = await new TokenCreateTransaction()
      .setTokenName('Gold Bar NFTs')
      .setTokenSymbol('GOLDBAR')
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTokenMemo(goldMemo)
      .setAdminKey(adminKey)
      .setSupplyKey(adminKey)
      .setKycKey(adminKey)
      .setWipeKey(adminKey)
      .setCustomFees([
        new CustomRoyaltyFee()
          .setNumerator(1)
          .setDenominator(100)
          .setFeeCollectorAccountId(feeCollectorId)
          .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(1)))
      ])
      .freezeWith(client);

    const goldSignedTx = await goldTx.sign(treasuryKey);
    const goldResponse = await goldSignedTx.execute(client);
    const goldReceipt = await goldResponse.getReceipt(client);

    collections.gold = {
      tokenId: goldReceipt.tokenId!.toString(),
      name: 'Gold Bar NFTs',
      symbol: 'GOLDBAR',
      type: 'gold',
      royalty: '1%'
    };

    console.log(`✅ Gold Bar: ${collections.gold.tokenId}`);

    // 4. Invoice NFT Collection
    console.log('\nCreating Invoice NFT Collection...');
    
    const invoiceMemo = JSON.stringify({
      type: 'invoice_nft',
      metadataTopicId: topics.invoiceMetadata.topicId,
      verificationTopicId: topics.invoiceVerification.topicId
    });

    const invoiceTx = await new TokenCreateTransaction()
      .setTokenName('Invoice NFTs')
      .setTokenSymbol('INVNFT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTokenMemo(invoiceMemo)
      .setAdminKey(adminKey)
      .setSupplyKey(adminKey)
      .setKycKey(adminKey)
      .setWipeKey(adminKey)
      .setCustomFees([
        new CustomRoyaltyFee()
          .setNumerator(2)
          .setDenominator(100)
          .setFeeCollectorAccountId(feeCollectorId)
          .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(2)))
      ])
      .freezeWith(client);

    const invoiceSignedTx = await invoiceTx.sign(treasuryKey);
    const invoiceResponse = await invoiceSignedTx.execute(client);
    const invoiceReceipt = await invoiceResponse.getReceipt(client);

    collections.invoice = {
      tokenId: invoiceReceipt.tokenId!.toString(),
      name: 'Invoice NFTs',
      symbol: 'INVNFT',
      type: 'invoice',
      royalty: '2%'
    };

    console.log(`✅ Invoice: ${collections.invoice.tokenId}`);

    // 5. Carbon Credit NFT Collection
    console.log('\nCreating Carbon Credit NFT Collection...');
    
    const carbonMemo = JSON.stringify({
      type: 'carbon_credit_nft',
      metadataTopicId: topics.carbonMetadata.topicId,
      retirementsTopicId: topics.carbonRetirements.topicId
    });

    const carbonTx = await new TokenCreateTransaction()
      .setTokenName('Carbon Credit NFTs')
      .setTokenSymbol('CCNFT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTokenMemo(carbonMemo)
      .setAdminKey(adminKey)
      .setSupplyKey(adminKey)
      .setKycKey(adminKey)
      .setWipeKey(adminKey)
      .setCustomFees([
        new CustomRoyaltyFee()
          .setNumerator(1)
          .setDenominator(100)
          .setFeeCollectorAccountId(feeCollectorId)
          .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(1)))
      ])
      .freezeWith(client);

    const carbonSignedTx = await carbonTx.sign(treasuryKey);
    const carbonResponse = await carbonSignedTx.execute(client);
    const carbonReceipt = await carbonResponse.getReceipt(client);

    collections.carbon = {
      tokenId: carbonReceipt.tokenId!.toString(),
      name: 'Carbon Credit NFTs',
      symbol: 'CCNFT',
      type: 'carbon',
      royalty: '1%'
    };

    console.log(`✅ Carbon Credit: ${collections.carbon.tokenId}`);

    // Save collections
    saveToFile('collections.json', collections);

    console.log('\n✅ All NFT collections created successfully!');
    console.log('\n📋 Next Step: Run npm run setup:4');

  } catch (error) {
    console.error('\n❌ Error creating collections:', error);
    throw error;
  } finally {
    client.close();
  }
}

createNFTCollections().catch(console.error);
```

### File: scripts/generate-config.ts

```typescript
// hedera-setup/scripts/generate-config.ts
import { loadFromFile, saveToFile } from './utils/helpers';
import * as path from 'path';
import * as fs from 'fs';

async function generateConfig() {
  console.log('⚙️  Generating frontend configuration...\n');

  try {
    // Load all generated data
    const accounts = loadFromFile('accounts.json');
    const topics = loadFromFile('topics.json');
    const collections = loadFromFile('collections.json');

    // Create config object for frontend
    const config = {
      network: process.env.HEDERA_NETWORK || 'testnet',
      
      accounts: {
        treasury: accounts.treasury.accountId,
        feeCollector: accounts.feeCollector.accountId,
        admin: accounts.admin.accountId
      },
      
      collections: {
        realEstate: collections.realEstate.tokenId,
        bond: collections.bond.tokenId,
        gold: collections.gold.tokenId,
        invoice: collections.invoice.tokenId,
        carbon: collections.carbon.tokenId
      },
      
      topics: Object.keys(topics).reduce((acc, key) => {
        acc[key] = topics[key].topicId;
        return acc;
      }, {} as Record<string, string>)
    };

    // Save config
    saveToFile('config.json', config);

    // Generate .env file content
    const envContent = `# Generated by hedera-setup
# Copy this to frontend/.env.local

# Network
NEXT_PUBLIC_HEDERA_NETWORK=${config.network}
NEXT_PUBLIC_MIRROR_NODE_URL=https://${config.network}.mirrornode.hedera.com

# Accounts
NEXT_PUBLIC_TREASURY_ID=${config.accounts.treasury}
NEXT_PUBLIC_FEE_COLLECTOR_ID=${config.accounts.feeCollector}
NEXT_PUBLIC_ADMIN_ID=${config.accounts.admin}

# NFT Collections
NEXT_PUBLIC_REAL_ESTATE_NFT_ID=${config.collections.realEstate}
NEXT_PUBLIC_BOND_NFT_ID=${config.collections.bond}
NEXT_PUBLIC_GOLD_NFT_ID=${config.collections.gold}
NEXT_PUBLIC_INVOICE_NFT_ID=${config.collections.invoice}
NEXT_PUBLIC_CARBON_NFT_ID=${config.collections.carbon}

# HCS Topics
NEXT_PUBLIC_TOPIC_USER_PROFILES=${config.topics.userProfiles}
NEXT_PUBLIC_TOPIC_AUDIT_TRAIL=${config.topics.auditTrail}
NEXT_PUBLIC_TOPIC_DOCUMENTS=${config.topics.documents}

# Real Estate Topics
NEXT_PUBLIC_TOPIC_RE_METADATA=${config.topics.reMetadata}
NEXT_PUBLIC_TOPIC_RE_EVENTS=${config.topics.reEvents}
NEXT_PUBLIC_TOPIC_RE_FINANCIALS=${config.topics.reFinancials}
NEXT_PUBLIC_TOPIC_RE_DISTRIBUTIONS=${config.topics.reDistributions}

# Bond Topics
NEXT_PUBLIC_TOPIC_BOND_METADATA=${config.topics.bondMetadata}
NEXT_PUBLIC_TOPIC_BOND_COUPONS=${config.topics.bondCoupons}
NEXT_PUBLIC_TOPIC_BOND_EVENTS=${config.topics.bondEvents}

# Gold Topics
NEXT_PUBLIC_TOPIC_GOLD_METADATA=${config.topics.goldMetadata}
NEXT_PUBLIC_TOPIC_GOLD_VAULT=${config.topics.goldVault}
NEXT_PUBLIC_TOPIC_GOLD_REDEMPTIONS=${config.topics.goldRedemptions}
NEXT_PUBLIC_TOPIC_GOLD_PRICING=${config.topics.goldPricing}

# Invoice Topics
NEXT_PUBLIC_TOPIC_INVOICE_METADATA=${config.topics.invoiceMetadata}
NEXT_PUBLIC_TOPIC_INVOICE_VERIFICATION=${config.topics.invoiceVerification}
NEXT_PUBLIC_TOPIC_INVOICE_PAYMENTS=${config.topics.invoicePayments}
NEXT_PUBLIC_TOPIC_INVOICE_MARKETPLACE=${config.topics.invoiceMarketplace}

# Carbon Topics
NEXT_PUBLIC_TOPIC_CARBON_METADATA=${config.topics.carbonMetadata}
NEXT_PUBLIC_TOPIC_CARBON_PROJECTS=${config.topics.carbonProjects}
NEXT_PUBLIC_TOPIC_CARBON_RETIREMENTS=${config.topics.carbonRetirements}
NEXT_PUBLIC_TOPIC_CARBON_VERIFICATION=${config.topics.carbonVerification}
`;

    // Save .env template
    const envPath = path.join(__dirname, '../output/frontend.env');
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Configuration generated successfully!');
    console.log('\n📝 Files created:');
    console.log('   - output/config.json');
    console.log('   - output/frontend.env');
    console.log('\n📋 Next Steps:');
    console.log('   1. Copy output/frontend.env to frontend/.env.local');
    console.log('   2. Start frontend development');

  } catch (error) {
    console.error('\n❌ Error generating config:', error);
    throw error;
  }
}

generateConfig().catch(console.error);
```

### File: README.md

```markdown
# Hedera Setup

Blockchain setup scripts for DeraLinks NFT RWA Platform.

## Prerequisites

1. Node.js 20+
2. Hedera testnet account from https://portal.hedera.com

## Setup

\`\`\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPERATOR_ID and OPERATOR_KEY
\`\`\`

## Usage

\`\`\`bash
# Run all setup scripts in order
npm run setup:all

# Or run individually
npm run setup:1  # Create accounts
npm run setup:2  # Create HCS topics
npm run setup:3  # Create NFT collections
npm run setup:4  # Mint sample NFTs (optional)

# Generate frontend config
npm run generate:config
\`\`\`

## Output

All generated files are saved to `output/` directory:
- `accounts.json` - Platform accounts (KEEP SECURE!)
- `topics.json` - HCS topic IDs
- `collections.json` - NFT collection IDs
- `config.json` - Combined config for frontend
- `frontend.env` - Environment variables for frontend

## Important

⚠️ **NEVER commit the output/ directory to git!**
⚠️ **Keep private keys secure!**

## Next Steps

After running setup:
1. Copy `output/frontend.env` to `../frontend/.env.local`
2. Start frontend development
\`\`\`

---

## Directory 2: frontend

**Purpose:** Next.js application for users to interact with NFTs

### Initialize Frontend

\`\`\`bash
# From diaspora-vault root
cd ..  # Back to root

# Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir

cd frontend

# Install dependencies
npm install @hashgraph/sdk hashconnect zustand @tanstack/react-query recharts lucide-react date-fns

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog input tabs badge table avatar
\`\`\`

### File: .env.local

\`\`\`bash
# frontend/.env.local
# Copy from hedera-setup/output/frontend.env

# This file will be populated after running hedera-setup scripts
\`\`\`

### File: src/config/hedera.config.ts

\`\`\`typescript
// frontend/src/config/hedera.config.ts
export const HEDERA_CONFIG = {
  network: process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'testnet' | 'mainnet' || 'testnet',
  
  mirrorNodeUrl: process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 
    'https://testnet.mirrornode.hedera.com',
  
  accounts: {
    treasury: process.env.NEXT_PUBLIC_TREASURY_ID!,
    feeCollector: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ID!,
    admin: process.env.NEXT_PUBLIC_ADMIN_ID!
  },
  
  collections: {
    realEstate: process.env.NEXT_PUBLIC_REAL_ESTATE_NFT_ID!,
    bond: process.env.NEXT_PUBLIC_BOND_NFT_ID!,
    gold: process.env.NEXT_PUBLIC_GOLD_NFT_ID!,
    invoice: process.env.NEXT_PUBLIC_INVOICE_NFT_ID!,
    carbon: process.env.NEXT_PUBLIC_CARBON_NFT_ID!
  },
  
  topics: {
    userProfiles: process.env.NEXT_PUBLIC_TOPIC_USER_PROFILES!,
    auditTrail: process.env.NEXT_PUBLIC_TOPIC_AUDIT_TRAIL!,
    documents: process.env.NEXT_PUBLIC_TOPIC_DOCUMENTS!,
    
    // Real Estate
    reMetadata: process.env.NEXT_PUBLIC_TOPIC_RE_METADATA!,
    reEvents: process.env.NEXT_PUBLIC_TOPIC_RE_EVENTS!,
    reFinancials: process.env.NEXT_PUBLIC_TOPIC_RE_FINANCIALS!,
    reDistributions: process.env.NEXT_PUBLIC_TOPIC_RE_DISTRIBUTIONS!,
    
    // Bond
    bondMetadata: process.env.NEXT_PUBLIC_TOPIC_BOND_METADATA!,
    bondCoupons: process.env.NEXT_PUBLIC_TOPIC_BOND_COUPONS!,
    bondEvents: process.env.NEXT_PUBLIC_TOPIC_BOND_EVENTS!,
    
    // Gold
    goldMetadata: process.env.NEXT_PUBLIC_TOPIC_GOLD_METADATA!,
    goldVault: process.env.NEXT_PUBLIC_TOPIC_GOLD_VAULT!,
    goldRedemptions: process.env.NEXT_PUBLIC_TOPIC_GOLD_REDEMPTIONS!,
    goldPricing: process.env.NEXT_PUBLIC_TOPIC_GOLD_PRICING!,
    
    // Invoice
    invoiceMetadata: process.env.NEXT_PUBLIC_TOPIC_INVOICE_METADATA!,
    invoiceVerification: process.env.NEXT_PUBLIC_TOPIC_INVOICE_VERIFICATION!,
    invoicePayments: process.env.NEXT_PUBLIC_TOPIC_INVOICE_PAYMENTS!,
    invoiceMarketplace: process.env.NEXT_PUBLIC_TOPIC_INVOICE_MARKETPLACE!,
    
    // Carbon
    carbonMetadata: process.env.NEXT_PUBLIC_TOPIC_CARBON_METADATA!,
    carbonProjects: process.env.NEXT_PUBLIC_TOPIC_CARBON_PROJECTS!,
    carbonRetirements: process.env.NEXT_PUBLIC_TOPIC_CARBON_RETIREMENTS!,
    carbonVerification: process.env.NEXT_PUBLIC_TOPIC_CARBON_VERIFICATION!
  }
} as const;

export type CollectionType = keyof typeof HEDERA_CONFIG.collections;
\`\`\`

---

## Setup Workflow

### Complete Setup Process

\`\`\`bash
# 1. Setup Hedera infrastructure
cd diaspora-vault/hedera-setup

# Install dependencies
npm install

# Configure operator account
nano .env  # Add your OPERATOR_ID and OPERATOR_KEY

# Run all setup scripts
npm run setup:all

# Generate frontend config
npm run generate:config

# 2. Setup Frontend
cd ../frontend

# Install dependencies
npm install

# Copy environment config
cp ../hedera-setup/output/frontend.env .env.local

# Start development
npm run dev
\`\`\`

### Visual Workflow

\`\`\`
┌─────────────────────────────────────────┐
│   Step 1: hedera-setup                  │
│                                         │
│   npm run setup:all                     │
│   ↓                                     │
│   Creates:                              │
│   - Accounts                            │
│   - HCS Topics                          │
│   - NFT Collections                     │
│   - Sample NFTs                         │
│   ↓                                     │
│   Generates: output/frontend.env       │
└──────────────┬──────────────────────────┘
               │
               │ Copy config
               ↓
┌──────────────┴──────────────────────────┐
│   Step 2: frontend                      │
│                                         │
│   cp ../hedera-setup/output/frontend.env│
│      .env.local                         │
│   ↓                                     │
│   npm run dev                           │
│   ↓                                     │
│   Frontend uses Hedera config           │
└─────────────────────────────────────────┘
\`\`\`

---

## Development Workflow

### Day-to-Day Development

\`\`\`bash
# Terminal 1: Frontend development
cd frontend
npm run dev

# Terminal 2: If needed, run additional setup
cd hedera-setup
npm run setup:4  # Mint more NFTs
\`\`\`

### Updating Configuration

If you need to change Hedera setup:

\`\`\`bash
cd hedera-setup

# Re-run specific script
npm run setup:3  # Re-create collections

# Regenerate frontend config
npm run generate:config

# Copy to frontend
cd ../frontend
cp ../hedera-setup/output/frontend.env .env.local

# Restart frontend
npm run dev
\`\`\`

---

## Summary

### ✅ Benefits of Separation

1. **Clean Architecture** - Setup separate from application
2. **Reusable Scripts** - Run setup for different environments
3. **Security** - Private keys never in frontend repo
4. **Easy Updates** - Modify setup without touching frontend
5. **Team Workflow** - Different teams can work independently

### 📂 Final Structure

\`\`\`
diaspora-vault/
├── hedera-setup/      # Blockchain setup (run once)
│   ├── scripts/       # Setup scripts
│   ├── output/        # Generated configs (gitignored)
│   └── .env           # Operator credentials
│
└── frontend/          # Next.js app (development)
    ├── src/           # Application code
    └── .env.local     # Frontend config (from setup)
\`\`\`

### 🎯 Next Steps

1. ✅ Directories separated
2. ✅ Setup scripts ready
3. ✅ Config generation automated
4. ⏭️ Build frontend components
5. ⏭️ Implement NFT operations
6. ⏭️ Deploy to production

Would you like me to create the frontend implementation next?
