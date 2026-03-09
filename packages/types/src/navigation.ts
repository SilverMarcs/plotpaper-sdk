import type { SDKTheme } from "./theme";

// =============================================================================
// TabNavigator
// =============================================================================

export interface TabConfig {
  key: string;
  title: string;
  /** Feather icon name */
  icon: string;
  /** React component to render for this tab */
  screen: any;
  badge?: string | number;
}

export interface TabNavigatorProps {
  tabs: TabConfig[];
  theme: SDKTheme;
  initialTab?: string;
  showLabels?: boolean;
  sdk?: any;
}

export interface TabNavigation {
  navigate: (key: string) => void;
  currentTab: string;
}

// =============================================================================
// StackNavigator
// =============================================================================

export interface ScreenConfig {
  title: string;
  /** React component to render for this screen */
  screen: any;
}

export interface StackNavigatorProps {
  screens: Record<string, ScreenConfig>;
  initialScreen: string;
  theme: SDKTheme;
  showHeader?: boolean;
  sdk?: any;
}

export interface StackNavigation {
  push: (name: string, params?: Record<string, any>) => void;
  pop: () => void;
  popToRoot: () => void;
  canGoBack: () => boolean;
}

export interface StackRoute {
  name: string;
  params?: Record<string, any>;
}
