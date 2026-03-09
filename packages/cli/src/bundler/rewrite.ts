// =============================================================================
// Import/Export Rewriting — ported from plotpaper-aws bundler.ts
// =============================================================================

const SHARED_MODULES = [
  "react",
  "react-native",
  "@plotpaper/mini-app-sdk",
  "@expo/vector-icons/Feather",
  "react-native-svg",
  "react-native-safe-area-context",
];

/**
 * Strip single-line and multi-line comments from code.
 * Preserves strings and template literals.
 */
export function stripComments(code: string): string {
  return code.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (match, stringLiteral) => {
      return stringLiteral || "";
    },
  );
}

/**
 * Convert ES import aliases (as) to destructuring aliases (:).
 */
function importAliasesToDestructuring(names: string): string {
  return names.replace(/(\w+)\s+as\s+(\w+)/g, "$1: $2");
}

/**
 * Rewrite ES import/export statements to globalThis.__ppModules lookups.
 * Returns the rewritten code and the captured default export name.
 */
export function rewriteImportsExports(code: string): { code: string; defaultExportName: string | null } {
  let result = code;
  let defaultExportName: string | null = null;

  // import DefaultName, { A, B } from "module" (must come first)
  result = result.replace(
    /import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+["']([^"']+)["']\s*;?/g,
    (_match, defaultName, names, mod) => {
      if (SHARED_MODULES.includes(mod)) {
        const m = JSON.stringify(mod);
        const destructured = importAliasesToDestructuring(names).replace(/\s/g, "");
        return `var ${defaultName}=__m[${m}].default||__m[${m}];var{${destructured}}=__m[${m}];`;
      }
      return _match;
    },
  );

  // import * as Name from "module"
  result = result.replace(
    /import\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?/g,
    (_match, name, mod) => {
      if (SHARED_MODULES.includes(mod)) {
        return `var ${name}=__m[${JSON.stringify(mod)}];`;
      }
      return _match;
    },
  );

  // import { A, B } from "module"
  result = result.replace(
    /import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']\s*;?/g,
    (_match, names, mod) => {
      if (SHARED_MODULES.includes(mod)) {
        const destructured = importAliasesToDestructuring(names).replace(/\s+/g, " ");
        return `var{${destructured}}=__m[${JSON.stringify(mod)}];`;
      }
      return _match;
    },
  );

  // import DefaultName from "module"
  result = result.replace(
    /import\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?/g,
    (_match, name, mod) => {
      if (SHARED_MODULES.includes(mod)) {
        const m = JSON.stringify(mod);
        return `var ${name}=__m[${m}].default||__m[${m}];`;
      }
      return _match;
    },
  );

  // export default function Name(...)
  const exportDefaultFnMatch = result.match(/export\s+default\s+function\s+(\w+)/);
  if (exportDefaultFnMatch) {
    defaultExportName = exportDefaultFnMatch[1];
    result = result.replace(/export\s+default\s+function\s+/, "function ");
  }

  // export default function(...) — anonymous
  if (!defaultExportName && /export\s+default\s+function\s*\(/.test(result)) {
    defaultExportName = "__PPDefaultComponent";
    result = result.replace(/export\s+default\s+function\s*\(/, `function ${defaultExportName}(`);
  }

  // export default Name;
  if (!defaultExportName) {
    const exportDefaultIdMatch = result.match(/export\s+default\s+(\w+)\s*;?/);
    if (exportDefaultIdMatch) {
      defaultExportName = exportDefaultIdMatch[1];
      result = result.replace(/export\s+default\s+\w+\s*;?/, "");
    }
  }

  // Remove named export keywords
  result = result.replace(/export\s+(?=const |let |var |function |class )/g, "");

  return { code: result, defaultExportName };
}
