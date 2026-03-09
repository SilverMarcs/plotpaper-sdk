// =============================================================================
// init command — scaffold a new mini app project
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

export interface InitOptions {
  template?: string;
}

const BLANK_APP = `import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";

export default function App() {
  const sdk = usePlotpaperSDK();
  const colors = sdk.theme.colors;
  const [count, setCount] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        My Mini App
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => setCount((c) => c + 1)}
      >
        <Text style={{ color: colors.primaryForeground, fontSize: 16 }}>
          Count: {count}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});
`;

const BLANK_SCHEMA = `{
  "entities": [],
  "links": []
}
`;

const BLANK_PERMISSIONS = `[]
`;

const TODO_APP = `import React, { useState } from "react";
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
import Feather from "@expo/vector-icons/Feather";

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
          <Feather name="plus" size={22} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.todoRow, { borderBottomColor: colors.border }]}>
            <Pressable style={styles.checkbox} onPress={() => toggleTodo(item.id, item.done)}>
              <Feather
                name={item.done ? "check-circle" : "circle"}
                size={22}
                color={item.done ? colors.success : colors.mutedForeground}
              />
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
              <Feather name="trash-2" size={18} color={colors.destructive} />
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
`;

const TODO_SCHEMA = `{
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
`;

const TODO_PERMISSIONS = `[
  {
    "entity": "todos",
    "allow": {
      "view": "auth.id != null",
      "create": "auth.id != null",
      "update": "auth.id != null",
      "delete": "auth.id != null"
    }
  }
]
`;

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@plotpaper/mini-app-sdk": ["./node_modules/@plotpaper/mini-app-sdk"]
    }
  },
  "include": ["*.tsx", "*.ts"]
}
`;

interface TemplateConfig {
  app: string;
  schema: string;
  permissions: string;
  description: string;
}

const TEMPLATES: Record<string, TemplateConfig> = {
  blank: { app: BLANK_APP, schema: BLANK_SCHEMA, permissions: BLANK_PERMISSIONS, description: "Empty app with counter" },
  todo: { app: TODO_APP, schema: TODO_SCHEMA, permissions: TODO_PERMISSIONS, description: "Todo list with database" },
};

function makeManifest(name: string): string {
  const manifest: Record<string, unknown> = {
    name,
    entry: "App.tsx",
    sdkVersion: "0.1.0",
    mode: "private",
  };
  return JSON.stringify(manifest, null, 2) + "\n";
}

export async function runInit(dir: string, options: InitOptions): Promise<void> {
  const template = options.template || "blank";
  const tmpl = TEMPLATES[template];

  if (!tmpl) {
    console.error(chalk.red(`Unknown template: "${template}"`));
    console.error(chalk.dim(`Available templates: ${Object.keys(TEMPLATES).join(", ")}`));
    process.exit(1);
  }

  const targetDir = path.resolve(dir);

  // Check if directory already has files
  if (fs.existsSync(targetDir)) {
    const existing = fs.readdirSync(targetDir);
    const hasConflicts = existing.some((f) =>
      ["plotpaper.json", "App.tsx", "schema.json", "permissions.json", "tsconfig.json"].includes(f),
    );
    if (hasConflicts) {
      console.error(chalk.red(`\n  Directory already contains project files (plotpaper.json, App.tsx, etc.)`));
      console.error(chalk.dim(`  Choose a different directory or remove existing files.`));
      process.exit(1);
    }
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Derive project name from directory name
  const projectName = path.basename(targetDir);

  // Write files
  fs.writeFileSync(path.join(targetDir, "plotpaper.json"), makeManifest(projectName));
  fs.writeFileSync(path.join(targetDir, "App.tsx"), tmpl.app);
  fs.writeFileSync(path.join(targetDir, "schema.json"), tmpl.schema);
  fs.writeFileSync(path.join(targetDir, "permissions.json"), tmpl.permissions);
  fs.writeFileSync(path.join(targetDir, "tsconfig.json"), TSCONFIG);

  const relDir = path.relative(process.cwd(), targetDir) || ".";

  console.log();
  console.log(chalk.green.bold(`  ✓ Created mini app (${template} template)`));
  console.log();
  console.log(chalk.dim(`  ${relDir}/`));
  console.log(chalk.dim(`    plotpaper.json    — project manifest`));
  console.log(chalk.dim(`    App.tsx           — your mini app`));
  console.log(chalk.dim(`    schema.json       — database schema`));
  console.log(chalk.dim(`    permissions.json  — access permissions`));
  console.log(chalk.dim(`    tsconfig.json     — TypeScript config`));
  console.log();
  console.log(chalk.bold(`  Next steps:`));
  console.log(chalk.dim(`    plotpaper dev ${relDir}       — start dev server`));
  console.log(chalk.dim(`    plotpaper validate ${relDir}  — check for errors`));
  console.log(chalk.dim(`    plotpaper codegen ${relDir}   — generate types from schema`));
  console.log(chalk.dim(`    plotpaper bundle ${relDir}    — create bundle`));
  console.log(chalk.dim(`    plotpaper submit ${relDir}    — submit to Plotpaper`));
}
