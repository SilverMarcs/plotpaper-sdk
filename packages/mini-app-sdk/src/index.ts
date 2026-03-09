// =============================================================================
// @plotpaper/mini-app-sdk
//
// The public SDK package for building Plotpaper mini apps.
// Provides the usePlotpaperSDK() hook, navigation components, and all types.
// =============================================================================

// --- Hook ---
export { usePlotpaperSDK, PlotpaperSDKContext } from "./usePlotpaperSDK";

// --- Navigation components ---
export { default as TabNavigator } from "./components/TabNavigator";
export { default as StackNavigator } from "./components/StackNavigator";

// --- Types ---
export type {
  // Theme
  ThemeColors,
  SDKTheme,

  // SDK interface
  PlotpaperSDK,
  MiniAppDB,
  QueryResult,
  PlotpaperAI,
  AIGenerateTextOptions,
  AIGenerateObjectOptions,
  AIGenerateImageOptions,
  AIGenerateImagesOptions,

  // Feed
  FeedAction,
  FeedActionButton,

  // Notifications
  NotificationTrigger,

  // Navigation
  TabConfig,
  TabNavigatorProps,
  TabNavigation,
  ScreenConfig,
  StackNavigatorProps,
  StackNavigation,
  StackRoute,

  // Schema
  SchemaValueType,
  SchemaAttribute,
  SchemaEntity,
  SchemaLinkSide,
  SchemaLink,
  MiniAppSchema,
  EntityPermissions,
  MiniAppPermissions,
  SchemaInput,
  SchemaEntityInput,
  SchemaAttributeInput,
  SchemaLinkInput,
  PermissionInput,
} from "./types";
