// =============================================================================
// Manifest Validation — Zod schema for plotpaper.json project manifest
// =============================================================================

import { z } from "zod";
import { SDK_VERSION } from "./constants";

export const ManifestZ = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  entry: z.string().default("App.tsx"),
  sdkVersion: z.string().default(SDK_VERSION),
  mode: z.enum(["private", "multiplayer"]).default("private"),
});

export type Manifest = z.infer<typeof ManifestZ>;

/**
 * Parse and validate a plotpaper.json manifest string.
 * Throws on invalid JSON or manifest structure.
 */
export function validateManifest(raw: string): Manifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("plotpaper.json contains invalid JSON");
  }

  const result = ManifestZ.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Manifest validation errors:\n${issues}`);
  }

  return result.data;
}
