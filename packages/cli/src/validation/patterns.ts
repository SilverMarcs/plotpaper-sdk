// =============================================================================
// Validation Rules — ported from plotpaper-aws validation.ts
// =============================================================================

export const MAX_SOURCE_SIZE_BYTES = 50_000;
export const MAX_BUNDLE_SIZE_BYTES = 150_000;

export const ALLOWED_MODULES = [
  "react",
  "react-native",
  "@plotpaper/mini-app-sdk",
  "lucide-react-native",
  "react-native-svg",
  "react-native-safe-area-context",
  "@plotpaper/ui",
];

function buildAllowedModulesPattern(): string {
  return ALLOWED_MODULES.map((m) =>
    m.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&"),
  ).join("|");
}

const allowedAlt = buildAllowedModulesPattern();

export const BLOCKED_PATTERNS: Array<{ pattern: RegExp; label: string; help: string }> = [
  { pattern: new RegExp(`require\\s*\\(\\s*["'](?!(?:${allowedAlt})["'])`), label: "forbidden require()", help: "Only these modules can be imported: " + ALLOWED_MODULES.join(", ") },
  { pattern: new RegExp(`import\\s+.*from\\s+["'](?!(?:${allowedAlt})["'])`), label: "forbidden import", help: "Only these modules can be imported: " + ALLOWED_MODULES.join(", ") },
  { pattern: /\bfetch\s*\(/, label: "fetch()", help: "Network requests are not allowed. Use sdk.ai for AI-generated content." },
  { pattern: /XMLHttpRequest/, label: "XMLHttpRequest", help: "Network requests are not allowed. Use sdk.ai for AI-generated content." },
  { pattern: /\beval\s*\(/, label: "eval()", help: "eval() is not allowed for security reasons." },
  { pattern: /Function\s*\(/, label: "Function constructor", help: "Function constructor is not allowed for security reasons." },
  { pattern: /AsyncStorage/, label: "AsyncStorage", help: "Use sdk.db for data persistence instead of AsyncStorage." },
  { pattern: /\bLinking\b/, label: "Linking", help: "Linking module is not allowed. Use sdk methods for navigation." },
  { pattern: /NativeModules/, label: "NativeModules", help: "Direct native module access is not allowed." },
  { pattern: /\bconstructor\s*\.\s*constructor/, label: "constructor chain", help: "Constructor chain access is blocked for security." },
  { pattern: /\.__proto__/, label: "__proto__ access", help: "Prototype access is blocked for security." },
  { pattern: /Object\s*\.\s*getPrototypeOf/, label: "prototype access", help: "Prototype access is blocked for security." },
  { pattern: /\bReflect\s*\.\s*(?:defineProperty|setPrototypeOf|set)\b/, label: "Reflect mutation", help: "Reflect mutations are blocked for security." },
  { pattern: /\bprocess\s*\./, label: "process access", help: "process access is not allowed." },
  { pattern: /\bglobalThis\b(?!\s*\.\s*__pp)/, label: "globalThis access", help: "Direct globalThis access is not allowed." },
];
