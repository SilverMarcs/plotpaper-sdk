// =============================================================================
// login command — authenticate with Plotpaper using your signup email
// =============================================================================

import * as readline from "readline";
import chalk from "chalk";
import { saveConfig } from "../utils/config";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function runLogin(): Promise<void> {
  console.log();
  console.log(chalk.bold("  Log in to Plotpaper"));
  console.log(chalk.dim("  Enter the email you used to sign up.\n"));

  const email = await prompt("  Email: ");

  if (!email) {
    console.error(chalk.red("\n  No email provided."));
    process.exit(1);
  }

  // Basic email format check
  if (!email.includes("@") || !email.includes(".")) {
    console.error(chalk.red("\n  That doesn't look like a valid email."));
    process.exit(1);
  }

  saveConfig({ email });

  console.log(chalk.green.bold(`\n  ✓ Logged in as ${email}`));
  console.log(chalk.dim("  Email saved to ~/.plotpaper/config.json"));
}
