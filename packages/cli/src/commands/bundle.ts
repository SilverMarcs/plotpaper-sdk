// =============================================================================
// bundle command — compile source to IIFE bundle
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import chalk from "chalk";
import { validateSource, validateBundle } from "../validation";
import { bundle } from "../bundler";

export interface BundleOptions {
  output?: string;
  bundleId?: string;
  schema?: string;
}

export async function runBundle(filePath: string, options: BundleOptions): Promise<void> {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`File not found: ${resolved}`));
    process.exit(1);
  }

  const source = fs.readFileSync(resolved, "utf-8");

  // Validate first
  console.log();
  console.log(chalk.bold(`Bundling ${path.basename(resolved)}`));

  const validation = validateSource(source, {
    filePath: resolved,
    schemaPath: options.schema,
  });
  if (!validation.valid) {
    console.log(chalk.red.bold(`\n  Validation failed:`));
    for (const err of validation.errors) {
      console.log(chalk.red(`  ✗ ${err}`));
    }
    console.log(chalk.dim(`\n  Run 'plotpaper validate ${filePath}' for details.`));
    process.exit(1);
  }

  // Generate bundle ID if not provided
  const bundleId = options.bundleId || crypto.randomUUID();

  try {
    const bundled = await bundle(source, bundleId);

    // Validate bundle size
    const bundleCheck = validateBundle(bundled);
    if (!bundleCheck.valid) {
      console.error(chalk.red(`\n  ${bundleCheck.error}`));
      process.exit(1);
    }

    // Write output
    const outputPath = options.output
      ? path.resolve(options.output)
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
