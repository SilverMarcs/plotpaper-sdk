// =============================================================================
// API Client for Plotpaper Platform
// =============================================================================

import https from "https";
import http from "http";
import { SDK_VERSION } from "@plotpaper/core";

export interface SubmitPayload {
  sourceCode: string;
  name: string;
  description: string;
  schema?: any;
  permissions?: any;
  appMode: "private" | "multiplayer";
  sdkVersion: string;
}

export interface SubmitResult {
  appId: string;
  versionId?: string;
}

export interface SubmitAuth {
  email?: string;
  apiKey?: string;
}

export async function submitApp(auth: SubmitAuth, payload: SubmitPayload): Promise<SubmitResult> {
  const apiUrl = process.env.PLOTPAPER_API_URL || "https://api.plotpaper.com";
  const url = new URL("/api/custom-apps/submit", apiUrl);

  const body = JSON.stringify(payload);
  const isHttps = url.protocol === "https:";
  const httpModule = isHttps ? https : http;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Content-Length": String(Buffer.byteLength(body)),
    "X-SDK-Version": SDK_VERSION,
  };

  if (auth.apiKey) {
    headers["Authorization"] = `Bearer ${auth.apiKey}`;
  } else if (auth.email) {
    headers["X-Plotpaper-Email"] = auth.email;
  }

  return new Promise((resolve, reject) => {
    const req = httpModule.request(
      url,
      { method: "POST", headers },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error("Invalid response from server"));
            }
          } else {
            let message = `Server returned ${res.statusCode}`;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) message = parsed.error;
            } catch {
              // Use status code message
            }
            reject(new Error(message));
          }
        });
      },
    );

    req.on("error", (err) => reject(new Error(`Network error: ${err.message}`)));
    req.write(body);
    req.end();
  });
}
