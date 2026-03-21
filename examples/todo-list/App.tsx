import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
import { Plus, CheckCircle, Circle, Trash2 } from "lucide-react-native";

export default function TodoList() {
  const sdk = usePlotpaperSDK();
  const colors = sdk.theme.colors;
  const [text, setText] = useState("");

  const { isLoading, data } = sdk.db.useQuery({
    todos: { $: { order: { serverCreatedAt: "desc" } } },
  });
  const todos = data?.todos ?? [];

  const addTodo = () => {
    const title = text.trim();
    if (!title) return;
    sdk.db.transact(sdk.db.tx.todos[sdk.db.id()].update({ title, done: false }));
    setText("");

    // Update feed action
    const total = todos.length + 1;
    const completed = todos.filter((t: any) => t.done).length;
    sdk.setFeedAction({
      title: `${completed}/${total} tasks done`,
      icon: "📝",
    });
  };

  const toggleTodo = (id: string, done: boolean) => {
    sdk.db.transact(sdk.db.tx.todos[id].update({ done: !done }));
  };

  const deleteTodo = (id: string) => {
    sdk.db.transact(sdk.db.tx.todos[id].delete());
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          value={text}
          onChangeText={setText}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.mutedForeground}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addTodo}
        >
          <Plus size={22} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.todoRow, { borderBottomColor: colors.border }]}>
            <Pressable style={styles.checkbox} onPress={() => toggleTodo(item.id, item.done)}>
              {item.done ? (
                <CheckCircle size={22} color={colors.success} />
              ) : (
                <Circle size={22} color={colors.mutedForeground} />
              )}
            </Pressable>
            <Text
              style={[
                styles.todoText,
                {
                  color: item.done ? colors.mutedForeground : colors.foreground,
                  textDecorationLine: item.done ? "line-through" : "none",
                },
              ]}
            >
              {item.title}
            </Text>
            <Pressable onPress={() => deleteTodo(item.id)} hitSlop={8}>
              <Trash2 size={18} color={colors.destructive} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>No todos yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  addButton: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 32 },
  todoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  checkbox: { padding: 2 },
  todoText: { flex: 1, fontSize: 16 },
  empty: { paddingTop: 48, alignItems: "center" },
});
