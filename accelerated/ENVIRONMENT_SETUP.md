# Environment Variables Setup Guide

This guide explains how to configure environment variables for the RWA Platform.

---

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your actual values:**
   ```bash
   nano .env.local
   # or use your preferred editor
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

---

## Required Environment Variables

### 1. WalletConnect Project ID

**Variable:** `NEXT_PUBLIC_WALLET_PROJECT_ID`

**Purpose:** Required for WalletConnect integration to enable wallet connections.

**How to get it:**
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

**Example:**
```env
NEXT_PUBLIC_WALLET_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 2. Hedera Network

**Variable:** `NEXT_PUBLIC_HEDERA_NETWORK`

**Purpose:** Specifies which Hedera network to use.

**Options:**
- `testnet` - For development and testing (default)
- `mainnet` - For production

**Example:**
```env
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

---

## Optional Environment Variables

### Supabase Configuration

If you're using Supabase for backend services:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these:**
1. Visit [Supabase](https://app.supabase.com/)
2. Create or select your project
3. Go to Settings → API
4. Copy the URL and anon/public key

### Analytics

For Google Analytics:
```env
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

For Sentry error tracking:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Environment Files

### `.env.example`
- **Purpose:** Template file showing all available environment variables
- **Version Control:** ✅ Committed to git
- **Usage:** Copy this file to create your local configuration

### `.env.local`
- **Purpose:** Your local environment configuration with actual secrets
- **Version Control:** ❌ Never commit to git (ignored by `.gitignore`)
- **Usage:** This is where you put your real API keys and secrets

### `.env.production` (Optional)
- **Purpose:** Production-specific environment variables
- **Version Control:** ❌ Never commit to git
- **Usage:** Used when deploying to production (if not using hosting platform's env vars)

---

## Using Environment Variables in Code

### Direct Access (Not Recommended)
```typescript
// ❌ Not recommended - no type safety
const projectId = process.env.NEXT_PUBLIC_WALLET_PROJECT_ID;
```

### Using the env utility (Recommended)
```typescript
// ✅ Recommended - type-safe with validation
import { env } from '@/lib/env';

const projectId = env.walletProjectId;
const network = env.hederaNetwork;
const isDev = env.isDevelopment;
```

### Example in a Component
```typescript
'use client';

import { env } from '@/lib/env';

export default function MyComponent() {
  // Access environment variables
  const projectId = env.walletProjectId;

  if (!projectId) {
    return <div>WalletConnect Project ID not configured</div>;
  }

  return <div>Project ID: {projectId.substring(0, 8)}...</div>;
}
```

---

## Validation

The app includes built-in environment validation. To manually validate:

```typescript
import { validateEnv } from '@/lib/env';

const { valid, errors } = validateEnv();

if (!valid) {
  console.error('Environment configuration errors:');
  errors.forEach(error => console.error('  -', error));
}
```

---

## Important Notes

### NEXT_PUBLIC_ Prefix

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser:

```env
# ✅ Exposed to browser (safe for API keys that are meant to be public)
NEXT_PUBLIC_WALLET_PROJECT_ID=abc123

# ❌ NOT exposed to browser (use for secrets)
DATABASE_PASSWORD=secret
```

**Only use `NEXT_PUBLIC_` for values that are safe to expose to users!**

### Static Export Limitation

Since this app uses static export (`output: 'export'` in `next.config.js`), environment variables are evaluated at build time, not at runtime.

This means:
- Environment variables are "baked into" the build
- You cannot change them after building without rebuilding
- For different environments, you need different builds

---

## Deployment

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with appropriate values
4. Redeploy

### Netlify
1. Site settings → Environment variables
2. Add each variable
3. Trigger new deploy

### Other Platforms
Most hosting platforms have environment variable configuration in their dashboard. Refer to their documentation.

---

## Troubleshooting

### "Project ID not set" error

**Problem:** WalletConnect not working

**Solution:**
```bash
# 1. Check if .env.local exists
ls -la | grep .env

# 2. Verify the variable is set
cat .env.local | grep NEXT_PUBLIC_WALLET_PROJECT_ID

# 3. Restart dev server
npm run dev
```

### Variables not updating

**Problem:** Changed .env.local but nothing changed

**Solution:**
```bash
# Stop the dev server (Ctrl+C)
# Restart it
npm run dev
```

### Build-time vs Runtime

**Problem:** Variables work locally but not in production

**Solution:**
- Ensure variables are set in your hosting platform's environment configuration
- Rebuild the application after changing environment variables
- Remember: static export means variables are baked into the build

---

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Rotate API keys regularly** - Especially if they might be compromised
3. **Use different keys for different environments** - Don't reuse production keys in development
4. **Limit API key permissions** - Only grant necessary permissions
5. **Monitor usage** - Watch for unusual activity on your API keys

---

## Example Complete Configuration

Here's a complete example of `.env.local` for development:

```env
# WalletConnect (Required)
NEXT_PUBLIC_WALLET_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Hedera Network (Required)
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# Application Environment (Automatically set by npm)
NODE_ENV=development

# Supabase (Optional - uncomment if using)
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Analytics (Optional - uncomment if using)
# NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Getting Help

If you're having trouble with environment configuration:

1. Check this guide first
2. Verify your `.env.local` file exists and has correct values
3. Restart your development server
4. Check the browser console for errors
5. Review the [Next.js Environment Variables documentation](https://nextjs.org/docs/basic-features/environment-variables)

---

**Remember:** Your `.env.local` file contains sensitive information. Never share it or commit it to version control!
