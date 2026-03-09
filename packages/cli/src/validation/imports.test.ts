import { describe, it, expect } from "vitest";
import { validateImports } from "./imports";

describe("validateImports", () => {
  it("allows all permitted modules", () => {
    const source = `
      import React from "react";
      import { View, Text } from "react-native";
      import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
      import Feather from "@expo/vector-icons/Feather";
      import { Svg, Circle } from "react-native-svg";
      import { SafeAreaView } from "react-native-safe-area-context";
    `;
    expect(validateImports(source)).toEqual([]);
  });

  it("rejects forbidden ES imports", () => {
    const source = `import axios from "axios";`;
    const violations = validateImports(source);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("axios");
  });

  it("rejects forbidden require calls", () => {
    const source = `const fs = require("fs");`;
    const violations = validateImports(source);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("fs");
  });

  it("catches multiple violations", () => {
    const source = `
      import axios from "axios";
      import lodash from "lodash";
      const fs = require("fs");
    `;
    const violations = validateImports(source);
    expect(violations).toHaveLength(3);
  });

  it("returns empty for source with no imports", () => {
    const source = `export default function App() { return null; }`;
    expect(validateImports(source)).toEqual([]);
  });

  it("handles destructured imports", () => {
    const source = `import { useState, useEffect } from "react";`;
    expect(validateImports(source)).toEqual([]);
  });

  it("handles namespace imports", () => {
    const source = `import * as RN from "react-native";`;
    expect(validateImports(source)).toEqual([]);
  });

  it("rejects nested path imports from forbidden packages", () => {
    const source = `import Something from "react-native-gesture-handler/DrawerLayout";`;
    const violations = validateImports(source);
    expect(violations).toHaveLength(1);
  });
});
