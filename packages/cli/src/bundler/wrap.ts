// =============================================================================
// IIFE Wrapping — takes esbuild's IIFE output and adds mini app registration
// =============================================================================

/**
 * Wrap esbuild's IIFE output with the mini app registration code.
 *
 * esbuild's IIFE output looks like:
 *   var __ppExport = (() => { ... })();
 *
 * We wrap it so the default export gets registered on __ppMiniApps.
 */
export function wrapBundle(esbuildOutput: string, bundleId: string): string {
  return (
    `(function(){\n"use strict";\n` +
    esbuildOutput +
    `\nglobalThis.__ppMiniApps=globalThis.__ppMiniApps||{};\n` +
    `globalThis.__ppMiniApps[${JSON.stringify(bundleId)}]=__ppExport.default;\n` +
    `})();`
  );
}
