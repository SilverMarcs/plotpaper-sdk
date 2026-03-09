import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
import Feather from "@expo/vector-icons/Feather";
import Svg, { Circle } from "react-native-svg";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"];

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitTracker() {
  const sdk = usePlotpaperSDK();
  const colors = sdk.theme.colors;
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const today = getTodayStr();

  const { isLoading: habitsLoading, data: habitsData } = sdk.db.useQuery({ habits: {} });
  const { isLoading: compLoading, data: compData } = sdk.db.useQuery({
    completions: { $: { where: { date: today } } },
  });

  const habits = habitsData?.habits ?? [];
  const completions = compData?.completions ?? [];

  const todayCompletedIds = new Set(completions.map((c: any) => c.habitId));
  const completedCount = todayCompletedIds.size;
  const totalCount = habits.length;

  // Update feed action when completions change
  useEffect(() => {
    if (totalCount > 0) {
      sdk.setFeedAction({
        title: `${completedCount}/${totalCount} habits done today`,
        body: completedCount === totalCount ? "All done! Great job!" : "Keep going!",
        icon: completedCount === totalCount ? "🎉" : "💪",
      });
    }
  }, [completedCount, totalCount]);

  const addHabit = () => {
    const name = newName.trim();
    if (!name) return;
    sdk.db.transact(sdk.db.tx.habits[sdk.db.id()].update({ name, icon: "check", color: selectedColor }));
    setNewName("");
    setShowAdd(false);
  };

  const toggleHabit = (habitId: string) => {
    if (todayCompletedIds.has(habitId)) {
      const comp = completions.find((c: any) => c.habitId === habitId);
      if (comp) sdk.db.transact(sdk.db.tx.completions[comp.id].delete());
    } else {
      sdk.db.transact(sdk.db.tx.completions[sdk.db.id()].update({ habitId, date: today }));
    }
  };

  const deleteHabit = (id: string) => {
    Alert.alert("Delete Habit", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => sdk.db.transact(sdk.db.tx.habits[id].delete()) },
    ]);
  };

  if (habitsLoading || compLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const circumference = 2 * Math.PI * 45;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Progress Ring */}
      <View style={styles.progressContainer}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          <Circle cx={60} cy={60} r={45} fill="none" stroke={colors.muted} strokeWidth={10} />
          <Circle
            cx={60} cy={60} r={45} fill="none"
            stroke={colors.primary} strokeWidth={10}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </Svg>
        <View style={styles.progressText}>
          <Text style={[styles.progressNumber, { color: colors.foreground }]}>{completedCount}/{totalCount}</Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>today</Text>
        </View>
      </View>

      {/* Habits List */}
      {habits.map((habit: any) => {
        const done = todayCompletedIds.has(habit.id);
        return (
          <Pressable
            key={habit.id}
            style={[styles.habitRow, { backgroundColor: colors.card, borderColor: done ? habit.color : colors.border }]}
            onPress={() => toggleHabit(habit.id)}
            onLongPress={() => deleteHabit(habit.id)}
          >
            <View style={[styles.habitDot, { backgroundColor: habit.color, opacity: done ? 1 : 0.3 }]} />
            <Text style={[styles.habitName, { color: done ? colors.foreground : colors.mutedForeground }]}>
              {habit.name}
            </Text>
            {done && <Feather name="check" size={20} color={habit.color} />}
          </Pressable>
        );
      })}

      {/* Add Habit */}
      {showAdd ? (
        <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.addInput, { color: colors.foreground, borderColor: colors.border }]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Habit name..."
            placeholderTextColor={colors.mutedForeground}
            autoFocus
          />
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <Pressable
                key={c}
                style={[styles.colorDot, { backgroundColor: c, borderWidth: c === selectedColor ? 2 : 0, borderColor: colors.foreground }]}
                onPress={() => setSelectedColor(c)}
              />
            ))}
          </View>
          <View style={styles.addActions}>
            <Pressable onPress={() => setShowAdd(false)}>
              <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={addHabit}>
              <Text style={{ color: colors.primaryForeground, fontWeight: "600" }}>Add Habit</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={[styles.addBtn, { borderColor: colors.border }]} onPress={() => setShowAdd(true)}>
          <Feather name="plus" size={20} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground }}>Add habit</Text>
        </Pressable>
      )}

      {habits.length > 0 && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Long press a habit to delete it</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  progressContainer: { alignItems: "center", marginBottom: 24, position: "relative" },
  progressText: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  progressNumber: { fontSize: 24, fontWeight: "700" },
  habitRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  habitDot: { width: 12, height: 12, borderRadius: 6 },
  habitName: { flex: 1, fontSize: 16, fontWeight: "500" },
  addForm: { padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 8, gap: 12 },
  addInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  colorRow: { flexDirection: "row", gap: 8 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  addActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", marginTop: 8 },
  hint: { textAlign: "center", fontSize: 12, marginTop: 16 },
});
