// =============================================================================
// dev command — watch source file(s), validate + bundle on changes
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import chalk from "chalk";
import { watch } from "chokidar";
import { validateSource, validateProject, validateBundle } from "../validation";
import { bundle } from "../bundler";
import { validateManifest, type Manifest } from "@plotpaper/core";

export interface DevOptions {
  schema?: string;
  output?: string;
}

function clearScreen(): void {
  process.stdout.write("\x1Bc");
}

function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

// ---------------------------------------------------------------------------
// Directory-based dev cycle (project with plotpaper.json)
// ---------------------------------------------------------------------------

async function runProjectCycle(
  projectDir: string,
  options: DevOptions,
  bundleId: string,
): Promise<void> {
  clearScreen();
  console.log(chalk.bold(`  plotpaper dev`) + chalk.dim(` — watching ${path.basename(projectDir)}/`));
  console.log(chalk.dim(`  ${timestamp()}`));
  console.log();

  const result = validateProject(projectDir);

  if (result.errors.length > 0) {
    console.log(chalk.red.bold(`  ${result.errors.length} error(s):`));
    for (const err of result.errors) {
      console.log(chalk.red(`  ✗ ${err}`));
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    for (const warn of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${warn}`));
    }
    console.log();
  }

  if (result.schema) {
    const s = result.schema;
    const entityCount = s.schema.entities.length;
    const linkCount = s.schema.links?.length ?? 0;
    console.log(
      chalk.cyan(
        `  Schema: ${entityCount} entit${entityCount === 1 ? "y" : "ies"}, ${linkCount} link(s)`,
      ),
    );
  }

  if (!result.valid || !result.entryPath) {
    console.log(chalk.red.bold(`\n  ✗ Invalid`));
    console.log(chalk.dim(`\n  Watching for changes...`));
    return;
  }

  const source = fs.readFileSync(result.entryPath, "utf-8");
  const sizeKB = (Buffer.byteLength(source, "utf-8") / 1024).toFixed(1);

  // Bundle
  try {
    const bundled = await bundle(source, bundleId, projectDir);
    const bundleCheck = validateBundle(bundled);

    if (!bundleCheck.valid) {
      console.log(chalk.red(`\n  ${bundleCheck.error}`));
      console.log(chalk.dim(`\n  Watching for changes...`));
      return;
    }

    const outputBaseName = result.manifest!.name.replace(/[^a-zA-Z0-9_-]/g, "-");
    const outputPath =
      options.output
        ? path.resolve(options.output)
        : path.join(projectDir, `${outputBaseName}.bundle.js`);

    fs.writeFileSync(outputPath, bundled, "utf-8");

    const bundleKB = (Buffer.byteLength(bundled, "utf-8") / 1024).toFixed(1);
    console.log(
      chalk.green.bold(`\n  ✓ Valid`) +
        chalk.dim(` — ${sizeKB} KB → ${bundleKB} KB`),
    );
  } catch (err: any) {
    console.log(chalk.red(`\n  Bundle error: ${err.message}`));
  }

  console.log(chalk.dim(`\n  Watching for changes...`));
}

// ---------------------------------------------------------------------------
// Single-file dev cycle (backward compat)
// ---------------------------------------------------------------------------

async function runFileCycle(
  filePath: string,
  options: DevOptions,
  bundleId: string,
): Promise<void> {
  const source = fs.readFileSync(filePath, "utf-8");
  const basename = path.basename(filePath);
  const sizeKB = (Buffer.byteLength(source, "utf-8") / 1024).toFixed(1);

  clearScreen();
  console.log(chalk.bold(`  plotpaper dev`) + chalk.dim(` — watching ${basename}`));
  console.log(chalk.dim(`  ${timestamp()}`));
  console.log();

  // Validate
  const result = validateSource(source, {
    filePath,
    schemaPath: options.schema,
  });

  if (result.errors.length > 0) {
    console.log(chalk.red.bold(`  ${result.errors.length} error(s):`));
    for (const err of result.errors) {
      console.log(chalk.red(`  ✗ ${err}`));
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    for (const warn of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${warn}`));
    }
    console.log();
  }

  if (result.schema) {
    const s = result.schema;
    const entityCount = s.schema.entities.length;
    const linkCount = s.schema.links?.length ?? 0;
    console.log(
      chalk.cyan(
        `  Schema: ${entityCount} entit${entityCount === 1 ? "y" : "ies"}, ${linkCount} link(s)`,
      ),
    );
  }

  if (!result.valid) {
    console.log(chalk.red.bold(`\n  ✗ Invalid`) + chalk.dim(` (${sizeKB} KB)`));
    console.log(chalk.dim(`\n  Watching for changes...`));
    return;
  }

  // Bundle
  try {
    const bundled = await bundle(source, bundleId, path.dirname(filePath));
    const bundleCheck = validateBundle(bundled);

    if (!bundleCheck.valid) {
      console.log(chalk.red(`\n  ${bundleCheck.error}`));
      console.log(chalk.dim(`\n  Watching for changes...`));
      return;
    }

    const outputPath =
      options.output
        ? path.resolve(options.output)
        : filePath.replace(/\.tsx?$/, ".bundle.js");

    fs.writeFileSync(outputPath, bundled, "utf-8");

    const bundleKB = (Buffer.byteLength(bundled, "utf-8") / 1024).toFixed(1);
    console.log(
      chalk.green.bold(`\n  ✓ Valid`) +
        chalk.dim(` — ${sizeKB} KB → ${bundleKB} KB`),
    );
  } catch (err: any) {
    console.log(chalk.red(`\n  Bundle error: ${err.message}`));
  }

  console.log(chalk.dim(`\n  Watching for changes...`));
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runDev(target: string, options: DevOptions): Promise<void> {
  const resolved = path.resolve(target);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`Not found: ${resolved}`));
    process.exit(1);
  }

  const stat = fs.statSync(resolved);
  const bundleId = crypto.randomUUID();

  if (stat.isDirectory()) {
    // Project directory mode
    await runProjectCycle(resolved, options, bundleId);

    // Watch all .ts/.tsx files, schema.json, permissions.json, plotpaper.json
    const watcher = watch(
      [
        path.join(resolved, "**/*.ts"),
        path.join(resolved, "**/*.tsx"),
        path.join(resolved, "schema.json"),
        path.join(resolved, "permissions.json"),
        path.join(resolved, "plotpaper.json"),
      ],
      {
        ignoreInitial: true,
        ignored: [
          "**/node_modules/**",
          "**/*.bundle.js",
          "**/*.d.ts",
        ],
        awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
      },
    );

    watcher.on("change", async () => {
      await runProjectCycle(resolved, options, bundleId);
    });
    watcher.on("add", async () => {
      await runProjectCycle(resolved, options, bundleId);
    });

    process.on("SIGINT", () => {
      watcher.close();
      console.log(chalk.dim("\n  Stopped."));
      process.exit(0);
    });
  } else {
    // Single file mode (backward compat)
    const dir = path.dirname(resolved);
    const schemaPath = options.schema
      ? path.resolve(options.schema)
      : path.join(dir, "schema.json");

    const watchPaths = [resolved];
    if (fs.existsSync(schemaPath)) {
      watchPaths.push(schemaPath);
    }

    await runFileCycle(resolved, options, bundleId);

    const watcher = watch(watchPaths, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
    });

    watcher.on("change", async () => {
      await runFileCycle(resolved, options, bundleId);
    });

    if (!fs.existsSync(schemaPath)) {
      const dirWatcher = watch(dir, {
        ignoreInitial: true,
        depth: 0,
      });
      dirWatcher.on("add", async (addedPath) => {
        if (path.basename(addedPath) === "schema.json") {
          watcher.add(addedPath);
          await runFileCycle(resolved, options, bundleId);
          dirWatcher.close();
        }
      });
    }

    process.on("SIGINT", () => {
      watcher.close();
      console.log(chalk.dim("\n  Stopped."));
      process.exit(0);
    });
  }
}
