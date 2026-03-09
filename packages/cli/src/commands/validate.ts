// =============================================================================
// validate command — check a project directory against all rules
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { validateProject } from "../validation";

export async function runValidate(target: string): Promise<void> {
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

  const result = validateProject(resolved);
  const displayName = result.manifest
    ? `${result.manifest.name} (${path.basename(resolved)}/)`
    : path.basename(resolved) + "/";

  console.log();
  console.log(chalk.bold(`Validating ${displayName}`));
  console.log();

  if (result.errors.length > 0) {
    console.log(chalk.red.bold(`  ${result.errors.length} error(s):`));
    for (const err of result.errors) {
      console.log(chalk.red(`  ✗ ${err}`));
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log(chalk.yellow.bold(`  ${result.warnings.length} warning(s):`));
    for (const warn of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${warn}`));
    }
    console.log();
  }

  if (result.schema) {
    const s = result.schema;
    const entityCount = s.schema.entities.length;
    const linkCount = s.schema.links?.length ?? 0;
    console.log(chalk.cyan(`  Schema: ${entityCount} entit${entityCount === 1 ? "y" : "ies"}, ${linkCount} link(s)`));
    for (const entity of s.schema.entities) {
      console.log(chalk.cyan(`    • ${entity.name} (${entity.attrs.length} attrs)`));
    }
    if (s.permissions) {
      console.log(chalk.cyan(`  Permissions: ${s.permissions.length} rule(s)`));
    }
    console.log();
  }

  if (result.valid) {
    const entryPath = result.entryPath;
    const source = entryPath && fs.existsSync(entryPath)
      ? fs.readFileSync(entryPath, "utf-8")
      : "";
    const sizeKB = source
      ? (Buffer.byteLength(source, "utf-8") / 1024).toFixed(1)
      : "0";
    console.log(chalk.green.bold(`  ✓ Valid`) + chalk.dim(` (${sizeKB} KB)`));
  } else {
    console.log(chalk.red.bold(`  ✗ Invalid`));
    process.exit(1);
  }
}
