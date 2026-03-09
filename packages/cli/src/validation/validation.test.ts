import { describe, it, expect } from "vitest";
import { validateSource, validateBundle } from "./index";

describe("validateSource", () => {
  const validSource = `
    import React from "react";
    import { View, Text } from "react-native";
    import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
    export default function App() { return null; }
  `;

  it("passes valid source", () => {
    const result = validateSource(validSource);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when no default export", () => {
    const source = `
      import React from "react";
      function App() { return null; }
    `;
    const result = validateSource(source);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("default export"))).toBe(true);
  });

  it("fails on forbidden imports", () => {
    const source = `
      import axios from "axios";
      export default function App() { return null; }
    `;
    const result = validateSource(source);
    expect(result.valid).toBe(false);
  });

  it("fails on blocked patterns", () => {
    const source = `
      import React from "react";
      export default function App() { fetch("url"); return null; }
    `;
    const result = validateSource(source);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("fetch"))).toBe(true);
  });

  it("fails on oversized source", () => {
    const source = `export default function App() { return null; }\n` + "x".repeat(51_000);
    const result = validateSource(source);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("50KB"))).toBe(true);
  });

  it("warns when approaching size limit", () => {
    const source = `export default function App() { return null; }\n` + "x".repeat(41_000);
    const result = validateSource(source);
    expect(result.warnings.some((w) => w.includes("approaching"))).toBe(true);
  });

  it("warns when no schema found", () => {
    const result = validateSource(validSource);
    expect(result.warnings.some((w) => w.includes("schema.json"))).toBe(true);
  });
});

describe("validateBundle", () => {
  it("passes valid bundle", () => {
    const result = validateBundle("(function(){})();");
    expect(result.valid).toBe(true);
  });

  it("fails on oversized bundle", () => {
    const bundle = "x".repeat(160_000);
    const result = validateBundle(bundle);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("150000");
  });
});
