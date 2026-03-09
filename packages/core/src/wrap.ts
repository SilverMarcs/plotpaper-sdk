// =============================================================================
// IIFE Wrapping — takes esbuild's IIFE output and adds mini app registration
// =============================================================================

import { SDK_VERSION } from "./constants";

/**
 * Wrap esbuild's IIFE output with the mini app registration code.
 *
 * esbuild's IIFE output looks like:
 *   var __ppExport = (() => { ... })();
 *
 * We wrap it so the default export gets registered on __ppMiniApps
 * along with SDK version metadata.
 */
export function wrapBundle(esbuildOutput: string, bundleId: string): string {
  const escaped = bundleId.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `(function(){
"use strict";
${esbuildOutput}
globalThis.__ppMiniApps=globalThis.__ppMiniApps||{};
globalThis.__ppMiniApps['${escaped}']={component:__ppExport.default,sdkVersion:'${SDK_VERSION}'};
})();`;
}
