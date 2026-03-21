import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";

interface ScreenConfig {
  title: string;
  screen: React.ComponentType<any>;
}

interface StackNavigatorProps {
  screens: Record<string, ScreenConfig>;
  initialScreen: string;
  theme: { colors: Record<string, string> };
  showHeader?: boolean;
  sdk?: any;
}

interface StackEntry {
  name: string;
  params?: Record<string, any>;
}

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

  const navigate = useCallback((name: string, params?: Record<string, any>) => {
    setStack((prev) => {
      const idx = prev.findIndex((e) => e.name === name);
      if (idx >= 0) {
        const sliced = prev.slice(0, idx + 1);
        sliced[idx] = { name, params: params ?? sliced[idx].params };
        return sliced;
      }
      return [...prev, { name, params }];
    });
  }, []);

  const push = useCallback((name: string, params?: Record<string, any>) => {
    setStack((prev) => [...prev, { name, params }]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const pop = useCallback((count: number = 1) => {
    setStack((prev) => {
      const next = prev.slice(0, Math.max(1, prev.length - count));
      return next.length === prev.length ? prev : next;
    });
  }, []);

  const popToTop = useCallback(() => {
    setStack((prev) => [prev[0]]);
  }, []);

  const canGoBack = useCallback(() => stack.length > 1, [stack.length]);

  const replace = useCallback((name: string, params?: Record<string, any>) => {
    setStack((prev) => [...prev.slice(0, -1), { name, params }]);
  }, []);

  const setParams = useCallback((params: Record<string, any>) => {
    setStack((prev) => {
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, params: { ...last.params, ...params } }];
    });
  }, []);

  const navigation = useMemo(
    () => ({ navigate, push, goBack, pop, popToTop, canGoBack, replace, setParams }),
    [navigate, push, goBack, pop, popToTop, canGoBack, replace, setParams],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          {stack.length > 1 ? (
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
              onPress={goBack}
            >
              <ArrowLeft size={22} color={colors.primary} />
            </Pressable>
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
          const entryConfig = screens[entry.name];
          if (!entryConfig) return null;
          const isTop = index === stack.length - 1;
          const route = { name: entry.name, params: entry.params };
          return (
            <View
              key={`${entry.name}-${index}`}
              style={[styles.screen, { display: isTop ? "flex" : "none" }]}
            >
              {React.createElement(entryConfig.screen, { sdk, navigation, route })}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  backPlaceholder: { width: 44 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  screenContainer: { flex: 1 },
  screen: { flex: 1 },
});
