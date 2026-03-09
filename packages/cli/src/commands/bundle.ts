// =============================================================================
// bundle command — compile source to IIFE bundle
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import chalk from "chalk";
import { validateSource, validateProject, validateBundle } from "../validation";
import { bundle } from "../bundler";
import { validateManifest, type Manifest } from "@plotpaper/core";

export interface BundleOptions {
  output?: string;
  bundleId?: string;
  schema?: string;
}

export async function runBundle(target: string, options: BundleOptions): Promise<void> {
  const resolved = path.resolve(target);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`Not found: ${resolved}`));
    process.exit(1);
  }

  const stat = fs.statSync(resolved);
  let source: string;
  let resolveDir: string;
  let displayName: string;
  let outputBaseName: string;
  let manifest: Manifest | undefined;

  if (stat.isDirectory()) {
    // Project directory — read manifest
    const projectResult = validateProject(resolved);
    if (!projectResult.valid) {
      console.log(chalk.red.bold(`\n  Validation failed:`));
      for (const err of projectResult.errors) {
        console.log(chalk.red(`  ✗ ${err}`));
      }
      console.log(chalk.dim(`\n  Run 'plotpaper validate ${target}' for details.`));
      process.exit(1);
    }

    manifest = projectResult.manifest!;
    source = fs.readFileSync(projectResult.entryPath!, "utf-8");
    resolveDir = resolved;
    displayName = `${manifest.name} (${path.basename(resolved)}/)`;
    outputBaseName = manifest.name.replace(/[^a-zA-Z0-9_-]/g, "-");
  } else {
    // Single file — backward compat
    source = fs.readFileSync(resolved, "utf-8");

    const validation = validateSource(source, {
      filePath: resolved,
      schemaPath: options.schema,
    });
    if (!validation.valid) {
      console.log(chalk.red.bold(`\n  Validation failed:`));
      for (const err of validation.errors) {
        console.log(chalk.red(`  ✗ ${err}`));
      }
      console.log(chalk.dim(`\n  Run 'plotpaper validate ${target}' for details.`));
      process.exit(1);
    }

    resolveDir = path.dirname(resolved);
    displayName = path.basename(resolved);
    outputBaseName = path.basename(resolved, path.extname(resolved));
  }

  console.log();
  console.log(chalk.bold(`Bundling ${displayName}`));

  // Generate bundle ID if not provided
  const bundleId = options.bundleId || crypto.randomUUID();

  try {
    const bundled = await bundle(source, bundleId, resolveDir);

    // Validate bundle size
    const bundleCheck = validateBundle(bundled);
    if (!bundleCheck.valid) {
      console.error(chalk.red(`\n  ${bundleCheck.error}`));
      process.exit(1);
    }

    // Write output
    const outputPath = options.output
      ? path.resolve(options.output)
      : stat.isDirectory()
        ? path.join(resolved, `${outputBaseName}.bundle.js`)
        : resolved.replace(/\.tsx?$/, ".bundle.js");

    fs.writeFileSync(outputPath, bundled, "utf-8");

    const sourceKB = (Buffer.byteLength(source, "utf-8") / 1024).toFixed(1);
    const bundleKB = (Buffer.byteLength(bundled, "utf-8") / 1024).toFixed(1);

    console.log(chalk.green(`\n  ✓ Bundle written to ${path.relative(process.cwd(), outputPath)}`));
    console.log(chalk.dim(`    Source: ${sourceKB} KB → Bundle: ${bundleKB} KB`));
    console.log(chalk.dim(`    Bundle ID: ${bundleId}`));
  } catch (err: any) {
    console.error(chalk.red(`\n  Bundle failed: ${err.message}`));
    process.exit(1);
  }
}
