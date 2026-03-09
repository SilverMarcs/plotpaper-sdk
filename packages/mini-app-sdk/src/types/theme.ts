/** Color tokens exposed to mini-apps via sdk.theme */
export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  destructive: string;
  success: string;
  warning: string;
  info: string;
}

/** Synchronous theme object available as sdk.theme */
export interface SDKTheme {
  mode: "light" | "dark";
  colors: ThemeColors;
}
