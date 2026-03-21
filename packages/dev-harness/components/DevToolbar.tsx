// =============================================================================
// Dev Toolbar — floating controls for theme toggle, credits, feed action preview
// =============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Wrench, X, Sun, Moon } from "lucide-react-native";
import { useDevHarness } from "../mini-app-sdk/context";

export default function DevToolbar() {
  const { isDark, toggleDark, credits, feedAction, notifications, logs } = useDevHarness();
  const [showPanel, setShowPanel] = useState(false);

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#000000";
  const border = isDark ? "#333" : "#ddd";
  const muted = isDark ? "#888" : "#666";

  return (
    <>
      {/* Floating toolbar button */}
      <Pressable
        style={[styles.fab, { backgroundColor: isDark ? "#333" : "#eee", borderColor: border }]}
        onPress={() => setShowPanel(true)}
      >
        <Wrench size={18} color={fg} />
      </Pressable>

      {/* Panel modal */}
      <Modal visible={showPanel} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.panel, { backgroundColor: bg }]}>
          <View style={[styles.panelHeader, { borderBottomColor: border }]}>
            <Text style={[styles.panelTitle, { color: fg }]}>Dev Tools</Text>
            <Pressable onPress={() => setShowPanel(false)}>
              <X size={24} color={fg} />
            </Pressable>
          </View>

          <ScrollView style={styles.panelBody} contentContainerStyle={styles.panelContent}>
            {/* Theme toggle */}
            <View style={[styles.section, { borderBottomColor: border }]}>
              <Text style={[styles.sectionTitle, { color: fg }]}>Theme</Text>
              <Pressable style={[styles.button, { backgroundColor: isDark ? "#444" : "#f0f0f0" }]} onPress={toggleDark}>
                {isDark ? <Sun size={16} color={fg} /> : <Moon size={16} color={fg} />}
                <Text style={{ color: fg, marginLeft: 8 }}>
                  {isDark ? "Switch to Light" : "Switch to Dark"}
                </Text>
              </Pressable>
            </View>

            {/* Credits */}
            <View style={[styles.section, { borderBottomColor: border }]}>
              <Text style={[styles.sectionTitle, { color: fg }]}>Credits</Text>
              <Text style={[styles.value, { color: fg }]}>{credits.toLocaleString()}</Text>
            </View>

            {/* Feed Action */}
            <View style={[styles.section, { borderBottomColor: border }]}>
              <Text style={[styles.sectionTitle, { color: fg }]}>Feed Action</Text>
              {feedAction ? (
                <View style={[styles.feedCard, { backgroundColor: isDark ? "#222" : "#f8f8f8", borderColor: border }]}>
                  <Text style={[styles.feedTitle, { color: fg }]}>
                    {feedAction.icon ? `${feedAction.icon} ` : ""}{feedAction.title}
                  </Text>
                  {feedAction.body && (
                    <Text style={{ color: muted, marginTop: 4 }}>{feedAction.body}</Text>
                  )}
                  {feedAction.buttons && (
                    <View style={styles.feedButtons}>
                      {feedAction.buttons.map((btn: any, i: number) => (
                        <View key={i} style={[styles.feedBtn, { borderColor: border }]}>
                          <Text style={{ color: fg, fontSize: 12 }}>{btn.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <Text style={{ color: muted }}>No feed action set</Text>
              )}
            </View>

            {/* Notifications */}
            <View style={[styles.section, { borderBottomColor: border }]}>
              <Text style={[styles.sectionTitle, { color: fg }]}>
                Notifications ({notifications.length})
              </Text>
              {notifications.map((n: any, i: number) => (
                <View key={i} style={{ marginTop: 4 }}>
                  <Text style={{ color: fg, fontWeight: "500" }}>{n.title}</Text>
                  <Text style={{ color: muted, fontSize: 12 }}>{n.body}</Text>
                </View>
              ))}
              {notifications.length === 0 && (
                <Text style={{ color: muted }}>No scheduled notifications</Text>
              )}
            </View>

            {/* SDK Logs */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: fg }]}>SDK Logs</Text>
              {logs.slice(0, 20).map((entry, i) => (
                <Text key={i} style={{ color: muted, fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>
                  {entry}
                </Text>
              ))}
              {logs.length === 0 && (
                <Text style={{ color: muted }}>No SDK calls yet</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    zIndex: 1000,
    opacity: 0.8,
  },
  panel: { flex: 1 },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  panelTitle: { fontSize: 20, fontWeight: "700" },
  panelBody: { flex: 1 },
  panelContent: { padding: 16 },
  section: { paddingBottom: 16, marginBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 28, fontWeight: "700" },
  button: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  feedCard: { padding: 12, borderRadius: 10, borderWidth: 1 },
  feedTitle: { fontSize: 16, fontWeight: "600" },
  feedButtons: { flexDirection: "row", gap: 8, marginTop: 8 },
  feedBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
});
