// =============================================================================
// API Client for Plotpaper Platform
// =============================================================================

import https from "https";
import http from "http";

export interface SubmitPayload {
  apiKey: string;
  sourceCode: string;
  name: string;
  description: string;
  schema?: any;
  permissions?: any;
  appMode: "private" | "multiplayer";
}

export interface SubmitResult {
  appId: string;
  versionId?: string;
  creditsCharged?: number;
}

export async function submitApp(payload: SubmitPayload): Promise<SubmitResult> {
  const baseUrl = process.env.PLOTPAPER_API_URL || "https://vd9d2wo194.execute-api.ap-southeast-1.amazonaws.com/prod";
  // Ensure trailing slash so new URL() doesn't strip the stage prefix (e.g. /dev, /prod)
  const normalized = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  const url = new URL("api/custom-apps/submit", normalized);

  const { apiKey, ...bodyPayload } = payload;
  const body = JSON.stringify(bodyPayload);
  const isHttps = url.protocol === "https:";
  const httpModule = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = httpModule.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "X-API-Key": apiKey,
        },
      },
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
