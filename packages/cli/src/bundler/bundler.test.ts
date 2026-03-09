import { describe, it, expect } from "vitest";
import { bundle } from "./index";
import { wrapBundle } from "./wrap";

describe("bundle", () => {
  it("bundles a simple React component", async () => {
    const source = `
      import React from "react";
      import { View, Text } from "react-native";
      export default function App() {
        return React.createElement(View, null, React.createElement(Text, null, "hello"));
      }
    `;
    const result = await bundle(source, "test-id");
    expect(result).toContain("__ppMiniApps");
    expect(result).toContain('"test-id"');
    expect(result).toContain("__ppExport");
  });

  it("bundles JSX and transforms to createElement calls", async () => {
    const source = `
      import React from "react";
      import { View, Text } from "react-native";
      export default function App() {
        return <View><Text>hello</Text></View>;
      }
    `;
    const result = await bundle(source, "jsx-test");
    // esbuild transforms JSX — may rename React to import_react
    expect(result).toContain("createElement");
    expect(result).toContain("__ppMiniApps");
  });

  it("resolves SDK imports to __ppModules", async () => {
    const source = `
      import React from "react";
      import { View } from "react-native";
      import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
      export default function App() {
        const sdk = usePlotpaperSDK();
        return React.createElement(View, null);
      }
    `;
    const result = await bundle(source, "sdk-test");
    expect(result).toContain("__ppModules");
    // Should not have raw import statements
    expect(result).not.toMatch(/\bimport\s+.*from\s+["']/);
  });

  it("resolves used allowed modules to __ppModules lookups", async () => {
    const source = `
      import React from "react";
      import { View, Text } from "react-native";
      import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
      import Feather from "@expo/vector-icons/Feather";
      import { Svg, Circle } from "react-native-svg";
      import { SafeAreaView } from "react-native-safe-area-context";
      export default function App() {
        const sdk = usePlotpaperSDK();
        return React.createElement(View, null,
          React.createElement(Text, null, "hi"),
          React.createElement(Feather, { name: "home" }),
          React.createElement(Svg, null, React.createElement(Circle, null)),
          React.createElement(SafeAreaView, null)
        );
      }
    `;
    const result = await bundle(source, "all-modules");
    // All used modules should be resolved via the plugin
    expect(result).toContain("__ppModules");
    // Verify the bundle is a valid IIFE
    expect(result).toMatch(/^\(function\(\)\{/);
    expect(result).toContain("__ppMiniApps");
  });

  it("rejects forbidden imports when used", async () => {
    const source = `
      import React from "react";
      import axios from "axios";
      export default function App() {
        const x = axios.get("url");
        return React.createElement("div", null, String(x));
      }
    `;
    await expect(bundle(source, "bad-import")).rejects.toThrow();
  });

  it("handles default export as named function", async () => {
    const source = `
      import React from "react";
      export default function MyApp() { return null; }
    `;
    const result = await bundle(source, "named-fn");
    expect(result).toContain("__ppMiniApps");
  });

  it("handles default export as expression", async () => {
    const source = `
      import React from "react";
      const App = () => null;
      export default App;
    `;
    const result = await bundle(source, "expr-export");
    expect(result).toContain("__ppMiniApps");
  });

  it("handles string literals containing import-like text", async () => {
    const source = `
      import React from "react";
      import { View, Text } from "react-native";
      export default function App() {
        const msg = 'import something from "somewhere"';
        return React.createElement(Text, null, msg);
      }
    `;
    // This should NOT throw — the old regex approach would break here
    const result = await bundle(source, "string-import");
    expect(result).toContain("__ppMiniApps");
  });

  it("handles template literals with expressions", async () => {
    const source = `
      import React from "react";
      import { Text } from "react-native";
      export default function App() {
        const x = 42;
        return <Text>{\`value is \${x}\`}</Text>;
      }
    `;
    const result = await bundle(source, "template-literal");
    expect(result).toContain("__ppMiniApps");
  });

  it("produces output smaller than bundle size limit", async () => {
    const source = `
      import React from "react";
      import { View } from "react-native";
      export default function App() { return React.createElement(View, null); }
    `;
    const result = await bundle(source, "size-check");
    expect(Buffer.byteLength(result, "utf-8")).toBeLessThan(150_000);
  });
});

describe("wrapBundle", () => {
  it("wraps code in IIFE with registration", () => {
    const code = 'var __ppExport = (() => { return { default: function() {} }; })();';
    const result = wrapBundle(code, "wrap-test");
    expect(result).toMatch(/^\(function\(\)\{/);
    expect(result).toContain('"use strict"');
    expect(result).toContain("__ppMiniApps");
    expect(result).toContain('"wrap-test"');
    expect(result).toContain("__ppExport.default");
    expect(result).toMatch(/\}\)\(\);$/);
  });

  it("escapes special characters in bundle ID", () => {
    const code = "var __ppExport = {};";
    const result = wrapBundle(code, 'test"id');
    expect(result).toContain('test\\"id');
  });
});
