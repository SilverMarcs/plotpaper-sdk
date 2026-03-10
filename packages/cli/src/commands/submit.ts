// =============================================================================
// submit command — validate, bundle, and upload to Plotpaper platform
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { validateSource } from "../validation";
import { resolveSchema } from "../validation/schema";
import { submitApp } from "../utils/api";

export interface SubmitOptions {
  email?: string;
  name?: string;
  description?: string;
  mode?: "private" | "multiplayer";
  schema?: string;
}

export async function runSubmit(filePath: string, options: SubmitOptions): Promise<void> {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`File not found: ${resolved}`));
    process.exit(1);
  }

  if (!options.email) {
    console.error(chalk.red("\n  Email is required."));
    console.error(chalk.dim("  Use --email <your-email> to specify your registered Plotpaper email."));
    process.exit(1);
  }

  const source = fs.readFileSync(resolved, "utf-8");

  // Validate
  console.log();
  console.log(chalk.bold(`Submitting ${path.basename(resolved)}`));

  const validation = validateSource(source, {
    filePath: resolved,
    schemaPath: options.schema,
  });
  if (!validation.valid) {
    console.log(chalk.red.bold(`\n  Validation failed:`));
    for (const err of validation.errors) {
      console.log(chalk.red(`  ✗ ${err}`));
    }
    process.exit(1);
  }

  // Resolve app name
  const name = options.name || path.basename(resolved, path.extname(resolved));
  const description = options.description || "";
  const appMode = options.mode || "private";

  // Schema and permissions from validation result
  const schema = validation.schema?.schema;
  const permissions = validation.schema?.permissions;

  console.log(chalk.dim(`\n  Email: ${options.email}`));
  console.log(chalk.dim(`  Name: ${name}`));
  console.log(chalk.dim(`  Mode: ${appMode}`));
  if (schema) {
    console.log(chalk.dim(`  Schema: ${schema.entities.length} entities`));
  }
  if (permissions) {
    console.log(chalk.dim(`  Permissions: ${permissions.length} rule(s)`));
  }

  try {
    const result = await submitApp({
      email: options.email,
      sourceCode: source,
      name,
      description,
      schema,
      permissions,
      appMode,
    });

    console.log(chalk.green.bold(`\n  ✓ App submitted successfully`));
    console.log(chalk.dim(`    App ID: ${result.appId}`));
    if (result.versionId) {
      console.log(chalk.dim(`    Version ID: ${result.versionId}`));
    }
    if (result.creditsCharged) {
      console.log(chalk.dim(`    Credits charged: ${result.creditsCharged}`));
    }
  } catch (err: any) {
    console.error(chalk.red(`\n  Submit failed: ${err.message}`));
    process.exit(1);
  }
}
