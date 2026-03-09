// =============================================================================
// Mini App Schema — defines data model for per-app InstantDB instances
// =============================================================================

export type SchemaValueType = "string" | "number" | "boolean" | "date" | "json";

export interface SchemaAttribute {
  valueType: SchemaValueType;
  config?: {
    indexed?: boolean;
    unique?: boolean;
  };
}

export interface SchemaEntity {
  attrs: Record<string, SchemaAttribute>;
}

export interface SchemaLinkSide {
  on: string;
  label: string;
  has: "many" | "one";
  onDelete?: "cascade";
}

export interface SchemaLink {
  forward: SchemaLinkSide;
  reverse: SchemaLinkSide;
}

/** Record-based schema format used internally */
export interface MiniAppSchema {
  entities: Record<string, SchemaEntity>;
  links?: Record<string, SchemaLink>;
}

// =============================================================================
// Permissions
// =============================================================================

export interface EntityPermissions {
  allow: {
    view: string;
    create: string;
    update: string;
    delete: string;
  };
}

/** InstantDB permission rules keyed by entity name (or "$default") */
export type MiniAppPermissions = Record<string, EntityPermissions>;

// =============================================================================
// Array-based format (used in @schema comments and AI generation)
// =============================================================================

export interface SchemaAttributeInput {
  name: string;
  valueType: SchemaValueType;
  indexed?: boolean;
  unique?: boolean;
}

export interface SchemaEntityInput {
  name: string;
  attrs: SchemaAttributeInput[];
}

export interface SchemaLinkInput {
  name: string;
  forward: SchemaLinkSide;
  reverse: SchemaLinkSide;
}

export interface SchemaInput {
  entities: SchemaEntityInput[];
  links?: SchemaLinkInput[];
}

export interface PermissionInput {
  entity: string;
  allow: {
    view: string;
    create: string;
    update: string;
    delete: string;
  };
}
