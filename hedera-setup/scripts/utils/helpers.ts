import fs from "fs";
import path from "path";

/**
 * Simple helper utilities
 * Keep it simple!
 */

/**
 * Ensure output directory exists
 */
export function ensureOutputDir() {
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log("📁 Created output directory");
  }
  return outputDir;
}

/**
 * Save JSON data to file
 */
export function saveJSON(filename: string, data: any) {
  const outputDir = ensureOutputDir();
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved: ${filename}`);
}

/**
 * Load JSON data from file
 */
export function loadJSON(filename: string): any {
  const outputDir = ensureOutputDir();
  const filePath = path.join(outputDir, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  return null;
}

/**
 * Format HBAR amount
 */
export function formatHbar(amount: number): string {
  return `${amount} ℏ`;
}

/**
 * Simple delay/sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get current timestamp
 */
export function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Log with timestamp
 */
export function log(message: string) {
  console.log(`[${timestamp()}] ${message}`);
}
