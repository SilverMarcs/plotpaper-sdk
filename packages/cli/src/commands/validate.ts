// =============================================================================
// validate command — check source code against all rules
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { validateSource } from "../validation";

export interface ValidateOptions {
  schema?: string;
}

export async function runValidate(filePath: string, options?: ValidateOptions): Promise<void> {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`File not found: ${resolved}`));
    process.exit(1);
  }

  const source = fs.readFileSync(resolved, "utf-8");
  const result = validateSource(source, {
    filePath: resolved,
    schemaPath: options?.schema,
  });

  console.log();
  console.log(chalk.bold(`Validating ${path.basename(resolved)}`));
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
    const sizeKB = (Buffer.byteLength(source, "utf-8") / 1024).toFixed(1);
    console.log(chalk.green.bold(`  ✓ Valid`) + chalk.dim(` (${sizeKB} KB)`));
  } else {
    console.log(chalk.red.bold(`  ✗ Invalid`));
    process.exit(1);
  }
}
