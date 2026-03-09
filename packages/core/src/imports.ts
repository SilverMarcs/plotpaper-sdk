// =============================================================================
// Import Validation — checks source imports against the allowed module list
// =============================================================================

import { ALLOWED_MODULES } from "./patterns";

/**
 * Extract all import sources from source code and check against allowed list.
 * Returns list of violations (empty = all good).
 */
export function validateImports(source: string): string[] {
  const violations: string[] = [];

  // Match ES import statements
  const importRegex = /import\s+(?:[\w*{}\s,]+)\s+from\s+["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(source)) !== null) {
    const mod = match[1];
    if (!ALLOWED_MODULES.includes(mod)) {
      violations.push(`Forbidden import: "${mod}" — only allowed: ${ALLOWED_MODULES.join(", ")}`);
    }
  }

  // Match require() calls
  const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((match = requireRegex.exec(source)) !== null) {
    const mod = match[1];
    if (!ALLOWED_MODULES.includes(mod)) {
      violations.push(`Forbidden require: "${mod}" — only allowed: ${ALLOWED_MODULES.join(", ")}`);
    }
  }

  return violations;
}
