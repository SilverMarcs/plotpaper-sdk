// =============================================================================
// Bundler — full pipeline from source to IIFE
// =============================================================================

import { buildSource } from "./transform";
import { wrapBundle } from "@plotpaper/core";

export { buildSource } from "./transform";
export { plotpaperModulesPlugin, wrapBundle } from "@plotpaper/core";

/**
 * Bundle raw source code into an IIFE string.
 *
 * Pipeline:
 * 1. esbuild build with plotpaper plugin (JSX, imports, tree-shaking)
 * 2. Wrap in IIFE with component registration
 *
 * @param source Raw .tsx source code
 * @param bundleId Unique bundle identifier
 * @param resolveDir Directory for resolving relative imports (optional)
 * @param allowedModules Override the allowed modules list (optional)
 * @returns Bundled IIFE string
 */
export async function bundle(
  source: string,
  bundleId: string,
  resolveDir?: string,
  allowedModules?: string[],
): Promise<string> {
  const { code } = await buildSource(source, resolveDir, allowedModules);
  return wrapBundle(code, bundleId);
}
