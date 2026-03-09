// =============================================================================
// esbuild Plugin — resolves allowed modules to __ppModules lookups,
// blocks everything else at the AST level (no regex).
// =============================================================================

import type { Plugin } from "esbuild";
import { ALLOWED_MODULES } from "./patterns";

const ALLOWED_SET = new Set(ALLOWED_MODULES);

const ALLOWED_FILTER = new RegExp(
  "^(" +
    ALLOWED_MODULES.map((m) => m.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&")).join("|") +
    ")$",
);

/**
 * esbuild plugin that:
 * 1. Resolves allowed modules to virtual modules returning __ppModules lookups
 * 2. Blocks all other non-relative imports with a clear error
 */
export function plotpaperModulesPlugin(): Plugin {
  return {
    name: "plotpaper-modules",
    setup(build) {
      // Resolve allowed modules to our virtual namespace
      build.onResolve({ filter: ALLOWED_FILTER }, (args) => ({
        path: args.path,
        namespace: "plotpaper-module",
      }));

      // Return virtual module contents for allowed modules
      build.onLoad(
        { filter: /.*/, namespace: "plotpaper-module" },
        (args) => ({
          contents: `module.exports = globalThis.__ppModules[${JSON.stringify(args.path)}];`,
          loader: "js",
        }),
      );

      // Block non-allowed external imports (but allow relative imports within the source)
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === "entry-point") return undefined;
        if (args.path.startsWith(".") || args.path.startsWith("/")) return undefined;
        if (ALLOWED_SET.has(args.path)) return undefined;

        return {
          errors: [
            {
              text: `Import "${args.path}" is not allowed. Allowed modules: ${ALLOWED_MODULES.join(", ")}`,
            },
          ],
        };
      });
    },
  };
}
