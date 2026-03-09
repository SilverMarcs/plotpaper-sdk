// =============================================================================
// Dev Server — HTTP server with SSE live reload and web preview
// =============================================================================

import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import chalk from "chalk";
import { watch } from "chokidar";
import { validateProject, validateBundle } from "../validation";
import { bundle } from "../bundler";
import { getHarnessHtml } from "./html";
import { getAllowedModules, validateManifest } from "@plotpaper/core";

export interface DevServerOptions {
  port?: number;
}

export async function startDevServer(
  projectDir: string,
  options: DevServerOptions = {},
): Promise<void> {
  const port = options.port || 3000;
  let currentBundle = "";
  let currentErrors: string[] = [];
  let currentWarnings: string[] = [];
  let sseClients: http.ServerResponse[] = [];
  const bundleId = crypto.randomUUID();

  // Read manifest for modules list
  let allowedModules: string[] | undefined;
  try {
    const manifestPath = path.join(projectDir, "plotpaper.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = validateManifest(fs.readFileSync(manifestPath, "utf-8"));
      if (manifest.modules?.length) {
        allowedModules = getAllowedModules(manifest.modules);
      }
    }
  } catch {
    // Will be caught during validation
  }

  async function rebuild(): Promise<void> {
    const result = validateProject(projectDir);
    currentErrors = [...result.errors];
    currentWarnings = [...result.warnings];

    if (result.valid && result.entryPath) {
      try {
        const source = fs.readFileSync(result.entryPath, "utf-8");
        const bundled = await bundle(
          source,
          bundleId,
          projectDir,
          result.allowedModules.length > 0 ? result.allowedModules : allowedModules,
        );
        const bundleCheck = validateBundle(bundled);
        if (bundleCheck.valid) {
          currentBundle = bundled;
        } else {
          currentErrors.push(bundleCheck.error!);
        }
      } catch (err: any) {
        currentErrors.push(`Bundle error: ${err.message}`);
      }
    }

    // Notify SSE clients
    for (const client of sseClients) {
      try {
        client.write("event: reload\ndata: {}\n\n");
      } catch {
        // Client disconnected
      }
    }

    // Terminal output
    printStatus(projectDir, currentErrors, currentWarnings, result.schema);
  }

  // Initial build
  await rebuild();

  // HTTP server
  const server = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(getHarnessHtml(currentErrors));
    } else if (req.url?.startsWith("/app.js")) {
      res.writeHead(200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(currentBundle);
    } else if (req.url === "/sse") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(": connected\n\n");
      sseClients.push(res);
      req.on("close", () => {
        sseClients = sseClients.filter((c) => c !== res);
      });
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  server.listen(port, () => {
    console.log();
    console.log(chalk.bold(`  plotpaper dev`) + chalk.dim(` — ${path.basename(projectDir)}/`));
    console.log(chalk.cyan(`  http://localhost:${port}`));
    console.log(chalk.dim(`  Watching for changes...\n`));
  });

  // File watcher
  const watcher = watch(
    [
      path.join(projectDir, "**/*.ts"),
      path.join(projectDir, "**/*.tsx"),
      path.join(projectDir, "schema.json"),
      path.join(projectDir, "permissions.json"),
      path.join(projectDir, "plotpaper.json"),
    ],
    {
      ignoreInitial: true,
      ignored: [
        "**/node_modules/**",
        "**/*.bundle.js",
        "**/*.d.ts",
        "**/plotpaper.generated.ts",
      ],
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
    },
  );

  watcher.on("change", () => rebuild());
  watcher.on("add", () => rebuild());

  process.on("SIGINT", () => {
    watcher.close();
    server.close();
    console.log(chalk.dim("\n  Stopped."));
    process.exit(0);
  });
}

function printStatus(
  dir: string,
  errors: string[],
  warnings: string[],
  schema: any,
): void {
  process.stdout.write("\x1Bc");
  console.log(
    chalk.bold(`  plotpaper dev`) +
      chalk.dim(` — ${path.basename(dir)}/`),
  );
  console.log(
    chalk.dim(`  ${new Date().toLocaleTimeString("en-US", { hour12: false })}`),
  );
  console.log();

  if (errors.length > 0) {
    console.log(chalk.red.bold(`  ${errors.length} error(s):`));
    for (const err of errors) {
      console.log(chalk.red(`  ✗ ${err}`));
    }
    console.log();
  }

  if (warnings.length > 0) {
    for (const warn of warnings) {
      console.log(chalk.yellow(`  ⚠ ${warn}`));
    }
    console.log();
  }

  if (schema) {
    const entityCount = schema.schema.entities.length;
    const linkCount = schema.schema.links?.length ?? 0;
    console.log(
      chalk.cyan(
        `  Schema: ${entityCount} entit${entityCount === 1 ? "y" : "ies"}, ${linkCount} link(s)`,
      ),
    );
  }

  if (errors.length === 0) {
    console.log(chalk.green.bold(`\n  ✓ Valid`));
  } else {
    console.log(chalk.red.bold(`\n  ✗ Invalid`));
  }

  console.log(chalk.dim(`\n  Watching for changes...`));
}
