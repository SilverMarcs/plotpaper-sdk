# Plotpaper SDK

Build, validate, and submit mini apps for the [Plotpaper](https://plotpaper.com) platform.

## Packages

| Package | Description |
|---------|-------------|
| [`@plotpaper/mini-app-sdk`](./packages/mini-app-sdk) | SDK hook, navigation components, and TypeScript types |
| [`@plotpaper/cli`](./packages/cli) | CLI for validating, bundling, and submitting apps |
| [`@plotpaper/dev-harness`](./packages/dev-harness) | Local Expo app for testing mini apps with hot reload |

## Quick Start

```bash
# Install the CLI
npm install -g @plotpaper/cli

# Create your app (App.tsx + schema.json + optional permissions.json)
# See examples/ for reference

# Validate
plotpaper validate ./my-app/App.tsx

# Bundle (for inspection)
plotpaper bundle ./my-app/App.tsx

# Submit to Plotpaper (uses your registered email)
plotpaper submit ./my-app/App.tsx --email you@example.com --name "My App"
```

## What is a Plotpaper Mini App?

A single-file React Native component that runs inside the Plotpaper platform. Each app gets:

- **Real-time database** — per-app InstantDB instance with live subscriptions
- **Theme system** — automatic light/dark mode with platform colors
- **AI capabilities** — text, structured data, and image generation
- **Feed actions** — surface updates on the user's home feed
- **Notifications** — schedule daily or one-time notifications
- **Multiplayer** — space-scoped data for shared app experiences

## Constraints

- Single file, single default export
- Max 50KB source code
- Only allowed imports: `react`, `react-native`, `@plotpaper/mini-app-sdk`, `@expo/vector-icons/Feather`, `react-native-svg`, `react-native-safe-area-context`
- No network requests (`fetch`, `XMLHttpRequest`)
- No native module access

See [Security Model](./docs/security-model.md) for full details.

## Local Development (Dev Harness)

Test your mini app locally with a real database and hot reload:

```bash
cd packages/dev-harness
npm install
```

1. Set your InstantDB app ID in `plotpaper.config.ts`
2. Copy your app code into `src/App.tsx`
3. Run `npm run web`

The dev harness provides:
- **Real database** — full InstantDB with live subscriptions
- **Theme toggle** — switch light/dark mode from the Dev Tools panel
- **Mock AI/credits/notifications** — test UI flows without burning credits
- **SDK call logging** — see every SDK call with timestamps

See [dev-harness README](./packages/dev-harness/README.md) for full details.

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

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT
