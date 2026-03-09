import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type {
  SDKTheme,
  ScreenConfig,
  StackNavigatorProps,
  StackNavigation,
  StackRoute,
} from "../types";

export type { ScreenConfig, StackNavigatorProps, StackNavigation, StackRoute };

interface StackEntry {
  name: string;
  params?: Record<string, any>;
}

/**
 * Stack-based navigation component for mini apps.
 *
 * Each screen receives `sdk`, `navigation`, and `route` props.
 *
 * ```tsx
 * <StackNavigator
 *   screens={{
 *     list: { title: "Items", screen: ListScreen },
 *     detail: { title: "Detail", screen: DetailScreen },
 *   }}
 *   initialScreen="list"
 *   theme={sdk.theme}
 *   sdk={sdk}
 * />
 * ```
 */
export default function StackNavigator({
  screens,
  initialScreen,
  theme,
  showHeader = true,
  sdk,
}: StackNavigatorProps) {
  const [stack, setStack] = useState<StackEntry[]>([{ name: initialScreen }]);
  const colors = theme.colors;

  const currentEntry = stack[stack.length - 1];
  const currentConfig = screens[currentEntry.name];

  const push = useCallback(
    (name: string, params?: Record<string, any>) => {
      setStack((prev) => [...prev, { name, params }]);
    },
    []
  );

  const pop = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const popToRoot = useCallback(() => {
    setStack((prev) => [prev[0]]);
  }, []);

  const canGoBack = useCallback(() => stack.length > 1, [stack.length]);

  const navigation: StackNavigation = { push, pop, popToRoot, canGoBack };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {stack.length > 1 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={pop}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.primary, fontSize: 22 }}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <Text
            style={[styles.headerTitle, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {currentConfig?.title || currentEntry.name}
          </Text>
          <View style={styles.backPlaceholder} />
        </View>
      )}
      <View style={styles.screenContainer}>
        {stack.map((entry, index) => {
          const config = screens[entry.name];
          if (!config) return null;
          const isTop = index === stack.length - 1;
          const route: StackRoute = { name: entry.name, params: entry.params };
          return (
            <View
              key={`${entry.name}-${index}`}
              style={[styles.screen, { display: isTop ? "flex" : "none" }]}
            >
              {React.createElement(config.screen, { sdk, navigation, route })}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: {
    width: 44,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  screenContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
