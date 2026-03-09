// =============================================================================
// esbuild Build Step — replaces transform + regex rewrite with a proper
// bundler pass that uses the plotpaper plugin for module resolution.
// =============================================================================

import * as esbuild from "esbuild";
import { plotpaperModulesPlugin } from "@plotpaper/core";

/**
 * Bundle source code using esbuild with the plotpaper modules plugin.
 *
 * This replaces the old pipeline of:
 *   esbuild.transform → stripComments → regexRewriteImports
 *
 * esbuild handles JSX, import resolution (via plugin), tree-shaking,
 * and comment removal as a proper AST-level operation.
 */
export async function buildSource(
  source: string,
  resolveDir?: string,
): Promise<{ code: string; defaultExportName: string }> {
  const result = await esbuild.build({
    stdin: {
      contents: source,
      loader: "tsx",
      resolveDir: resolveDir || process.cwd(),
    },
    bundle: true,
    write: false,
    format: "iife",
    globalName: "__ppExport",
    target: "es2016",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    charset: "utf8",
    plugins: [plotpaperModulesPlugin()],
    logLevel: "silent",
  });

  if (result.errors.length > 0) {
    const messages = result.errors.map((e) => e.text).join("\n");
    throw new Error(`Build failed:\n${messages}`);
  }

  const code = result.outputFiles![0].text;

  return { code, defaultExportName: "__ppExport" };
}
