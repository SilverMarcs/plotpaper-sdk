import { createContext, useContext } from "react";
import type { PlotpaperSDK } from "./types";

/**
 * Internal context — never exposed directly to mini-app code.
 * The host app provides the real SDK instance via this context.
 */
export const PlotpaperSDKContext = createContext<PlotpaperSDK | null>(null);

/**
 * Access the Plotpaper SDK from within a mini app.
 *
 * Must be called inside a component rendered by the Plotpaper host.
 * Returns the full SDK interface with theme, database, AI, credits, etc.
 *
 * ```tsx
 * export default function MyApp() {
 *   const sdk = usePlotpaperSDK();
 *   const { theme, db, ai } = sdk;
 *   // ...
 * }
 * ```
 *
 * @throws If called outside the Plotpaper runtime environment
 */
export function usePlotpaperSDK(): PlotpaperSDK {
  const sdk = useContext(PlotpaperSDKContext);
  if (!sdk) {
    throw new Error(
      "usePlotpaperSDK() must be called inside a Plotpaper mini app. " +
        "If you're developing locally, wrap your app with the dev-harness provider."
    );
  }
  return sdk;
}
