# Plotpaper Open Source SDK — Implementation Plan

## Overview

`plotpaper-sdk` — an open-source monorepo that lets developers build, test, and submit Plotpaper mini apps outside the main app. Contains SDK type definitions, a CLI for validation/bundling/submission, example apps, and documentation.

## Package Structure

```
plotpaper-sdk/
├── packages/
│   ├── types/                  # @plotpaper/types — SDK type definitions
│   ├── cli/                    # @plotpaper/cli — validate, bundle & submit tool
│   └── dev-harness/            # @plotpaper/dev-harness — local Expo testing app (future)
├── examples/                   # Example mini apps
├── docs/                       # Developer documentation
├── LICENSE                     # MIT
├── README.md
└── package.json                # Monorepo root (npm workspaces)
```

---

## Package 1: `@plotpaper/types`

**Purpose:** Publishable TypeScript types for autocomplete and type checking.

**Extract from codebase:**

| Type/Interface | Source |
|---|---|
| `PlotpaperSDK` (full interface) | `native-sdk.tsx` |
| `SDKTheme`, `ThemeColors` | `protocol.ts` |
| `MiniAppDB` (useQuery, transact, tx, id) | `native-sdk.tsx` |
| `TabNavigatorProps`, `TabConfig`, `TabNavigation` | `TabNavigator.tsx` |
| `StackNavigatorProps`, `ScreenConfig`, `StackNavigation`, `StackRoute` | `StackNavigator.tsx` |
| `FeedAction`, `FeedActionButton` | `protocol.ts` |
| `NotificationTrigger` | `protocol.ts` |
| `MiniAppSchema` (entity/link/permission format) | `types.ts` + `provisioning.ts` |

**File structure:**

```
packages/types/
├── src/
│   ├── index.ts              # Re-exports everything
│   ├── sdk.ts                # PlotpaperSDK, MiniAppDB, AI interface
│   ├── theme.ts              # SDKTheme, ThemeColors
│   ├── navigation.ts         # TabNavigator/StackNavigator props & types
│   ├── feed.ts               # FeedAction, FeedActionButton
│   ├── notifications.ts      # NotificationTrigger
│   └── schema.ts             # MiniAppSchema, MiniAppPermissions
├── package.json
├── tsconfig.json
└── README.md
```

- Types-only package, no runtime code, no dependencies
- Install: `npm install @plotpaper/types --save-dev`
- Usage: `import type { PlotpaperSDK } from "@plotpaper/types"`

---

## Package 2: `@plotpaper/cli`

**Purpose:** Local validation, bundling, and remote submission of mini apps.

### Commands

#### `npx @plotpaper/cli validate ./MyApp.tsx`

Runs all checks from `validation.ts` locally:

1. **Size check** — source < 50KB
2. **Default export check** — must have `export default`
3. **Allowed imports** — only: `react`, `react-native`, `@plotpaper/mini-app-sdk`, `@expo/vector-icons/Feather`, `react-native-svg`, `react-native-safe-area-context`
4. **Blocked patterns** (15 patterns):
   - `fetch`, `XMLHttpRequest`, `eval`, `Function(`, `AsyncStorage`, `Linking`, `NativeModules`
   - `constructor.constructor`, `.__proto__`, `Object.getPrototypeOf()`
   - `Reflect.defineProperty/setPrototypeOf/set`
   - `process.`
   - `globalThis` (except `globalThis.__pp`)
5. **Schema validation** — valid JSON, valid value types, valid link structure
6. **Bundle dry-run** — esbuild transform + import rewriting to catch errors

#### `npx @plotpaper/cli bundle ./MyApp.tsx -o ./bundle.js`

Full bundler pipeline:
1. esbuild transform (JSX, async/await, ES2016)
2. Strip comments
3. Rewrite imports to `__m["module"]` lookups
4. Rewrite exports to `globalThis.__ppMiniApps[bundleId]`
5. Wrap in IIFE

#### `npx @plotpaper/cli submit ./MyApp.tsx --email user@example.com`

Submit to Plotpaper platform:
1. Validate locally (fail fast)
2. Parse source + schema + permissions
3. POST to `POST /api/custom-apps/submit` with email in body
4. Server validates, bundles, provisions DB, uploads to S3
5. Returns app ID + credits charged

### File structure

```
packages/cli/
├── src/
│   ├── index.ts              # CLI entry (commander)
│   ├── commands/
│   │   ├── validate.ts
│   │   ├── bundle.ts
│   │   └── submit.ts
│   ├── validation/
│   │   ├── patterns.ts       # Blocked patterns
│   │   ├── imports.ts        # Allowed imports check
│   │   └── schema.ts         # Schema JSON validation
│   ├── bundler/
│   │   ├── transform.ts      # esbuild transform
│   │   ├── rewrite.ts        # Import/export rewriting
│   │   └── wrap.ts           # IIFE wrapping
│   └── utils/
│       └── api.ts            # HTTP client for submission
├── package.json
├── tsconfig.json
└── bin/
    └── plotpaper.js
```

**Dependencies:** `esbuild-wasm`, `commander`, `zod`

---

## Package 3: `@plotpaper/dev-harness` (Future — Phase 6+)

Local Expo app that runs mini apps with a real InstantDB backend.

- Developer provides their own InstantDB app ID + admin token
- Real database (not mocked) — full useQuery/transact support
- Mock SDK bridge for theme, user info, credits, AI, etc.
- TabNavigator/StackNavigator copied from plotpaper-app
- DevToolbar: dark mode toggle, feed action preview, credit balance

---

## Server Endpoint: `POST /api/custom-apps/submit`

Accept pre-written source code from external developers. No auth header — user identified by email.

```
Request:
{
  email: string,           // registered Plotpaper email
  sourceCode: string,
  name: string,
  description?: string,
  schema?: MiniAppSchema,
  permissions?: Permission[],
  appMode?: "private" | "multiplayer"
}

Server flow:
1. Find user by email via getUserContext()
2. Check credit balance (half of generation cost: 250 credits)
3. Validate source (reuse validateNativeSource)
4. Validate schema + permissions (Zod)
5. Bundle (reuse bundleNativeApp)
6. Validate bundle size
7. Upload source + bundle + schema + permissions to S3
8. Provision per-app InstantDB if schema provided
9. Create app + version records (status: "ready" immediately)
10. Deduct credits
11. Return { appId, versionId, status, creditsCharged }
```

No Claude call, no background worker. Synchronous — returns 201 with ready app.
Credits: half of generation cost (250 prod, 1 dev) since no AI calls needed.

---

## Examples

```
examples/
├── todo-list/App.tsx           # Simple CRUD
├── habit-tracker/App.tsx       # Feed actions, daily tracking
├── quiz-game/App.tsx           # AI generation, credits
├── multiplayer-poll/App.tsx    # Multiplayer, space members
└── recipe-book/App.tsx         # Stack navigation, AI images
```

Each is a single `.tsx` file with `@schema` comment. Serves as docs + CLI test fixtures.

---

## Documentation

```
docs/
├── getting-started.md          # Install CLI, create first app, submit
├── sdk-reference.md            # Full API reference (from sdk-docs.ts)
├── schema-guide.md             # Schemas, value types, links, permissions
├── components.md               # RN components, Feather icons, SVG, safe area
├── navigation.md               # TabNavigator + StackNavigator
├── security-model.md           # What's blocked and why
├── feed-actions.md             # Static, template, buttons
├── ai-guide.md                 # generateText/Object/Image + DB patterns
├── multiplayer.md              # Space scoping, createdBy, getSpaceMembers
└── submission.md               # CLI submit flow, review, versioning
```

---

## What Stays Private

| Component | Reason |
|---|---|
| `prompt.ts` / generation prompts | Core IP |
| `generation.ts` | Claude API integration |
| `worker.ts` | Infrastructure |
| `provisioning.ts` internals | InstantDB Platform API |
| `evaluate.ts` | Runtime security implementation |
| Bridge handlers | App runtime internals |
| Credit/billing system | Business logic |
| Icon generation | Gemini integration |

Principle: **publish the contract, keep the implementation**.

---

## Implementation Phases

| Phase | What | Effort | Status |
|-------|------|--------|--------|
| **1** | `@plotpaper/types` — extract type definitions | Small | DONE |
| **2** | `docs/` — convert sdk-docs.ts into markdown | Small | DONE |
| **3** | `examples/` — write 4-5 example apps | Small | DONE |
| **4** | `@plotpaper/cli validate` — port validation rules | Medium | DONE |
| **5** | `@plotpaper/cli bundle` — port bundler pipeline | Medium | DONE |
| **6** | `@plotpaper/dev-harness` — real InstantDB + mock SDK | Large | DONE |
| **7** | `POST /api/custom-apps/submit` — server endpoint | Medium | DONE |
| **8** | `@plotpaper/cli submit` — wire up to API (email-based) | Small | DONE |
| **9** | API key auth system | Medium | Deferred |

Phases 1-8 complete. API key auth (Phase 9) deferred — currently using email-based identification.

## Notes

- Server uses **structured output** for schema (separate from source code, not `@schema` comments)
- CLI uses `schema.json` file alongside source — no inline `@schema` support
- CLI command is `plotpaper` (bin name in package.json)
- Schema uses **array-based format** with `name` fields (matches server's `MiniAppSchemaZ` Zod schema exactly)
- Permissions are optional — server defaults to auth-required (`auth.id != null`) for all operations
- CLI `--schema` flag lets you point to any schema.json file explicitly
- All validation rules and bundler logic match the server's `validation.ts` and `bundler.ts` exactly
