// =============================================================================
// Schema Resolution — file I/O layer on top of @plotpaper/core validators
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import {
  validateSchema,
  validatePermissions,
  type SchemaInput,
  type PermissionsInput,
} from "@plotpaper/core";

// Re-export validators for convenience
export { validateSchema, validatePermissions } from "@plotpaper/core";
export type { SchemaInput, PermissionsInput } from "@plotpaper/core";

// ---------------------------------------------------------------------------
// Schema resolution — find and load schema from filesystem
// ---------------------------------------------------------------------------

export interface ResolvedSchema {
  schema: SchemaInput;
  permissions?: PermissionsInput;
}

/**
 * Resolve schema for an app, checking in order:
 * 1. Explicit --schema flag path
 * 2. schema.json in the project root (directory containing plotpaper.json)
 * 3. schema.json alongside the source file (backward compat)
 *
 * Also loads permissions.json if it exists next to the schema file.
 * Returns null if no schema found.
 */
export function resolveSchema(
  sourceFilePath: string,
  schemaFlagPath?: string,
): ResolvedSchema | null {
  const dir = path.dirname(sourceFilePath);

  // 1. Explicit --schema flag
  if (schemaFlagPath) {
    const resolved = path.resolve(schemaFlagPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Schema file not found: ${resolved}`);
    }
    const schema = validateSchema(fs.readFileSync(resolved, "utf-8"));

    const permPath = path.join(path.dirname(resolved), "permissions.json");
    let permissions: PermissionsInput | undefined;
    if (fs.existsSync(permPath)) {
      permissions = validatePermissions(fs.readFileSync(permPath, "utf-8"));
    }

    return { schema, permissions };
  }

  // 2. Look for plotpaper.json in the directory to identify project root
  const manifestPath = path.join(dir, "plotpaper.json");
  if (fs.existsSync(manifestPath)) {
    const schemaJsonPath = path.join(dir, "schema.json");
    if (fs.existsSync(schemaJsonPath)) {
      const schema = validateSchema(fs.readFileSync(schemaJsonPath, "utf-8"));

      const permPath = path.join(dir, "permissions.json");
      let permissions: PermissionsInput | undefined;
      if (fs.existsSync(permPath)) {
        permissions = validatePermissions(fs.readFileSync(permPath, "utf-8"));
      }

      return { schema, permissions };
    }
  }

  // 3. schema.json alongside source file (backward compat for single-file usage)
  const schemaJsonPath = path.join(dir, "schema.json");
  if (fs.existsSync(schemaJsonPath)) {
    const schema = validateSchema(fs.readFileSync(schemaJsonPath, "utf-8"));

    const permPath = path.join(dir, "permissions.json");
    let permissions: PermissionsInput | undefined;
    if (fs.existsSync(permPath)) {
      permissions = validatePermissions(fs.readFileSync(permPath, "utf-8"));
    }

    return { schema, permissions };
  }

  return null;
}
