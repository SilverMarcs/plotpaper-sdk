// =============================================================================
// submit command — validate and upload to Plotpaper platform
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { SDK_VERSION } from "@plotpaper/core";
import { validateSource, validateProject } from "../validation";
import { loadConfig } from "../utils/config";
import { submitApp } from "../utils/api";
import type { Manifest } from "@plotpaper/core";

export interface SubmitOptions {
  name?: string;
  description?: string;
  mode?: "private" | "multiplayer";
  schema?: string;
}

export async function runSubmit(target: string, options: SubmitOptions): Promise<void> {
  const resolved = path.resolve(target);

  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`Not found: ${resolved}`));
    process.exit(1);
  }

  const stat = fs.statSync(resolved);
  let source: string;
  let manifest: Manifest | undefined;
  let validationResult: { valid: boolean; errors: string[]; schema: any };

  if (stat.isDirectory()) {
    // Project directory — read manifest
    const projectResult = validateProject(resolved);
    if (!projectResult.valid) {
      console.log(chalk.red.bold(`\n  Validation failed:`));
      for (const err of projectResult.errors) {
        console.log(chalk.red(`  ✗ ${err}`));
      }
      process.exit(1);
    }

    manifest = projectResult.manifest!;
    source = fs.readFileSync(projectResult.entryPath!, "utf-8");
    validationResult = projectResult;
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
      process.exit(1);
    }
    validationResult = validation;
  }

  const displayName = stat.isDirectory()
    ? `${manifest!.name} (${path.basename(resolved)}/)`
    : path.basename(resolved);

  console.log();
  console.log(chalk.bold(`Submitting ${displayName}`));

  // Load auth — email or API key
  const config = loadConfig();
  if (!config.email && !config.apiKey) {
    console.error(chalk.red("\n  Not logged in."));
    console.error(chalk.dim("  Run: plotpaper login"));
    process.exit(1);
  }

  // Resolve app metadata: manifest values, with CLI flags as overrides
  const name = options.name
    || manifest?.name
    || path.basename(resolved, path.extname(resolved));
  const description = options.description
    || manifest?.description
    || "";
  const appMode = options.mode
    || manifest?.mode
    || "private";
  const sdkVersion = manifest?.sdkVersion || SDK_VERSION;

  // Schema and permissions from validation result
  const schema = validationResult.schema?.schema;
  const permissions = validationResult.schema?.permissions;

  console.log(chalk.dim(`\n  Name: ${name}`));
  console.log(chalk.dim(`  Mode: ${appMode}`));
  console.log(chalk.dim(`  SDK:  ${sdkVersion}`));
  if (schema) {
    console.log(chalk.dim(`  Schema: ${schema.entities.length} entities`));
  }
  if (permissions) {
    console.log(chalk.dim(`  Permissions: ${permissions.length} rule(s)`));
  }

  try {
    const result = await submitApp(
      { email: config.email, apiKey: config.apiKey },
      {
        sourceCode: source,
        name,
        description,
        schema,
        permissions,
        appMode,
        sdkVersion,
      },
    );

    console.log(chalk.green.bold(`\n  ✓ App submitted successfully`));
    console.log(chalk.dim(`    App ID: ${result.appId}`));
    if (result.versionId) {
      console.log(chalk.dim(`    Version ID: ${result.versionId}`));
    }
  } catch (err: any) {
    console.error(chalk.red(`\n  Submit failed: ${err.message}`));
    process.exit(1);
  }
}
