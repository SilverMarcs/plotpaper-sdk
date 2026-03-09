// =============================================================================
// SDK Context — provides usePlotpaperSDK() to mini app components
// =============================================================================

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { Alert } from "react-native";
import { init, id as instantId } from "@instantdb/react-native";
import { lightTheme, darkTheme } from "./theme";
import config from "../plotpaper.config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MiniAppDB {
  useQuery: (query: any) => { isLoading: boolean; error: any; data: any };
  transact: (ops: any) => void;
  tx: any;
  id: () => string;
}

interface SDKTheme {
  mode: "light" | "dark";
  colors: Record<string, string>;
}

interface PlotpaperSDK {
  theme: SDKTheme;
  db: MiniAppDB;
  ai: {
    generateText: (options: { prompt: string; system?: string }) => Promise<{ text: string }>;
    generateObject: (options: { prompt: string; schema: any; system?: string }) => Promise<{ object: any }>;
    generateImage: (options: { prompt: string }) => Promise<{ url: string }>;
    generateImages: (options: { prompts: string[] }) => Promise<{ images: Array<{ url: string | null }> }>;
  };
  getAppInfo: () => Promise<any>;
  getUserInfo: () => Promise<any>;
  getTheme: () => Promise<any>;
  getSpaceInfo: () => Promise<any>;
  close: () => Promise<boolean>;
  showToast: (message: string) => Promise<boolean>;
  getCredits: () => Promise<{ available: number }>;
  consumeCredits: (amount: number, reason: string) => Promise<{ success: boolean; remaining: number }>;
  setFeedAction: (action: any) => Promise<boolean>;
  clearFeedAction: () => Promise<boolean>;
  getProfileById: (profileId: string) => Promise<any>;
  getSpaceMembers: () => Promise<any[]>;
  openProfile: (profileId: string) => Promise<boolean>;
  composeMessage: (options?: any) => Promise<boolean>;
  shareContext: (context: any) => Promise<any>;
  scheduleNotification: (notification: any) => Promise<boolean>;
  cancelNotification: (id: string) => Promise<boolean>;
  cancelAllNotifications: () => Promise<boolean>;
  getScheduledNotifications: () => Promise<any[]>;
  on: (event: string, callback: (...args: any[]) => void) => () => void;
}

// ---------------------------------------------------------------------------
// Null DB (when no InstantDB app ID is configured)
// ---------------------------------------------------------------------------

const nullDB: MiniAppDB = {
  useQuery: () => ({ isLoading: false, error: null, data: {} }),
  transact: () => {},
  tx: new Proxy(
    {},
    {
      get: () =>
        new Proxy(
          {},
          {
            get: () => () => ({}),
          }
        ),
    }
  ),
  id: () => Math.random().toString(36).slice(2) + Date.now().toString(36),
};

// ---------------------------------------------------------------------------
// Real DB (backed by InstantDB)
// ---------------------------------------------------------------------------

let cachedDb: ReturnType<typeof init> | null = null;

function getRealDB(): MiniAppDB {
  if (!config.instantdbAppId) return nullDB;

  if (!cachedDb) {
    cachedDb = init({ appId: config.instantdbAppId });
  }

  const rawDb = cachedDb;
  return {
    useQuery: (query: any) => rawDb.useQuery(query),
    transact: (ops: any) => rawDb.transact(ops),
    tx: rawDb.tx,
    id: () => instantId(),
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SDKContext = createContext<PlotpaperSDK | null>(null);

export function usePlotpaperSDK(): PlotpaperSDK {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error("usePlotpaperSDK must be used within SDKProvider");
  }
  return sdk;
}

// ---------------------------------------------------------------------------
// DevHarness context (for toolbar)
// ---------------------------------------------------------------------------

interface DevHarnessState {
  isDark: boolean;
  toggleDark: () => void;
  credits: number;
  feedAction: any | null;
  notifications: any[];
  logs: string[];
}

const DevHarnessContext = createContext<DevHarnessState | null>(null);

export function useDevHarness(): DevHarnessState {
  const ctx = useContext(DevHarnessContext);
  if (!ctx) throw new Error("useDevHarness must be used within SDKProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SDKProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [credits, setCredits] = useState(config.credits);
  const [feedAction, setFeedActionState] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    console.log(`[SDK] ${msg}`);
    setLogs((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 50));
  }, []);

  const db = useMemo(() => getRealDB(), []);

  const sdk = useMemo<PlotpaperSDK>(() => {
    const themeColors = isDark ? darkTheme : lightTheme;
    const theme: SDKTheme = {
      mode: isDark ? "dark" : "light",
      colors: themeColors,
    };

    return {
      theme,
      db,

      // Core
      getAppInfo: async () => {
        log("getAppInfo()");
        return { appId: config.app.appId, appName: config.app.appName, sdkVersion: 1 };
      },
      getUserInfo: async () => {
        log("getUserInfo()");
        return config.user;
      },
      getTheme: async () => {
        log("getTheme() [deprecated — use sdk.theme]");
        return theme;
      },
      getSpaceInfo: async () => {
        log("getSpaceInfo()");
        return { spaceId: "dev-space-001", spaceName: "Dev Space" };
      },
      close: async () => {
        log("close()");
        Alert.alert("close()", "App would close here");
        return true;
      },
      showToast: async (message: string) => {
        log(`showToast("${message}")`);
        Alert.alert("Toast", message);
        return true;
      },

      // Credits
      getCredits: async () => {
        log("getCredits()");
        return { available: credits };
      },
      consumeCredits: async (amount: number, reason: string) => {
        log(`consumeCredits(${amount}, "${reason}")`);
        const newBalance = Math.max(0, credits - amount);
        setCredits(newBalance);
        return { success: true, remaining: newBalance };
      },

      // Feed
      setFeedAction: async (action: any) => {
        log(`setFeedAction(${JSON.stringify(action).slice(0, 80)})`);
        setFeedActionState(action);
        return true;
      },
      clearFeedAction: async () => {
        log("clearFeedAction()");
        setFeedActionState(null);
        return true;
      },

      // Profiles
      getProfileById: async (profileId: string) => {
        log(`getProfileById("${profileId}")`);
        if (profileId === config.user.profileId) return config.user;
        return { profileId, displayName: `User ${profileId.slice(0, 6)}`, imageUrl: null };
      },
      getSpaceMembers: async () => {
        log("getSpaceMembers()");
        return [{ ...config.user, role: "admin" }];
      },
      openProfile: async (profileId: string) => {
        log(`openProfile("${profileId}")`);
        Alert.alert("openProfile", `Would open profile: ${profileId}`);
        return true;
      },

      // Messaging
      composeMessage: async (options?: any) => {
        log(`composeMessage(${JSON.stringify(options ?? {}).slice(0, 80)})`);
        Alert.alert("composeMessage", JSON.stringify(options, null, 2));
        return true;
      },
      shareContext: async (context: any) => {
        log(`shareContext(${JSON.stringify(context).slice(0, 80)})`);
        return {};
      },

      // Notifications
      scheduleNotification: async (notification: any) => {
        log(`scheduleNotification("${notification.id}")`);
        setNotifications((prev) => [...prev.filter((n) => n.id !== notification.id), notification]);
        return true;
      },
      cancelNotification: async (id: string) => {
        log(`cancelNotification("${id}")`);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        return true;
      },
      cancelAllNotifications: async () => {
        log("cancelAllNotifications()");
        setNotifications([]);
        return true;
      },
      getScheduledNotifications: async () => {
        log("getScheduledNotifications()");
        return notifications;
      },

      // AI (mock — returns placeholder content)
      ai: {
        generateText: async (options) => {
          log(`ai.generateText("${options.prompt.slice(0, 50)}...")`);
          return { text: `[Mock AI response for: ${options.prompt.slice(0, 100)}]` };
        },
        generateObject: async (options) => {
          log(`ai.generateObject("${options.prompt.slice(0, 50)}...")`);
          // Generate a minimal object matching the schema
          const obj = generateMockObject(options.schema);
          return { object: obj };
        },
        generateImage: async (options) => {
          log(`ai.generateImage("${options.prompt.slice(0, 50)}...")`);
          return { url: `https://placehold.co/400x400/333/fff?text=${encodeURIComponent(options.prompt.slice(0, 20))}` };
        },
        generateImages: async (options) => {
          log(`ai.generateImages(${options.prompts.length} prompts)`);
          return {
            images: options.prompts.map((p) => ({
              url: `https://placehold.co/400x400/333/fff?text=${encodeURIComponent(p.slice(0, 20))}`,
            })),
          };
        },
      },

      // Events
      on: (_event: string, _callback: (...args: any[]) => void) => {
        return () => {};
      },
    };
  }, [isDark, db, credits, feedAction, notifications, log]);

  const devState = useMemo<DevHarnessState>(
    () => ({
      isDark,
      toggleDark: () => setIsDark((d) => !d),
      credits,
      feedAction,
      notifications,
      logs,
    }),
    [isDark, credits, feedAction, notifications, logs]
  );

  return (
    <DevHarnessContext.Provider value={devState}>
      <SDKContext.Provider value={sdk}>{children}</SDKContext.Provider>
    </DevHarnessContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Mock object generator for ai.generateObject
// ---------------------------------------------------------------------------

function generateMockObject(schema: any): any {
  if (!schema || !schema.type) return {};

  switch (schema.type) {
    case "object": {
      const obj: any = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          obj[key] = generateMockObject(propSchema as any);
        }
      }
      return obj;
    }
    case "array":
      return [generateMockObject(schema.items)];
    case "string":
      return "mock value";
    case "number":
      return 42;
    case "boolean":
      return true;
    default:
      return null;
  }
}
