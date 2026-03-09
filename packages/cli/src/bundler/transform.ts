// =============================================================================
// esbuild Transform Step
// =============================================================================

import * as esbuild from "esbuild-wasm";

let esbuildReady = false;

async function ensureEsbuild(): Promise<void> {
  if (!esbuildReady) {
    await esbuild.initialize({ worker: false });
    esbuildReady = true;
  }
}

/**
 * Transpile source code using esbuild:
 * - JSX → React.createElement
 * - async/await → generators
 * - Target ES2016 (Hermes compatible)
 */
export async function transformSource(source: string): Promise<string> {
  await ensureEsbuild();

  const result = await esbuild.transform(source, {
    loader: "tsx",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    target: "es2016",
    charset: "utf8",
  });

  return result.code;
}
