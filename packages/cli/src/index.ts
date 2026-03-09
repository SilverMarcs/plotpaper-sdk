// =============================================================================
// Plotpaper CLI — validate, bundle, and submit mini apps
// =============================================================================

import { Command } from "commander";
import { runValidate } from "./commands/validate";
import { runBundle } from "./commands/bundle";
import { runSubmit } from "./commands/submit";
import { runInit } from "./commands/init";
import { runDev } from "./commands/dev";
import { runCodegen } from "./commands/codegen";
import { runLogin } from "./commands/login";
import { saveConfig } from "./utils/config";

const program = new Command();

program
  .name("plotpaper")
  .description("CLI for building and submitting Plotpaper mini apps")
  .version("0.1.0");

// ── init ──────────────────────────────────────────────────────────────
program
  .command("init [directory]")
  .description("Create a new mini app project")
  .option("-t, --template <template>", "Template to use (blank, todo)", "blank")
  .action(async (dir: string | undefined, options: { template?: string }) => {
    await runInit(dir || ".", options);
  });

// ── dev ───────────────────────────────────────────────────────────────
program
  .command("dev <directory>")
  .description("Start dev server with web preview and live reload")
  .option("-p, --port <port>", "Port number", "3000")
  .action(async (target: string, options: { port?: string }) => {
    await runDev(target, options);
  });

// ── validate ────────────────────────────────────────────────────────────
program
  .command("validate <directory>")
  .description("Validate a mini app project against all rules")
  .action(async (target: string) => {
    await runValidate(target);
  });

// ── bundle ──────────────────────────────────────────────────────────────
program
  .command("bundle <directory>")
  .description("Bundle a mini app project into an IIFE")
  .option("-o, --output <path>", "Output file path")
  .option("--bundle-id <id>", "Custom bundle ID (default: random UUID)")
  .action(async (target: string, options: { output?: string; bundleId?: string }) => {
    await runBundle(target, options);
  });

// ── codegen ─────────────────────────────────────────────────────────────
program
  .command("codegen <directory>")
  .description("Generate TypeScript types from schema.json")
  .action(async (target: string) => {
    await runCodegen(target);
  });

// ── submit ──────────────────────────────────────────────────────────────
program
  .command("submit <directory>")
  .description("Submit a mini app project to the Plotpaper platform")
  .option("-n, --name <name>", "App name (overrides manifest)")
  .option("-d, --description <desc>", "App description (overrides manifest)")
  .option("-m, --mode <mode>", "App mode: private or multiplayer (overrides manifest)")
  .action(async (target: string, options: { name?: string; description?: string; mode?: string }) => {
    await runSubmit(target, {
      name: options.name,
      description: options.description,
      mode: (options.mode as "private" | "multiplayer") || undefined,
    });
  });

// ── login ───────────────────────────────────────────────────────────────
program
  .command("login")
  .description("Log in with your Plotpaper email")
  .action(async () => {
    await runLogin();
  });

// ── config ──────────────────────────────────────────────────────────────
const configCmd = program
  .command("config")
  .description("Manage CLI configuration");

configCmd
  .command("set-key <key>")
  .description("Set your Plotpaper API key")
  .action((key: string) => {
    saveConfig({ apiKey: key });
    console.log("API key saved to ~/.plotpaper/config.json");
  });

program.parse();
