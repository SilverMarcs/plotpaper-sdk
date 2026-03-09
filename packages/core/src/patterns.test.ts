import { describe, it, expect } from "vitest";
import { BLOCKED_PATTERNS, ALLOWED_MODULES, getAllowedModules } from "./patterns";
import { CORE_MODULES, OPTIONAL_MODULES } from "./constants";

describe("BLOCKED_PATTERNS", () => {
  it("blocks fetch()", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "fetch()")!;
    expect(pattern.pattern.test('fetch("url")')).toBe(true);
    expect(pattern.pattern.test("fetch(url)")).toBe(true);
    expect(pattern.pattern.test("prefetch")).toBe(false);
  });

  it("blocks XMLHttpRequest", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "XMLHttpRequest")!;
    expect(pattern.pattern.test("new XMLHttpRequest()")).toBe(true);
    expect(pattern.pattern.test("const x = XMLHttpRequest")).toBe(true);
  });

  it("blocks eval()", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "eval()")!;
    expect(pattern.pattern.test("eval('code')")).toBe(true);
    expect(pattern.pattern.test("someeval()")).toBe(false);
  });

  it("blocks Function constructor", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "Function constructor")!;
    expect(pattern.pattern.test("new Function('return 1')")).toBe(true);
    expect(pattern.pattern.test("Function('code')")).toBe(true);
  });

  it("blocks AsyncStorage", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "AsyncStorage")!;
    expect(pattern.pattern.test("AsyncStorage.getItem")).toBe(true);
  });

  it("blocks Linking", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "Linking")!;
    expect(pattern.pattern.test("Linking.openURL")).toBe(true);
  });

  it("blocks NativeModules", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "NativeModules")!;
    expect(pattern.pattern.test("NativeModules.SomeModule")).toBe(true);
  });

  it("blocks constructor chain", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "constructor chain")!;
    expect(pattern.pattern.test("x.constructor.constructor")).toBe(true);
    expect(pattern.pattern.test("this.constructor.constructor('code')")).toBe(true);
  });

  it("blocks __proto__ access", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "__proto__ access")!;
    expect(pattern.pattern.test("obj.__proto__")).toBe(true);
  });

  it("blocks Object.getPrototypeOf", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "prototype access")!;
    expect(pattern.pattern.test("Object.getPrototypeOf(x)")).toBe(true);
  });

  it("blocks Reflect mutations", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "Reflect mutation")!;
    expect(pattern.pattern.test("Reflect.defineProperty")).toBe(true);
    expect(pattern.pattern.test("Reflect.setPrototypeOf")).toBe(true);
    expect(pattern.pattern.test("Reflect.set")).toBe(true);
    expect(pattern.pattern.test("Reflect.get")).toBe(false);
  });

  it("blocks process access", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "process access")!;
    expect(pattern.pattern.test("process.env")).toBe(true);
    expect(pattern.pattern.test("process.exit()")).toBe(true);
  });

  it("blocks globalThis but allows __pp prefix", () => {
    const pattern = BLOCKED_PATTERNS.find((p) => p.label === "globalThis access")!;
    expect(pattern.pattern.test("globalThis.window")).toBe(true);
    expect(pattern.pattern.test("globalThis.__ppModules")).toBe(false);
  });

  it("has 13 blocked patterns (imports handled separately)", () => {
    expect(BLOCKED_PATTERNS).toHaveLength(13);
  });
});

describe("ALLOWED_MODULES", () => {
  it("includes all core modules", () => {
    expect(ALLOWED_MODULES).toContain("react");
    expect(ALLOWED_MODULES).toContain("react-native");
    expect(ALLOWED_MODULES).toContain("@plotpaper/mini-app-sdk");
    expect(ALLOWED_MODULES).toContain("@expo/vector-icons/Feather");
    expect(ALLOWED_MODULES).toContain("react-native-svg");
    expect(ALLOWED_MODULES).toContain("react-native-safe-area-context");
  });

  it("equals CORE_MODULES", () => {
    expect(ALLOWED_MODULES).toEqual(CORE_MODULES);
  });
});

describe("getAllowedModules", () => {
  it("returns core modules when no optional modules declared", () => {
    expect(getAllowedModules()).toEqual(CORE_MODULES);
    expect(getAllowedModules([])).toEqual(CORE_MODULES);
  });

  it("adds valid optional modules", () => {
    const result = getAllowedModules(["expo-haptics", "expo-clipboard"]);
    expect(result).toEqual([...CORE_MODULES, "expo-haptics", "expo-clipboard"]);
  });

  it("throws on unknown modules", () => {
    expect(() => getAllowedModules(["unknown-pkg"])).toThrow("Unknown modules");
  });

  it("accepts all defined optional modules", () => {
    const result = getAllowedModules(OPTIONAL_MODULES);
    expect(result).toEqual([...CORE_MODULES, ...OPTIONAL_MODULES]);
  });
});
