// =============================================================================
// Source Validation — runs all checks on mini app source code
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import {
  BLOCKED_PATTERNS,
  MAX_SOURCE_SIZE_BYTES,
  validateImports,
  validateManifest,
  getAllowedModules,
  type Manifest,
} from "@plotpaper/core";
import { resolveSchema } from "./schema";
import type { ResolvedSchema } from "./schema";

export { resolveSchema } from "./schema";
export type { ResolvedSchema } from "./schema";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  schema: ResolvedSchema | null;
}

export interface ProjectValidationResult extends ValidationResult {
  manifest: Manifest | null;
  entryPath: string | null;
  allowedModules: string[];
}

export interface ValidateOptions {
  /** Path to the source file (used for resolving schema.json alongside it) */
  filePath?: string;
  /** Explicit path to a schema.json file */
  schemaPath?: string;
  /** Allowed modules list (defaults to CORE_MODULES) */
  allowedModules?: string[];
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

  // 4. Import validation
  const importViolations = validateImports(source, options?.allowedModules);
  for (const v of importViolations) {
    errors.push(v);
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
 * Validate a full project directory (with plotpaper.json manifest).
 * Reads manifest, entry file, schema, and permissions.
 */
export function validateProject(projectDir: string): ProjectValidationResult {
  const manifestPath = path.join(projectDir, "plotpaper.json");

  if (!fs.existsSync(manifestPath)) {
    return {
      valid: false,
      errors: [`No plotpaper.json found in ${projectDir}`],
      warnings: [],
      schema: null,
      manifest: null,
      entryPath: null,
      allowedModules: [],
    };
  }

  let manifest: Manifest;
  try {
    manifest = validateManifest(fs.readFileSync(manifestPath, "utf-8"));
  } catch (e: any) {
    return {
      valid: false,
      errors: [e.message],
      warnings: [],
      schema: null,
      manifest: null,
      entryPath: null,
      allowedModules: [],
    };
  }

  const entryPath = path.join(projectDir, manifest.entry);

  if (!fs.existsSync(entryPath)) {
    return {
      valid: false,
      errors: [`Entry file not found: ${manifest.entry} (resolved to ${entryPath})`],
      warnings: [],
      schema: null,
      manifest,
      entryPath,
      allowedModules: [],
    };
  }

  const source = fs.readFileSync(entryPath, "utf-8");

  // Resolve allowed modules from manifest
  let allowedModules: string[];
  try {
    allowedModules = getAllowedModules(manifest.modules);
  } catch (e: any) {
    return {
      valid: false,
      errors: [e.message],
      warnings: [],
      schema: null,
      manifest,
      entryPath,
      allowedModules: [],
    };
  }

  // Resolve schema from project dir
  const schemaPath = path.join(projectDir, "schema.json");
  const explicitSchema = fs.existsSync(schemaPath) ? schemaPath : undefined;

  const result = validateSource(source, {
    filePath: entryPath,
    schemaPath: explicitSchema,
    allowedModules,
  });

  return {
    ...result,
    manifest,
    entryPath,
    allowedModules,
  };
}

/**
 * Validate a bundled IIFE output.
 */
export function validateBundle(bundle: string): { valid: boolean; error?: string } {
  const sizeBytes = Buffer.byteLength(bundle, "utf-8");
  if (sizeBytes > 150_000) {
    return {
      valid: false,
      error: `Bundle is ${sizeBytes} bytes, exceeds 150000 byte limit`,
    };
  }
  return { valid: true };
}
