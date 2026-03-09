// =============================================================================
// bundle command — compile a project into an IIFE bundle
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import chalk from "chalk";
import { validateProject, validateBundle } from "../validation";
import { bundle } from "../bundler";

export interface BundleOptions {
  output?: string;
  bundleId?: string;
}

export async function runBundle(target: string, options: BundleOptions): Promise<void> {
  const resolved = path.resolve(target);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`Not found: ${resolved}`));
    process.exit(1);
  }

  if (!fs.statSync(resolved).isDirectory()) {
    console.error(chalk.red(`Expected a project directory: ${resolved}`));
    console.error(chalk.dim(`  Run 'plotpaper init' to create a project.`));
    process.exit(1);
  }

  const projectResult = validateProject(resolved);
  if (!projectResult.valid) {
    console.log(chalk.red.bold(`\n  Validation failed:`));
    for (const err of projectResult.errors) {
      console.log(chalk.red(`  ✗ ${err}`));
    }
    console.log(chalk.dim(`\n  Run 'plotpaper validate ${target}' for details.`));
    process.exit(1);
  }

  const manifest = projectResult.manifest!;
  const source = fs.readFileSync(projectResult.entryPath!, "utf-8");
  const displayName = `${manifest.name} (${path.basename(resolved)}/)`;
  const outputBaseName = manifest.name.replace(/[^a-zA-Z0-9_-]/g, "-");

  console.log();
  console.log(chalk.bold(`Bundling ${displayName}`));

  const bundleId = options.bundleId || crypto.randomUUID();

  try {
    const bundled = await bundle(source, bundleId, resolved, projectResult.allowedModules);

    const bundleCheck = validateBundle(bundled);
    if (!bundleCheck.valid) {
      console.error(chalk.red(`\n  ${bundleCheck.error}`));
      process.exit(1);
    }

    const outputPath = options.output
      ? path.resolve(options.output)
      : path.join(resolved, `${outputBaseName}.bundle.js`);

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
