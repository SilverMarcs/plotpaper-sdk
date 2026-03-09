# Getting Started

Build and submit mini apps for the Plotpaper platform.

## Install the CLI

```bash
npm install -g @plotpaper/cli
```

Or use npx without installing:

```bash
npx @plotpaper/cli validate ./MyApp.tsx
```

## Install types (optional, for TypeScript)

```bash
npm install -D @plotpaper/types
```

## Create your first app

Create a directory with two files:

```
my-todo/
├── App.tsx
└── schema.json
```

**schema.json:**
```json
{
  "entities": [
    {
      "name": "todos",
      "attrs": [
        { "name": "title", "valueType": "string" },
        { "name": "done", "valueType": "boolean" }
      ]
    }
  ]
}
```

**App.tsx:**
```tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";

export default function MyApp() {
  const sdk = usePlotpaperSDK();
  const colors = sdk.theme.colors;
  const [text, setText] = useState("");

  const { isLoading, data } = sdk.db.useQuery({ todos: {} });
  const todos = data?.todos ?? [];

  const addTodo = () => {
    if (!text.trim()) return;
    sdk.db.transact(sdk.db.tx.todos[sdk.db.id()].update({ title: text, done: false }));
    setText("");
  };

  const toggleTodo = (id: string, done: boolean) => {
    sdk.db.transact(sdk.db.tx.todos[id].update({ done: !done }));
  };

  if (isLoading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          value={text}
          onChangeText={setText}
          placeholder="Add a todo..."
          placeholderTextColor={colors.mutedForeground}
        />
        <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={addTodo}>
          <Text style={{ color: colors.primaryForeground, fontWeight: "600" }}>Add</Text>
        </Pressable>
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggleTodo(item.id, item.done)} style={styles.todoRow}>
            <Text style={{ color: item.done ? colors.mutedForeground : colors.foreground, textDecorationLine: item.done ? "line-through" : "none" }}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  button: { paddingHorizontal: 20, borderRadius: 8, justifyContent: "center" },
  todoRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ccc" },
});
```

## Validate your app

```bash
plotpaper-cli validate ./my-todo/App.tsx
```

The CLI auto-detects `schema.json` next to the source file. You can also pass it explicitly:

```bash
plotpaper-cli validate ./App.tsx --schema ./path/to/schema.json
```

This checks:
- Source size (< 50KB)
- Default export exists
- Only allowed imports are used
- No blocked patterns (fetch, eval, etc.)
- Schema is valid (from schema.json)

## Bundle your app

```bash
plotpaper-cli bundle ./my-todo/App.tsx
```

This produces a `App.bundle.js` IIFE that's compatible with the Plotpaper runtime. Useful for inspecting what the server would generate.

## Submit your app

First, set your API key:

```bash
plotpaper-cli config set-key <your-api-key>
```

Then submit:

```bash
plotpaper-cli submit ./my-todo/App.tsx --name "My Todo App" --description "A simple todo list"
```

## Next steps

- [SDK Reference](./sdk-reference.md) — full API documentation
- [Schema Guide](./schema-guide.md) — how to define your data model
- [Components](./components.md) — available React Native components
- [Navigation](./navigation.md) — TabNavigator and StackNavigator
- [Security Model](./security-model.md) — what's blocked and why
