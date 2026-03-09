// =============================================================================
// Validation Rules — single source of truth for CLI, server, and app runtime
// =============================================================================

import { CORE_MODULES, OPTIONAL_MODULES } from "./constants";

/** Core modules — always available (backward compat alias) */
export const ALLOWED_MODULES = [...CORE_MODULES];

/**
 * Get the effective allowed modules for a project.
 * Validates declared optional modules against the known set.
 */
export function getAllowedModules(declaredModules?: string[]): string[] {
  if (!declaredModules || declaredModules.length === 0) return [...CORE_MODULES];

  const optionalSet = new Set(OPTIONAL_MODULES);
  const invalid = declaredModules.filter((m) => !optionalSet.has(m));
  if (invalid.length > 0) {
    throw new Error(
      `Unknown modules: ${invalid.join(", ")}.\nAvailable optional modules: ${OPTIONAL_MODULES.join(", ")}`,
    );
  }

  return [...CORE_MODULES, ...declaredModules];
}

/**
 * Blocked source code patterns. Import validation is handled separately
 * by validateImports() and the esbuild plugin.
 */
export const BLOCKED_PATTERNS: Array<{ pattern: RegExp; label: string; help: string }> = [
  { pattern: /\bfetch\s*\(/, label: "fetch()", help: "Network requests are not allowed. Use sdk.ai for AI-generated content." },
  { pattern: /XMLHttpRequest/, label: "XMLHttpRequest", help: "Network requests are not allowed. Use sdk.ai for AI-generated content." },
  { pattern: /\beval\s*\(/, label: "eval()", help: "eval() is not allowed for security reasons." },
  { pattern: /Function\s*\(/, label: "Function constructor", help: "Function constructor is not allowed for security reasons." },
  { pattern: /AsyncStorage/, label: "AsyncStorage", help: "Use sdk.db for data persistence instead of AsyncStorage." },
  { pattern: /\bLinking\b/, label: "Linking", help: "Linking module is not allowed. Use sdk methods for navigation." },
  { pattern: /NativeModules/, label: "NativeModules", help: "Direct native module access is not allowed." },
  { pattern: /\bconstructor\s*\.\s*constructor/, label: "constructor chain", help: "Constructor chain access is blocked for security." },
  { pattern: /\.__proto__/, label: "__proto__ access", help: "Prototype access is blocked for security." },
  { pattern: /Object\s*\.\s*getPrototypeOf/, label: "prototype access", help: "Prototype access is blocked for security." },
  { pattern: /\bReflect\s*\.\s*(?:defineProperty|setPrototypeOf|set)\b/, label: "Reflect mutation", help: "Reflect mutations are blocked for security." },
  { pattern: /\bprocess\s*\./, label: "process access", help: "process access is not allowed." },
  { pattern: /\bglobalThis\b(?!\s*\.\s*__pp)/, label: "globalThis access", help: "Direct globalThis access is not allowed." },
];
