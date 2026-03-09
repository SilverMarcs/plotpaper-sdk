/** Current SDK version — attached to app submissions for compatibility tracking */
export const SDK_VERSION = "0.1.0";

/** Maximum source file size in bytes (50 KB) */
export const MAX_SOURCE_SIZE_BYTES = 50_000;

/** Maximum bundled output size in bytes (150 KB) */
export const MAX_BUNDLE_SIZE_BYTES = 150_000;

/** Modules always available to mini apps */
export const CORE_MODULES = [
  "react",
  "react-native",
  "@plotpaper/mini-app-sdk",
  "@expo/vector-icons/Feather",
  "react-native-svg",
  "react-native-safe-area-context",
];

/** Optional modules that must be declared in plotpaper.json */
export const OPTIONAL_MODULES = [
  "expo-haptics",
  "expo-clipboard",
  "expo-linear-gradient",
  "react-native-gesture-handler",
  "react-native-reanimated",
  "@expo/vector-icons/MaterialIcons",
  "@expo/vector-icons/Ionicons",
];
