// =============================================================================
// Plotpaper CLI — validate, bundle, and submit mini apps
// =============================================================================

import { Command } from "commander";
import { runValidate } from "./commands/validate";
import { runBundle } from "./commands/bundle";
import { runSubmit } from "./commands/submit";

const program = new Command();

program
  .name("plotpaper")
  .description("CLI for building and submitting Plotpaper mini apps")
  .version("0.2.3");

// ── validate ────────────────────────────────────────────────────────────
program
  .command("validate <file>")
  .description("Validate a mini app source file against all rules")
  .option("-s, --schema <path>", "Path to schema.json file")
  .action(async (file: string, options: { schema?: string }) => {
    await runValidate(file, options);
  });

// ── bundle ──────────────────────────────────────────────────────────────
program
  .command("bundle <file>")
  .description("Bundle a mini app source file into an IIFE")
  .option("-o, --output <path>", "Output file path (default: <file>.bundle.js)")
  .option("--bundle-id <id>", "Custom bundle ID (default: random UUID)")
  .option("-s, --schema <path>", "Path to schema.json file")
  .action(async (file: string, options: { output?: string; bundleId?: string; schema?: string }) => {
    await runBundle(file, options);
  });

// ── submit ──────────────────────────────────────────────────────────────
program
  .command("submit <file>")
  .description("Submit a mini app to the Plotpaper platform")
  .requiredOption("-e, --email <email>", "Your registered Plotpaper email")
  .option("-n, --name <name>", "App name (default: filename)")
  .option("-d, --description <desc>", "App description")
  .option("-m, --mode <mode>", "App mode: private or multiplayer", "private")
  .option("-s, --schema <path>", "Path to schema.json file")
  .action(async (file: string, options: { email: string; name?: string; description?: string; mode?: string; schema?: string }) => {
    await runSubmit(file, {
      email: options.email,
      name: options.name,
      description: options.description,
      mode: (options.mode as "private" | "multiplayer") || "private",
      schema: options.schema,
    });
  });

program.parse();
