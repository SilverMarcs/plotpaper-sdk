import type { SDKTheme } from "./theme";

// =============================================================================
// TabNavigator
// =============================================================================

export interface TabConfig {
  key: string;
  title: string;
  /** Lucide icon component — e.g. `Home` from lucide-react-native */
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
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
  navigate: (name: string, params?: Record<string, any>) => void;
  push: (name: string, params?: Record<string, any>) => void;
  goBack: () => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  canGoBack: () => boolean;
  replace: (name: string, params?: Record<string, any>) => void;
  setParams: (params: Record<string, any>) => void;
}

export interface StackRoute {
  name: string;
  params?: Record<string, any>;
}
