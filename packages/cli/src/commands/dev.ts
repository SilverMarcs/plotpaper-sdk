// =============================================================================
// dev command — start dev server with web preview and live reload
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { startDevServer } from "../dev-server";

export interface DevOptions {
  port?: string;
}

export async function runDev(target: string, options: DevOptions): Promise<void> {
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

  const manifestPath = path.join(resolved, "plotpaper.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(chalk.red(`No plotpaper.json found in ${resolved}`));
    console.error(chalk.dim(`  Run 'plotpaper init ${target}' to create a project.`));
    process.exit(1);
  }

  const port = options.port ? parseInt(options.port, 10) : 3000;
  await startDevServer(resolved, { port });
}
