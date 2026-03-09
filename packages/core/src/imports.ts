// =============================================================================
// Import Validation — checks source imports against the allowed module list
// =============================================================================

import { CORE_MODULES } from "./constants";

/**
 * Extract all import sources from source code and check against allowed list.
 * Returns list of violations (empty = all good).
 *
 * @param source Source code to check
 * @param allowedModules Override the allowed modules list (defaults to CORE_MODULES)
 */
export function validateImports(source: string, allowedModules?: string[]): string[] {
  const allowed = allowedModules || CORE_MODULES;
  const violations: string[] = [];

  // Match ES import statements
  const importRegex = /import\s+(?:[\w*{}\s,]+)\s+from\s+["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(source)) !== null) {
    const mod = match[1];
    if (!allowed.includes(mod)) {
      violations.push(`Forbidden import: "${mod}" — only allowed: ${allowed.join(", ")}`);
    }
  }

  // Match require() calls
  const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((match = requireRegex.exec(source)) !== null) {
    const mod = match[1];
    if (!allowed.includes(mod)) {
      violations.push(`Forbidden require: "${mod}" — only allowed: ${allowed.join(", ")}`);
    }
  }

  return violations;
}
