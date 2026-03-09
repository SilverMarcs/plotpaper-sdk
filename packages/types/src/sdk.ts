import type { SDKTheme } from "./theme";
import type { FeedAction } from "./feed";
import type { NotificationTrigger } from "./notifications";

// =============================================================================
// Database
// =============================================================================

export interface QueryResult {
  isLoading: boolean;
  error: any;
  data: any;
}

/** Per-app InstantDB instance exposed as sdk.db */
export interface MiniAppDB {
  /** Real-time query hook — re-renders automatically when data changes */
  useQuery: (query: any) => QueryResult;
  /** Execute one or more transact operations */
  transact: (ops: any) => void;
  /** Transaction builder (e.g. sdk.db.tx.todos[id].update({...})) */
  tx: any;
  /** Generate a unique ID for new records */
  id: () => string;
}

// =============================================================================
// AI
// =============================================================================

export interface AIGenerateTextOptions {
  prompt: string;
  system?: string;
}

export interface AIGenerateObjectOptions {
  prompt: string;
  /** JSON Schema describing the expected output */
  schema: object;
  system?: string;
}

export interface AIGenerateImageOptions {
  prompt: string;
}

export interface AIGenerateImagesOptions {
  /** Array of prompts (max 5) */
  prompts: string[];
}

export interface PlotpaperAI {
  generateText: (options: AIGenerateTextOptions) => Promise<{ text: string }>;
  generateObject: (options: AIGenerateObjectOptions) => Promise<{ object: any }>;
  generateImage: (options: AIGenerateImageOptions) => Promise<{ url: string }>;
  generateImages: (options: AIGenerateImagesOptions) => Promise<{ images: Array<{ url: string | null }> }>;
}

// =============================================================================
// Main SDK Interface
// =============================================================================

export interface PlotpaperSDK {
  /** Synchronous theme — auto-updates on dark mode toggle */
  theme: SDKTheme;

  /** Per-app real-time database (null if no schema provisioned) */
  db: MiniAppDB;

  /** AI generation capabilities */
  ai: PlotpaperAI;

  // Core
  getAppInfo: () => Promise<{ appId: string; appName: string; sdkVersion: number }>;
  getUserInfo: () => Promise<{ displayName: string; imageUrl: string | null; profileId: string }>;
  getSpaceInfo: () => Promise<{ spaceId: string; spaceName: string }>;
  close: () => Promise<boolean>;
  showToast: (message: string) => Promise<boolean>;

  // Credits
  getCredits: () => Promise<{ available: number }>;
  consumeCredits: (amount: number, reason: string) => Promise<{ success: boolean; remaining: number }>;

  // Feed
  setFeedAction: (action: FeedAction) => Promise<boolean>;
  clearFeedAction: () => Promise<boolean>;

  // User profiles
  getProfileById: (profileId: string) => Promise<{ profileId: string; displayName: string; imageUrl: string | null } | null>;
  getSpaceMembers: () => Promise<Array<{ profileId: string; displayName: string; imageUrl: string | null; role: string }>>;
  openProfile: (profileId: string) => Promise<boolean>;

  // Messaging
  composeMessage: (options?: any) => Promise<boolean>;
  shareContext: (context: any) => Promise<any>;

  // Notifications
  scheduleNotification: (notification: { id: string; title: string; body: string; trigger: NotificationTrigger; data?: Record<string, any> }) => Promise<boolean>;
  cancelNotification: (id: string) => Promise<boolean>;
  cancelAllNotifications: () => Promise<boolean>;
  getScheduledNotifications: () => Promise<Array<{ id: string; title: string; body: string }>>;

  // Events
  on: (event: string, callback: (...args: any[]) => void) => () => void;
}
