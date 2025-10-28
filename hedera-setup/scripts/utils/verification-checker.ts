/**
 * Verification NFT Checker
 * Utilities to check if an account owns a valid verification NFT
 * Used by middleware and access control systems
 */

import { loadJSON } from "./helpers";

export type VerificationLevel =
  | "none"
  | "basic"
  | "accredited"
  | "property-owner"
  | "institutional";

export interface VerificationCheckResult {
  isValid: boolean;
  isExpired: boolean;
  isFrozen: boolean;
  hasNFT: boolean;
  reason?: string;
  level?: string;
  serialNumber?: number;
  expiresAt?: string;
  frozenReason?: string;
}

export interface VerificationNFTData {
  nftTokenId: string;
  serialNumber: number;
  hederaAccountId: string;
  kycLevel: string;
  jurisdiction: string;
  verificationHash: string;
  mintedAt: string;
  expiresAt: string;
}

export interface ActionContext {
  amount?: number;
  jurisdiction?: string;
  propertyId?: string;
  [key: string]: any;
}

/**
 * Check if an account owns a valid verification NFT
 * Queries Hedera Mirror Node API and checks against local database
 */
export async function checkVerificationNFT(
  accountId: string,
  network: "mainnet" | "testnet" = "testnet"
): Promise<VerificationCheckResult> {
  try {
    // Load verification collection info
    const verificationCollection = loadJSON("verification-collection.json");
    if (!verificationCollection) {
      return {
        isValid: false,
        isExpired: false,
        isFrozen: false,
        hasNFT: false,
        reason: "Verification collection not found. Run script 09 first.",
      };
    }

    const tokenId = verificationCollection.verification.tokenId;

    // Query Mirror Node for NFTs owned by this account
    const mirrorNodeUrl =
      network === "mainnet"
        ? "https://mainnet-public.mirrornode.hedera.com"
        : "https://testnet.mirrornode.hedera.com";

    const response = await fetch(
      `${mirrorNodeUrl}/api/v1/accounts/${accountId}/nfts?token.id=${tokenId}`
    );

    if (!response.ok) {
      return {
        isValid: false,
        isExpired: false,
        isFrozen: false,
        hasNFT: false,
        reason: `Mirror Node API error: ${response.status}`,
      };
    }

    interface MirrorNodeResponse {
      nfts: {
        serial_number: string;
        frozen?: boolean;
      }[];
    }

    const data = await response.json() as MirrorNodeResponse;

    // Check if account owns any verification NFTs
    if (!data.nfts || data.nfts.length === 0) {
      return {
        isValid: false,
        isExpired: false,
        isFrozen: false,
        hasNFT: false,
        reason: "No verification NFT found for this account",
      };
    }

    // Get the NFT (should only have one per account)
    const nft = data.nfts[0];
    if (!nft) {
      return {
        isValid: false,
        isExpired: false,
        isFrozen: false,
        hasNFT: false,
        reason: "No verification NFT found for this account",
      };
    }
    const serialNumber = parseInt(nft.serial_number);

    // Load verification records from local database
    const verificationData = loadJSON("verification-nfts.json");
    if (!verificationData || !verificationData.nfts) {
      return {
        isValid: false,
        isExpired: false,
        isFrozen: false,
        hasNFT: true,
        reason: "Verification records not found",
      };
    }

    // Find the verification record for this serial number
    const verificationRecord = verificationData.nfts.find(
      (record: VerificationNFTData) =>
        record.serialNumber === serialNumber &&
        record.hederaAccountId === accountId
    );

    if (!verificationRecord) {
      return {
        isValid: false,
        isExpired: false,
        isFrozen: false,
        hasNFT: true,
        reason: "Verification record not found in database",
        serialNumber: serialNumber,
      };
    }

    // Check if expired
    const expiresAt = new Date(verificationRecord.expiresAt);
    const now = new Date();
    const isExpired = expiresAt < now;

    // Check if frozen (from NFT data if available)
    const isFrozen = nft.frozen || false;

    // Determine if valid
    const isValid = !isExpired && !isFrozen;

    return {
      isValid,
      isExpired,
      isFrozen,
      hasNFT: true,
      level: verificationRecord.kycLevel,
      serialNumber: serialNumber,
      expiresAt: verificationRecord.expiresAt,
      frozenReason: isFrozen ? "Account frozen by platform" : undefined,
      reason: !isValid
        ? isExpired
          ? "Verification expired"
          : "Account frozen"
        : undefined,
    };
  } catch (error: any) {
    return {
      isValid: false,
      isExpired: false,
      isFrozen: false,
      hasNFT: false,
      reason: `Error checking verification: ${error.message}`,
    };
  }
}

/**
 * Require specific verification level
 * Returns true if account has verification NFT at or above required level
 */
export async function requireVerificationLevel(
  accountId: string,
  requiredLevel: "basic" | "accredited",
  network: "mainnet" | "testnet" = "testnet"
): Promise<{ allowed: boolean; reason?: string; currentLevel?: string }> {
  const check = await checkVerificationNFT(accountId, network);

  if (!check.isValid) {
    return {
      allowed: false,
      reason: check.reason || "Invalid verification",
      currentLevel: check.level,
    };
  }

  // Level hierarchy: accredited > basic
  if (requiredLevel === "accredited" && check.level !== "accredited") {
    return {
      allowed: false,
      reason: "Accredited investor verification required",
      currentLevel: check.level,
    };
  }

  return {
    allowed: true,
    currentLevel: check.level,
  };
}

/**
 * Batch check multiple accounts
 * Useful for checking all participants in a transaction
 */
export async function batchCheckVerification(
  accountIds: string[],
  network: "mainnet" | "testnet" = "testnet"
): Promise<Map<string, VerificationCheckResult>> {
  const results = new Map<string, VerificationCheckResult>();

  // Check all accounts in parallel
  await Promise.all(
    accountIds.map(async (accountId) => {
      const result = await checkVerificationNFT(accountId, network);
      results.set(accountId, result);
    })
  );

  return results;
}

/**
 * Express middleware for protecting routes
 * Usage: app.get('/api/protected', requireVerification, handler)
 */
export function requireVerification(
  requiredLevel?: "basic" | "accredited"
) {
  return async (req: any, res: any, next: any) => {
    try {
      const accountId = req.body.hederaAccountId || req.query.accountId;

      if (!accountId) {
        return res.status(400).json({
          error: "Missing Hedera account ID",
          requiresAuth: true,
        });
      }

      // Check verification
      let check;
      if (requiredLevel) {
        check = await requireVerificationLevel(accountId, requiredLevel);
        if (!check.allowed) {
          return res.status(403).json({
            error: check.reason,
            requiresKYC: true,
            requiredLevel: requiredLevel,
            currentLevel: check.currentLevel,
            kycUrl: "/kyc/start",
          });
        }
      } else {
        const verificationCheck = await checkVerificationNFT(accountId);
        if (!verificationCheck.isValid) {
          return res.status(403).json({
            error: verificationCheck.reason || "Verification required",
            requiresKYC: true,
            kycUrl: "/kyc/start",
            isExpired: verificationCheck.isExpired,
            isFrozen: verificationCheck.isFrozen,
          });
        }
      }

      // Verification passed, continue
      next();
    } catch (error: any) {
      return res.status(500).json({
        error: "Error checking verification",
        message: error.message,
      });
    }
  };
}

/**
 * Get verification status for display purposes
 * Returns user-friendly information about verification status
 */
export async function getVerificationStatus(
  accountId: string,
  network: "mainnet" | "testnet" = "testnet"
): Promise<{
  status: "verified" | "expired" | "frozen" | "not_verified";
  message: string;
  level?: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
}> {
  const check = await checkVerificationNFT(accountId, network);

  if (!check.hasNFT) {
    return {
      status: "not_verified",
      message: "This account has not completed identity verification",
    };
  }

  if (check.isFrozen) {
    return {
      status: "frozen",
      message: "This account's verification has been frozen",
      level: check.level,
    };
  }

  if (check.isExpired) {
    return {
      status: "expired",
      message: "This account's verification has expired and needs renewal",
      level: check.level,
      expiresAt: check.expiresAt,
    };
  }

  // Calculate days until expiry
  const expiresAt = check.expiresAt ? new Date(check.expiresAt) : null;
  const daysUntilExpiry = expiresAt
    ? Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : undefined;

  return {
    status: "verified",
    message: "This account is verified and in good standing",
    level: check.level,
    expiresAt: check.expiresAt,
    daysUntilExpiry,
  };
}

/**
 * Check if action is permitted based on verification status and context
 * This is the main function for tiered access control
 *
 * @example
 * // Property owner trying to create listing
 * const result = await checkActionPermission("0.0.123456", "create-property");
 *
 * @example
 * // Investor trying to purchase
 * const result = await checkActionPermission("0.0.123456", "purchase-nft", {
 *   amount: 5000,
 *   jurisdiction: "US"
 * });
 */
export async function checkActionPermission(
  accountId: string,
  action: string,
  context?: ActionContext,
  network: "mainnet" | "testnet" = "testnet"
): Promise<{
  allowed: boolean;
  reason?: string;
  requiresKYC?: boolean;
  requiredLevel?: VerificationLevel;
}> {
  // Actions that ALWAYS require property owner verification
  const propertyOwnerActions = [
    "create-property",
    "mint-nfts",
    "manage-property",
    "update-property",
    "tokenize-asset",
  ];

  if (propertyOwnerActions.includes(action)) {
    const check = await checkVerificationNFT(accountId, network);

    // Must have verification NFT with property-owner level
    if (!check.isValid || check.level !== "property-owner") {
      return {
        allowed: false,
        reason:
          "Property owner verification required to tokenize assets",
        requiresKYC: true,
        requiredLevel: "property-owner",
      };
    }

    return { allowed: true };
  }

  // Purchase actions - check based on amount and jurisdiction
  if (action === "purchase-nft" || action === "purchase-securities") {
    const { amount = 0, jurisdiction = "US" } = context || {};

    // Define thresholds by jurisdiction
    const thresholds: Record<
      string,
      { amount: number; level: "basic" | "accredited" }
    > = {
      US: { amount: 2000, level: "accredited" },
      EU: { amount: 1000, level: "basic" },
      UK: { amount: 1500, level: "basic" },
    };

    const threshold = thresholds[jurisdiction];

    if (threshold && amount > threshold.amount) {
      const levelCheck = await requireVerificationLevel(
        accountId,
        threshold.level,
        network
      );

      if (!levelCheck.allowed) {
        return {
          allowed: false,
          reason: `${threshold.level === "accredited" ? "Accredited investor" : "KYC"} verification required for investments over ${threshold.amount} ${jurisdiction === "US" ? "USD" : jurisdiction === "EU" ? "EUR" : "GBP"}`,
          requiresKYC: true,
          requiredLevel: threshold.level,
        };
      }
    }

    return { allowed: true };
  }

  // Secondary trading - may require verification depending on jurisdiction
  if (action === "trade-nft" || action === "sell-nft") {
    const { jurisdiction = "US" } = context || {};

    // US: Requires basic verification for secondary trading
    if (jurisdiction === "US") {
      const check = await checkVerificationNFT(accountId, network);

      if (!check.isValid) {
        return {
          allowed: false,
          reason: "Basic KYC verification required for trading securities",
          requiresKYC: true,
          requiredLevel: "basic",
        };
      }
    }

    return { allowed: true };
  }

  // Public actions - no verification required
  const publicActions = [
    "browse",
    "view-property",
    "view-marketplace",
    "connect-wallet",
    "view-portfolio",
    "receive-dividend",
    "vote-dao",
  ];

  if (publicActions.includes(action)) {
    return { allowed: true };
  }

  // Default: allow if not specified
  return { allowed: true };
}

/**
 * Middleware factory that checks action permissions
 * More flexible than requireVerification - supports tiered access
 *
 * @example
 * // Protect property creation
 * app.post('/api/properties/create',
 *   requireActionPermission("create-property"),
 *   handleCreateProperty
 * );
 *
 * @example
 * // Protect purchases with dynamic thresholds
 * app.post('/api/nft/purchase',
 *   requireActionPermission("purchase-nft", (req) => ({
 *     amount: req.body.amount,
 *     jurisdiction: req.body.jurisdiction
 *   })),
 *   handlePurchase
 * );
 */
export function requireActionPermission(
  action: string,
  contextExtractor?: (req: any) => ActionContext
) {
  return async (req: any, res: any, next: any) => {
    try {
      const accountId = req.body.hederaAccountId || req.query.accountId;

      if (!accountId) {
        return res.status(400).json({
          error: "Missing Hedera account ID",
          requiresAuth: true,
        });
      }

      // Extract context if provided
      const context = contextExtractor ? contextExtractor(req) : undefined;

      // Check permission
      const permissionCheck = await checkActionPermission(
        accountId,
        action,
        context
      );

      if (!permissionCheck.allowed) {
        return res.status(403).json({
          error: permissionCheck.reason,
          requiresKYC: permissionCheck.requiresKYC,
          requiredLevel: permissionCheck.requiredLevel,
          kycUrl: "/kyc/start",
        });
      }

      // Permission granted, continue
      next();
    } catch (error: any) {
      return res.status(500).json({
        error: "Error checking permissions",
        message: error.message,
      });
    }
  };
}
