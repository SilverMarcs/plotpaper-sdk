// =============================================================================
// CLI Configuration
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".plotpaper");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface PlotpaperConfig {
  email?: string;
  apiKey?: string;
  apiUrl?: string;
}

const DEFAULT_API_URL = "https://api.plotpaper.com";

export function loadConfig(): PlotpaperConfig & { apiUrl: string } {
  // Env vars take precedence
  const envKey = process.env.PLOTPAPER_API_KEY;
  const envUrl = process.env.PLOTPAPER_API_URL;
  const envEmail = process.env.PLOTPAPER_EMAIL;

  let fileConfig: PlotpaperConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } catch {
      // Ignore malformed config
    }
  }

  return {
    email: envEmail || fileConfig.email,
    apiKey: envKey || fileConfig.apiKey,
    apiUrl: envUrl || fileConfig.apiUrl || DEFAULT_API_URL,
  };
}

export function saveConfig(config: Partial<PlotpaperConfig>): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const existing = loadConfig();
  const merged = { ...existing, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
}
