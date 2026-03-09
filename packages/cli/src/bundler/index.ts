// =============================================================================
// Bundler — full pipeline from source to IIFE
// =============================================================================

import { transformSource } from "./transform";
import { stripComments, rewriteImportsExports } from "./rewrite";
import { wrapInIIFE } from "./wrap";

export { transformSource } from "./transform";
export { stripComments, rewriteImportsExports } from "./rewrite";
export { wrapInIIFE } from "./wrap";

/**
 * Bundle raw source code into an IIFE string.
 *
 * Pipeline:
 * 1. esbuild transform (JSX, async/await, ES2016)
 * 2. Strip comments
 * 3. Rewrite imports/exports to __ppModules lookups
 * 4. Wrap in IIFE with component registration
 *
 * @param source Raw .tsx source code
 * @param bundleId Unique bundle identifier
 * @returns Bundled IIFE string
 */
export async function bundle(source: string, bundleId: string): Promise<string> {
  // Step 1: Transpile
  const transformed = await transformSource(source);

  // Step 2: Strip comments
  const stripped = stripComments(transformed);

  // Step 3: Rewrite imports/exports
  const { code: rewritten, defaultExportName } = rewriteImportsExports(stripped);

  if (!defaultExportName) {
    throw new Error("No default export found in source code");
  }

  // Post-rewrite validation
  const remainingImport = rewritten.match(/\bimport\s+(?:\w|\{|\*).*\s+from\s+["'][^"']+["']/);
  if (remainingImport) {
    throw new Error(`Unrewritten import found after bundling: ${remainingImport[0]}`);
  }
  const remainingExportDefault = rewritten.match(/\bexport\s+default\b/);
  if (remainingExportDefault) {
    throw new Error("Unrewritten 'export default' found after bundling");
  }

  // Step 4: Wrap in IIFE
  return wrapInIIFE(rewritten, bundleId, defaultExportName);
}
