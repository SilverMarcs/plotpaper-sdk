// =============================================================================
// @plotpaper/core — shared validation, bundler utilities, and constants
//
// Single source of truth for CLI, server, and app runtime.
// =============================================================================

// Constants
export { SDK_VERSION, MAX_SOURCE_SIZE_BYTES, MAX_BUNDLE_SIZE_BYTES } from "./constants";

// Validation rules
export { ALLOWED_MODULES, BLOCKED_PATTERNS } from "./patterns";
export { validateImports } from "./imports";
export {
  SchemaInputZ,
  PermissionsZ,
  validateSchema,
  validatePermissions,
} from "./schema";
export type { SchemaInput, PermissionsInput } from "./schema";

// Manifest
export { ManifestZ, validateManifest } from "./manifest";
export type { Manifest } from "./manifest";

// Bundler utilities
export { plotpaperModulesPlugin } from "./plugin";
export { wrapBundle } from "./wrap";
