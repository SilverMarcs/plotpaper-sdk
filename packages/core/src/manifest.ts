// =============================================================================
// Manifest Validation — Zod schema for plotpaper.json project manifest
// =============================================================================

import { z } from "zod";
import { SDK_VERSION, OPTIONAL_MODULES } from "./constants";

export const ManifestZ = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  entry: z.string().default("App.tsx"),
  sdkVersion: z.string().default(SDK_VERSION),
  mode: z.enum(["private", "multiplayer"]).default("private"),
  modules: z.array(z.string()).optional(),
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

  // Validate declared modules
  if (result.data.modules) {
    const optSet = new Set(OPTIONAL_MODULES);
    const invalid = result.data.modules.filter((m: string) => !optSet.has(m));
    if (invalid.length > 0) {
      throw new Error(
        `Unknown modules in manifest: ${invalid.join(", ")}.\n` +
          `Available optional modules: ${OPTIONAL_MODULES.join(", ")}`,
      );
    }
  }

  return result.data;
}
