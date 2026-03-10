import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { SDKProvider } from "../mini-app-sdk/context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.phone}>
          <SDKProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SDKProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
  },
});
