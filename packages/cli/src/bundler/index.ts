// =============================================================================
// Bundler — full pipeline from source to IIFE
// =============================================================================

import { buildSource } from "./transform";
import { wrapBundle } from "./wrap";

export { buildSource } from "./transform";
export { wrapBundle } from "./wrap";
export { plotpaperModulesPlugin } from "./plugin";

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
 * @returns Bundled IIFE string
 */
export async function bundle(
  source: string,
  bundleId: string,
  resolveDir?: string,
): Promise<string> {
  const { code } = await buildSource(source, resolveDir);
  return wrapBundle(code, bundleId);
}
