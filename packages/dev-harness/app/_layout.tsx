import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { SDKProvider } from "../mini-app-sdk/context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SDKProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SDKProvider>
    </SafeAreaProvider>
  );
}
