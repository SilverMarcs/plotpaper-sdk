import { describe, it, expect } from "vitest";
import { validateManifest, ManifestZ } from "./manifest";
import { SDK_VERSION } from "./constants";

describe("validateManifest", () => {
  it("validates a minimal manifest", () => {
    const manifest = validateManifest(JSON.stringify({ name: "my-app" }));
    expect(manifest.name).toBe("my-app");
    expect(manifest.entry).toBe("App.tsx");
    expect(manifest.sdkVersion).toBe(SDK_VERSION);
    expect(manifest.mode).toBe("private");
  });

  it("validates a full manifest", () => {
    const manifest = validateManifest(
      JSON.stringify({
        name: "todo-list",
        description: "A simple todo list",
        entry: "index.tsx",
        sdkVersion: "0.2.0",
        mode: "multiplayer",
      }),
    );
    expect(manifest.name).toBe("todo-list");
    expect(manifest.description).toBe("A simple todo list");
    expect(manifest.entry).toBe("index.tsx");
    expect(manifest.sdkVersion).toBe("0.2.0");
    expect(manifest.mode).toBe("multiplayer");
  });

  it("applies defaults for optional fields", () => {
    const manifest = validateManifest(JSON.stringify({ name: "test" }));
    expect(manifest.entry).toBe("App.tsx");
    expect(manifest.mode).toBe("private");
  });

  it("rejects invalid JSON", () => {
    expect(() => validateManifest("not json")).toThrow("invalid JSON");
  });

  it("rejects empty name", () => {
    expect(() =>
      validateManifest(JSON.stringify({ name: "" })),
    ).toThrow();
  });

  it("rejects name longer than 100 characters", () => {
    expect(() =>
      validateManifest(JSON.stringify({ name: "x".repeat(101) })),
    ).toThrow();
  });

  it("rejects description longer than 500 characters", () => {
    expect(() =>
      validateManifest(
        JSON.stringify({ name: "test", description: "x".repeat(501) }),
      ),
    ).toThrow();
  });

  it("rejects invalid mode", () => {
    expect(() =>
      validateManifest(JSON.stringify({ name: "test", mode: "public" })),
    ).toThrow();
  });

  it("accepts private mode", () => {
    const manifest = validateManifest(
      JSON.stringify({ name: "test", mode: "private" }),
    );
    expect(manifest.mode).toBe("private");
  });

  it("accepts multiplayer mode", () => {
    const manifest = validateManifest(
      JSON.stringify({ name: "test", mode: "multiplayer" }),
    );
    expect(manifest.mode).toBe("multiplayer");
  });

  it("rejects missing name", () => {
    expect(() =>
      validateManifest(JSON.stringify({ entry: "App.tsx" })),
    ).toThrow();
  });
});

describe("ManifestZ", () => {
  it("exports the Zod schema", () => {
    expect(ManifestZ).toBeDefined();
    expect(ManifestZ.parse).toBeDefined();
  });
});
