// =============================================================================
// IIFE Wrapping
// =============================================================================

/**
 * Wrap rewritten code in a self-executing function that:
 * 1. Sets up module registry access (__m = globalThis.__ppModules)
 * 2. Registers the default export on globalThis.__ppMiniApps[bundleId]
 */
export function wrapInIIFE(code: string, bundleId: string, defaultExportName: string): string {
  return `(function(){
"use strict";
var __m=globalThis.__ppModules;
${code}
globalThis.__ppMiniApps=globalThis.__ppMiniApps||{};
globalThis.__ppMiniApps[${JSON.stringify(bundleId)}]=${defaultExportName};
})();`;
}
