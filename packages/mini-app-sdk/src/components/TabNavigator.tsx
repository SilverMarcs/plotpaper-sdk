import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import type {
  SDKTheme,
  TabConfig,
  TabNavigatorProps,
  TabNavigation,
} from "../types";

export type { TabConfig, TabNavigatorProps, TabNavigation };

/**
 * Tab-based navigation component for mini apps.
 *
 * Each tab renders its `screen` component with `sdk` and `navigation` props.
 *
 * ```tsx
 * <TabNavigator
 *   tabs={[
 *     { key: "home", title: "Home", icon: "home", screen: HomeScreen },
 *     { key: "settings", title: "Settings", icon: "settings", screen: SettingsScreen },
 *   ]}
 *   theme={sdk.theme}
 *   sdk={sdk}
 * />
 * ```
 */
export default function TabNavigator({
  tabs,
  theme,
  initialTab,
  showLabels = true,
  sdk,
}: TabNavigatorProps) {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key || "");
  const colors = theme.colors;

  const navigation: TabNavigation = {
    navigate: (key: string) => setActiveTab(key),
    currentTab: activeTab,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.screenContainer}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            style={[
              styles.screen,
              { display: tab.key === activeTab ? "flex" : "none" },
            ]}
          >
            {React.createElement(tab.screen, { sdk, navigation })}
          </View>
        ))}
      </View>
      <View
        style={[
          styles.tabBar,
          {
            bottom: Platform.OS === "ios" ? 20 : 12,
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabButtonPressed,
              ]}
            >
              <View style={styles.tabIconContainer}>
                <Feather
                  name={tab.icon as any}
                  size={22}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
                {tab.badge != null && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.destructive },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {typeof tab.badge === "number" && tab.badge > 99
                        ? "99+"
                        : String(tab.badge)}
                    </Text>
                  </View>
                )}
              </View>
              {showLabels && (
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive
                        ? colors.primary
                        : colors.mutedForeground,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.title}
                </Text>
              )}
            </Pressable>
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
  screenContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    alignSelf: "center",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  tabIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
