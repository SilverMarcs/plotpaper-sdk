// =============================================================================
// dev command — watch source file, validate + bundle on changes
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import chalk from "chalk";
import { watch } from "chokidar";
import { validateSource, validateBundle } from "../validation";
import { bundle } from "../bundler";

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

async function runCycle(
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

export async function runDev(filePath: string, options: DevOptions): Promise<void> {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`File not found: ${resolved}`));
    process.exit(1);
  }

  const bundleId = crypto.randomUUID();

  // Determine which files to watch
  const dir = path.dirname(resolved);
  const schemaPath = options.schema
    ? path.resolve(options.schema)
    : path.join(dir, "schema.json");

  const watchPaths = [resolved];
  if (fs.existsSync(schemaPath)) {
    watchPaths.push(schemaPath);
  }

  // Run initial cycle
  await runCycle(resolved, options, bundleId);

  // Watch for changes
  const watcher = watch(watchPaths, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
  });

  watcher.on("change", async () => {
    await runCycle(resolved, options, bundleId);
  });

  // Also watch for schema.json creation if it doesn't exist yet
  if (!fs.existsSync(schemaPath)) {
    const dirWatcher = watch(dir, {
      ignoreInitial: true,
      depth: 0,
    });
    dirWatcher.on("add", async (addedPath) => {
      if (path.basename(addedPath) === "schema.json") {
        watcher.add(addedPath);
        await runCycle(resolved, options, bundleId);
        dirWatcher.close();
      }
    });
  }

  // Keep process alive
  process.on("SIGINT", () => {
    watcher.close();
    console.log(chalk.dim("\n  Stopped."));
    process.exit(0);
  });
}
