// =============================================================================
// Dev Harness Main Screen
//
// Loads the developer's mini app component and wraps it with the SDK provider.
// Edit the import below to point to your app file.
// =============================================================================

import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
import DevToolbar from "../components/DevToolbar";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  EDIT THIS IMPORT to point to your mini app component                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
import UserApp from "../src/App";

export default function HarnessScreen() {
  const sdk = usePlotpaperSDK();
  const insets = useSafeAreaInsets();
  const colors = sdk.theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <UserApp />
      <DevToolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
