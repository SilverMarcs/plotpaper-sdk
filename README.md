# Plotpaper SDK

Build, validate, and submit mini apps for the [Plotpaper](https://plotpaper.com) platform.

## Packages

| Package | Description |
|---------|-------------|
| [`@plotpaper/core`](./packages/core) | Shared validation rules, schema validators, manifest schema, and bundler utilities |
| [`@plotpaper/mini-app-sdk`](./packages/mini-app-sdk) | Runtime SDK — `usePlotpaperSDK()` hook, navigation components, types |
| [`@plotpaper/cli`](./packages/cli) | CLI for scaffolding, validating, bundling, and submitting apps |

## Quick Start

```bash
# Install the CLI
npm install -g @plotpaper/cli

# Scaffold a new mini app project
plotpaper init my-app --template todo

# Start dev mode (watch + validate + bundle on save)
plotpaper dev my-app

# Validate
plotpaper validate my-app

# Bundle
plotpaper bundle my-app

# Submit to Plotpaper
plotpaper login
plotpaper submit my-app
```

## Project Structure

Running `plotpaper init my-app` creates a multi-file project:

```
my-app/
  plotpaper.json    — project manifest
  App.tsx           — entry point (your mini app)
  schema.json       — database schema
  permissions.json  — access permissions
  tsconfig.json     — TypeScript config
```

### plotpaper.json

The project manifest configures your app:

```json
{
  "name": "my-app",
  "description": "An optional description",
  "entry": "App.tsx",
  "sdkVersion": "0.1.0",
  "mode": "private"
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | Yes | — | App name (1-100 chars) |
| `description` | No | — | Short description (max 500 chars) |
| `entry` | No | `App.tsx` | Entry file path |
| `sdkVersion` | No | Current SDK version | SDK version for compatibility |
| `mode` | No | `private` | `private` or `multiplayer` |

## What is a Plotpaper Mini App?

A React Native component project that runs inside the Plotpaper platform. Each app gets:

- **Real-time database** — per-app InstantDB instance with live subscriptions
- **Theme system** — automatic light/dark mode with platform colors
- **AI capabilities** — text, structured data, and image generation
- **Feed actions** — surface updates on the user's home feed
- **Notifications** — schedule daily or one-time notifications
- **Multiplayer** — space-scoped data for shared app experiences

## CLI Commands

| Command | Description |
|---------|-------------|
| `plotpaper init [dir]` | Scaffold a new mini app project (`--template blank\|todo`) |
| `plotpaper dev <path>` | Watch project directory or file with live validation and bundling |
| `plotpaper validate <path>` | Check project or source file against all rules |
| `plotpaper bundle <path>` | Compile project or source file to an IIFE bundle |
| `plotpaper submit <path>` | Submit project or file to the Plotpaper platform |
| `plotpaper login` | Authenticate with your Plotpaper email |
| `plotpaper config set-key <key>` | Set API key (alternative auth) |

All commands accept either a **project directory** (containing `plotpaper.json`) or a **single file** for backward compatibility.

## Writing a Mini App

```tsx
// App.tsx
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";

export default function App() {
  const sdk = usePlotpaperSDK();
  const colors = sdk.theme.colors;
  const [count, setCount] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.foreground, fontSize: 24 }}>
        Count: {count}
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => setCount((c) => c + 1)}
      >
        <Text style={{ color: colors.primaryForeground }}>Increment</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
});
```

## Multi-file Projects

With multi-file projects, you can split your app into multiple modules:

```
my-app/
  plotpaper.json
  App.tsx           — entry point
  components/
    Header.tsx
    TodoItem.tsx
  utils/
    helpers.ts
  schema.json
  permissions.json
  tsconfig.json
```

Relative imports between files are supported and bundled together by esbuild:

```tsx
// App.tsx
import Header from "./components/Header";
import { formatDate } from "./utils/helpers";
```

## Constraints

- Max 50KB source (entry file), 150KB bundle
- Allowed imports: `react`, `react-native`, `@plotpaper/mini-app-sdk`, `@expo/vector-icons/Feather`, `react-native-svg`, `react-native-safe-area-context`
- No network requests (`fetch`, `XMLHttpRequest`)
- No native module access

See [Security Model](./docs/security-model.md) for full details.

## Documentation

- [Getting Started](./docs/getting-started.md)
- [SDK Reference](./docs/sdk-reference.md)
- [Schema Guide](./docs/schema-guide.md)
- [Available Components](./docs/components.md)
- [Navigation](./docs/navigation.md)
- [Feed Actions](./docs/feed-actions.md)
- [AI Guide](./docs/ai-guide.md)
- [Multiplayer](./docs/multiplayer.md)
- [Security Model](./docs/security-model.md)

## Examples

- [Todo List](./examples/todo-list) — basic CRUD with database
- [Habit Tracker](./examples/habit-tracker) — feed actions, SVG progress ring
- [Quiz Game](./examples/quiz-game) — AI-generated content, credits
- [Multiplayer Poll](./examples/multiplayer-poll) — multiplayer, voting

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT
