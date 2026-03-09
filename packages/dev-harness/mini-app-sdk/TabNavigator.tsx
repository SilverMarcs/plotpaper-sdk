import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabConfig {
  key: string;
  title: string;
  icon: string;
  screen: React.ComponentType<any>;
  badge?: string | number;
}

interface TabNavigatorProps {
  tabs: TabConfig[];
  theme: { colors: Record<string, string> };
  initialTab?: string;
  showLabels?: boolean;
  sdk?: any;
}

export default function TabNavigator({
  tabs,
  theme,
  initialTab,
  showLabels = true,
  sdk,
}: TabNavigatorProps) {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key || "");
  const insets = useSafeAreaInsets();
  const colors = theme.colors;

  const navigation = {
    navigate: (key: string) => setActiveTab(key),
    currentTab: activeTab,
  };

  const tabBarBottom = Platform.OS === "ios" ? insets.bottom - 15 : insets.bottom + 5;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.screenContainer}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            style={[styles.screen, { display: tab.key === activeTab ? "flex" : "none" }]}
          >
            {React.createElement(tab.screen, { sdk, navigation })}
          </View>
        ))}
      </View>
      <View
        style={[
          styles.tabBar,
          {
            bottom: tabBarBottom,
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
              style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
            >
              <View style={styles.tabIconContainer}>
                <Feather
                  name={tab.icon as any}
                  size={22}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
                {tab.badge != null && (
                  <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
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
                    { color: isActive ? colors.primary : colors.mutedForeground },
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
  container: { flex: 1 },
  screenContainer: { flex: 1 },
  screen: { flex: 1 },
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
  tabButtonPressed: { opacity: 0.7 },
  tabLabel: { fontSize: 11, marginTop: 4 },
  tabIconContainer: { position: "relative" },
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
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
