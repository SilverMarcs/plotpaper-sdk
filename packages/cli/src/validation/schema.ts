// =============================================================================
// Schema & Permissions Validation
//
// Schema is provided as a separate schema.json file (matches server format).
// The CLI auto-detects schema.json alongside the source file, or accepts
// an explicit --schema flag.
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

const VALID_VALUE_TYPES = ["string", "number", "boolean", "date", "json"] as const;

// ---------------------------------------------------------------------------
// Zod schemas — match server's MiniAppSchemaZ and PermissionsZ exactly
// ---------------------------------------------------------------------------

export const SchemaInputZ = z.object({
  entities: z.array(z.object({
    name: z.string(),
    attrs: z.array(z.object({
      name: z.string(),
      valueType: z.enum(VALID_VALUE_TYPES),
      indexed: z.boolean().optional(),
      unique: z.boolean().optional(),
    })),
  })),
  links: z.array(z.object({
    name: z.string(),
    forward: z.object({
      on: z.string(),
      label: z.string(),
      has: z.enum(["many", "one"]),
      onDelete: z.enum(["cascade"]).nullable().optional(),
    }),
    reverse: z.object({
      on: z.string(),
      label: z.string(),
      has: z.enum(["many", "one"]),
      onDelete: z.enum(["cascade"]).nullable().optional(),
    }),
  })).optional(),
});

export const PermissionsZ = z.array(z.object({
  entity: z.string(),
  allow: z.object({
    view: z.string(),
    create: z.string(),
    update: z.string(),
    delete: z.string(),
  }),
}));

export type SchemaInput = z.infer<typeof SchemaInputZ>;
export type PermissionsInput = z.infer<typeof PermissionsZ>;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Parse and validate schema JSON.
 */
export function validateSchema(jsonStr: string): SchemaInput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Schema file contains invalid JSON");
  }

  const result = SchemaInputZ.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Schema validation errors:\n${issues}`);
  }

  // Cross-validate: link entity names must reference defined entities
  const entityNames = new Set(result.data.entities.map((e) => e.name));
  if (result.data.links) {
    for (const link of result.data.links) {
      if (!entityNames.has(link.forward.on)) {
        throw new Error(`Link "${link.name}" forward references unknown entity "${link.forward.on}"`);
      }
      if (!entityNames.has(link.reverse.on)) {
        throw new Error(`Link "${link.name}" reverse references unknown entity "${link.reverse.on}"`);
      }
    }
  }

  return result.data;
}

/**
 * Parse and validate permissions JSON.
 */
export function validatePermissions(jsonStr: string): PermissionsInput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Permissions file contains invalid JSON");
  }

  const result = PermissionsZ.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Permissions validation errors:\n${issues}`);
  }

  return result.data;
}

// ---------------------------------------------------------------------------
// Schema resolution — find schema from file
// ---------------------------------------------------------------------------

export interface ResolvedSchema {
  schema: SchemaInput;
  permissions?: PermissionsInput;
}

/**
 * Resolve schema for an app, checking in order:
 * 1. Explicit --schema flag path
 * 2. schema.json alongside the source file
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

  // 2. schema.json alongside source file
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
