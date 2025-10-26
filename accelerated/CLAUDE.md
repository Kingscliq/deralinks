# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an RWA (Real-World Assets) tokenization platform built with Next.js 13 (App Router), TypeScript, and Tailwind CSS. The application enables users to invest in tokenized real-world assets via the Hedera blockchain network, with support for multiple wallet providers.

## Core Commands

```bash
# Development
npm run dev              # Start development server at http://localhost:3000
npm run build            # Build static export for production
npm run start            # Start production server (after build)
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking without emitting files
```

## Architecture Overview

### Tech Stack Core
- **Framework:** Next.js 13.5.1 with App Router (static export mode)
- **Language:** TypeScript 5.2.2 (strict mode enabled)
- **Styling:** Tailwind CSS 3.3.3 with shadcn/ui components
- **Blockchain:** Hedera SDK (@hashgraph/sdk, @hashgraph/hedera-wallet-connect)
- **Multi-chain:** wagmi + viem for EVM wallet support
- **UI Components:** Radix UI primitives + shadcn/ui wrappers (40+ components)
- **Forms:** react-hook-form + zod validation
- **Backend Ready:** Supabase client configured

### Project Structure

```
app/
├── layout.tsx                    # Root layout with WalletProvider context
├── globals.css                   # Tailwind base + CSS variables for theming
├── (marketing)/                  # Route group: landing page (public)
│   ├── layout.tsx
│   └── page.tsx
├── (dashboard)/                  # Route group: dashboard (protected)
│   ├── layout.tsx
│   └── home/page.tsx
└── wallet-debug/                 # Utility page for debugging wallet connections

components/
├── ui/                          # shadcn/ui primitives (40+ components)
├── shared/                      # Cross-app components
│   ├── Navbar.tsx              # Supports variant="landing" | "dashboard"
│   ├── WalletButton.tsx        # Multi-wallet connection UI
│   └── WalletDebugger.tsx      # Dev utility for wallet debugging
├── dashboard/                   # Dashboard-specific feature components
└── landing/                     # Landing page section components

hooks/
├── use-wallet.tsx              # Central wallet state management (469 lines)
└── use-toast.ts                # Toast notification system

lib/
└── utils.ts                    # Tailwind class merge utility (cn)
```

### Key Architectural Patterns

#### 1. Route Groups Pattern
Next.js route groups `(parentheses)` organize routes without affecting URLs:
- `(marketing)` → Landing page at `/`
- `(dashboard)` → Dashboard at `/home`

Each route group has its own layout for different styling/structure.

#### 2. Wallet State Management
Central wallet context via `hooks/use-wallet.tsx`:

```typescript
// Root layout wraps entire app
<WalletProvider network="testnet" projectId="...">
  {children}
</WalletProvider>

// Any component can access wallet state
const { account, accountId, connect, disconnect, isConnected, walletType } = useWallet();
```

**Supported Wallets:**
- HashPack (Hedera native)
- Blade Wallet
- Kabila Wallet
- MetaMask (EVM)

**Auto-reconnection:** Wallet choice persists in localStorage and auto-connects on page load.

#### 3. Component Composition Hierarchy
1. **Page Components** (route-level): Orchestrate layout
2. **Feature Components** (domain-specific): PortfolioOverview, NFTHoldings, etc.
3. **UI Components** (primitives): shadcn/ui wrappers
4. **Shared Components** (cross-app): Navbar, WalletButton

#### 4. Static Export Configuration
```javascript
// next.config.js
output: 'export'  // Builds static HTML/CSS/JS, no server-side rendering
```

**Implications:**
- Can deploy to any static host (S3, Netlify, Vercel, etc.)
- No dynamic API routes
- No server-side rendering at runtime
- Images are unoptimized

### Import Alias Configuration
All imports use `@/` alias for root directory:

```typescript
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
```

Configured in `tsconfig.json`:
```json
"baseUrl": ".",
"paths": {
  "@/*": ["./*"]
}
```

### Styling Architecture

**Multi-layered approach:**
1. Tailwind utility classes
2. CSS variables in `globals.css` for theme colors
3. Hard-coded dark theme (slate-950 background)
4. Component-level glassmorphism effects

**Common pattern:**
```typescript
className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl"
```

**Utility function:**
```typescript
import { cn } from '@/lib/utils';  // Merges Tailwind classes safely
className={cn("base-classes", conditionalClass && "conditional-classes")}
```

### Wallet Integration Deep Dive

**Multi-wallet detection:** The app detects wallets via `window.ethereum` with provider-specific flags:
```typescript
window.ethereum.isHashpack   // HashPack
window.ethereum.isBlade      // Blade
window.ethereum.isKabila     // Kabila
window.ethereum.isMetaMask   // MetaMask
```

**Connection flow:**
1. User clicks "Connect Wallet" in WalletButton
2. Dropdown shows detected wallets
3. User selects wallet → `connect(walletType)` called
4. Provider-specific connection logic executes
5. `eth_requestAccounts()` requests access
6. Context updates with account, accountId, walletType
7. localStorage persists selection for auto-reconnect

**Error handling:**
- Missing wallet: Shows installation link
- User rejection: Displays friendly message (error code 4001)
- Pending connection: Warns about existing popup (error code -32002)

### Component Library (shadcn/ui)

40+ pre-built components in `components/ui/`:
- Forms: Input, Textarea, Select, Checkbox, Radio, Switch
- Dialogs: Dialog, AlertDialog, Drawer, Popover
- Navigation: NavigationMenu, DropdownMenu, Command
- Data: Table, Card, Badge, Avatar, Tooltip
- Layout: Separator, ScrollArea, ResizablePanels

**All components:**
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully typed with TypeScript
- Customizable via className prop

### Dashboard Architecture

**Feature Components:**
- `WelcomeHeader`: Displays wallet address and connection status
- `PortfolioOverview`: 4-card grid showing portfolio metrics
- `QuickActions`: Quick access buttons for common actions
- `NFTHoldings`: List of tokenized asset holdings
- `ActiveProposals`: DAO governance proposals display
- `MarketActivity`: Recent market activity feed

**Current state:** Most components display static/mock data. Foundation is built for integrating real blockchain data via Hedera SDK.

### Landing Page Architecture

13 self-contained section components:
- `HeroSection`, `TrustIndicators`, `HowItWorks`, `AssetCategories`
- `FeaturesGrid`, `UseCases`, `PlatformStats`, `ComparisonTable`
- `Testimonials`, `SecurityCompliance`, `FAQ`, `CTASection`, `LandingFooter`

**Design pattern:**
- Each component is independent and reorderable
- Consistent dark theme with gradient overlays
- Mobile-first responsive design
- Self-contained data (no props required)

## Development Workflow

### Adding New Routes
1. Create route folder in `app/(marketing)/` or `app/(dashboard)/`
2. Add `page.tsx` for the route content
3. Optionally add `layout.tsx` for route-specific layout
4. Use route groups to organize without affecting URLs

### Adding New Components
1. **UI primitives:** Add to `components/ui/` (shadcn/ui style)
2. **Feature components:** Add to `components/dashboard/` or `components/landing/`
3. **Shared components:** Add to `components/shared/`
4. Always use TypeScript interfaces for props
5. Use `cn()` utility for conditional classes

### Working with Wallets
1. **Access wallet state:** Use `useWallet()` hook in any component
2. **Connection UI:** Use `<WalletButton />` component
3. **Debugging:** Navigate to `/wallet-debug` to inspect wallet providers
4. **Testing:** Use Hedera testnet (configured in WalletProvider)

### Styling Guidelines
- Use Tailwind utility classes exclusively (no custom CSS)
- Maintain dark theme consistency (slate-950 backgrounds)
- Apply glassmorphism: `bg-slate-800/40 backdrop-blur-sm`
- Use smooth transitions: `transition-all duration-300`
- Implement hover states for interactive elements

### Form Handling
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
});

const form = useForm({
  resolver: zodResolver(formSchema),
});
```

Use shadcn/ui Form components for consistent styling.

## Blockchain Integration

### Hedera SDK Usage
```typescript
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

// Initialize client for testnet
const client = Client.forTestnet();
client.setOperator(accountId, privateKey);
```

### WalletConnect Integration
```typescript
// Already configured via @hashgraph/hedera-wallet-connect
// projectId is set in WalletProvider (line 49 of use-wallet.tsx)
// Replace demo projectId with your own from walletconnect.com
```

### Multi-chain Support (EVM)
```typescript
// wagmi + viem configured for EVM wallet support
// Currently MetaMask is integrated
// Can extend to other EVM wallets via wagmi connectors
```

## Testing & Debugging

### Wallet Connection Testing
1. Navigate to `/wallet-debug`
2. Inspect `window.ethereum` object
3. View detected wallet providers
4. Test connection flows
5. Check error messages

### Type Checking
```bash
npm run typecheck  # Runs tsc --noEmit
```

### Linting
```bash
npm run lint  # Runs next lint
```

**Note:** ESLint is configured to ignore errors during builds (`ignoreDuringBuilds: true`).

## Important Notes

### Static Export Limitations
- No dynamic API routes (use external APIs or Supabase)
- No server-side rendering at runtime
- No middleware support
- No rewrites or redirects at runtime

### Environment Variables
Not currently used, but if needed:
- Create `.env.local` for local development
- Add variables prefixed with `NEXT_PUBLIC_` for client-side access
- Never commit `.env.local` to git

### WalletConnect Project ID
Current project ID in `use-wallet.tsx:49` is a demo ID. Replace with your own from [walletconnect.com](https://walletconnect.com) for production.

### Supabase Configuration
Supabase client is installed but not actively used. To integrate:
1. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
2. Initialize client in a utility file
3. Use for authentication, database, or storage

## Common Tasks

### Adding a New Dashboard Component
1. Create component in `components/dashboard/MyComponent.tsx`
2. Import in `app/(dashboard)/home/page.tsx`
3. Add to dashboard layout
4. Access wallet state via `useWallet()` if needed
5. Use shadcn/ui components for consistent styling

### Adding a New Wallet Provider
1. Open `hooks/use-wallet.tsx`
2. Add wallet type to `WalletType` union (line 12)
3. Create detection logic (check `window.ethereum.isMyWallet`)
4. Implement `connectMyWallet()` function
5. Add case in `connect()` switch statement
6. Update `WalletButton` dropdown with new wallet option

### Modifying Navbar
Navbar has two variants:
- `variant="landing"`: For marketing pages (transparent background)
- `variant="dashboard"`: For app pages (solid background)

Edit `components/shared/Navbar.tsx` to modify behavior.

### Deployment
```bash
npm run build  # Creates 'out' directory with static files
```

Deploy the `out` directory to:
- Vercel (automatic Next.js support)
- Netlify (drag & drop or CLI)
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting provider
