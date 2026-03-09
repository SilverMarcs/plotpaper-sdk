// =============================================================================
// Schema & Permissions Validation — Zod schemas matching the server format.
// Single source of truth used by CLI, server, and any future consumers.
// =============================================================================

import { z } from "zod";

const VALID_VALUE_TYPES = ["string", "number", "boolean", "date", "json"] as const;

// ---------------------------------------------------------------------------
// Zod schemas
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
// Validation functions
// ---------------------------------------------------------------------------

/**
 * Parse and validate schema JSON string.
 * Throws on invalid JSON or schema structure.
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
 * Parse and validate permissions JSON string.
 * Throws on invalid JSON or permissions structure.
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
