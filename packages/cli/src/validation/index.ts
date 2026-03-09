// =============================================================================
// Source Validation — runs all checks on mini app source code
// =============================================================================

import {
  BLOCKED_PATTERNS,
  MAX_SOURCE_SIZE_BYTES,
  MAX_BUNDLE_SIZE_BYTES,
  validateImports,
} from "@plotpaper/core";
import { resolveSchema } from "./schema";
import type { ResolvedSchema } from "./schema";

export { validateSchema, resolveSchema } from "./schema";
export type { ResolvedSchema } from "./schema";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  schema: ResolvedSchema | null;
}

export interface ValidateOptions {
  /** Path to the source file (used for resolving schema.json alongside it) */
  filePath?: string;
  /** Explicit path to a schema.json file */
  schemaPath?: string;
}

/**
 * Validate mini app source code against all rules.
 * Returns a result object (never throws).
 */
export function validateSource(source: string, options?: ValidateOptions): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Size check
  const sizeBytes = Buffer.byteLength(source, "utf-8");
  if (sizeBytes > MAX_SOURCE_SIZE_BYTES) {
    errors.push(`Source is ${sizeBytes} bytes, exceeds ${MAX_SOURCE_SIZE_BYTES} byte (50KB) limit`);
  }

  // 2. Default export check
  if (!/export\s+default\s+/.test(source)) {
    errors.push("Source must have a default export (export default function ...)");
  }

  // 3. Blocked patterns
  for (const { pattern, label, help } of BLOCKED_PATTERNS) {
    if (pattern.test(source)) {
      errors.push(`Blocked pattern: ${label} — ${help}`);
    }
  }

  // 4. Import validation (more detailed than blocked patterns)
  const importViolations = validateImports(source);
  for (const v of importViolations) {
    if (!errors.some((e) => e.includes("forbidden import") || e.includes("forbidden require"))) {
      errors.push(v);
    }
  }

  // 5. Schema validation — resolve from schema.json file
  let schema: ResolvedSchema | null = null;
  try {
    schema = resolveSchema(
      options?.filePath || "source.tsx",
      options?.schemaPath,
    );
  } catch (e: any) {
    errors.push(e.message);
  }

  // 6. Warnings (non-blocking)
  if (!schema) {
    warnings.push("No schema.json found — app will have no database. Create a schema.json file next to your source.");
  }

  if (sizeBytes > 40_000) {
    warnings.push(`Source is ${sizeBytes} bytes — approaching 50KB limit`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schema,
  };
}

/**
 * Validate a bundled IIFE output.
 */
export function validateBundle(bundle: string): { valid: boolean; error?: string } {
  const sizeBytes = Buffer.byteLength(bundle, "utf-8");
  if (sizeBytes > MAX_BUNDLE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Bundle is ${sizeBytes} bytes, exceeds ${MAX_BUNDLE_SIZE_BYTES} byte limit`,
    };
  }
  return { valid: true };
}
