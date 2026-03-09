// =============================================================================
// Plotpaper CLI — validate, bundle, and submit mini apps
// =============================================================================

import { Command } from "commander";
import { runValidate } from "./commands/validate";
import { runBundle } from "./commands/bundle";
import { runSubmit } from "./commands/submit";
import { runInit } from "./commands/init";
import { runDev } from "./commands/dev";
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
  .command("dev <path>")
  .description("Watch a mini app project or file with live validation and bundling")
  .option("-s, --schema <path>", "Path to schema.json file")
  .option("-o, --output <path>", "Output bundle path")
  .action(async (target: string, options: { schema?: string; output?: string }) => {
    await runDev(target, options);
  });

// ── validate ────────────────────────────────────────────────────────────
program
  .command("validate <path>")
  .description("Validate a mini app project or source file against all rules")
  .option("-s, --schema <path>", "Path to schema.json file")
  .action(async (target: string, options: { schema?: string }) => {
    await runValidate(target, options);
  });

// ── bundle ──────────────────────────────────────────────────────────────
program
  .command("bundle <path>")
  .description("Bundle a mini app project or source file into an IIFE")
  .option("-o, --output <path>", "Output file path")
  .option("--bundle-id <id>", "Custom bundle ID (default: random UUID)")
  .option("-s, --schema <path>", "Path to schema.json file")
  .action(async (target: string, options: { output?: string; bundleId?: string; schema?: string }) => {
    await runBundle(target, options);
  });

// ── submit ──────────────────────────────────────────────────────────────
program
  .command("submit <path>")
  .description("Submit a mini app project or file to the Plotpaper platform")
  .option("-n, --name <name>", "App name (overrides manifest)")
  .option("-d, --description <desc>", "App description (overrides manifest)")
  .option("-m, --mode <mode>", "App mode: private or multiplayer (overrides manifest)")
  .option("-s, --schema <path>", "Path to schema.json file")
  .action(async (target: string, options: { name?: string; description?: string; mode?: string; schema?: string }) => {
    await runSubmit(target, {
      name: options.name,
      description: options.description,
      mode: (options.mode as "private" | "multiplayer") || undefined,
      schema: options.schema,
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
