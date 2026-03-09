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

#### `npx @plotpaper/cli submit ./MyApp.tsx`

Submit to Plotpaper platform:
1. Validate locally (fail fast)
2. Parse source + schema
3. POST to `POST /api/custom-apps/submit`
4. Auth via API key (`~/.plotpaper/config.json` or `PLOTPAPER_API_KEY` env var)
5. Server bundles, validates, provisions DB, stores on S3
6. Returns app ID

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
│       ├── config.ts         # Read ~/.plotpaper/config.json
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

## New Server Endpoint: `POST /api/custom-apps/submit`

Accept pre-written source code from external developers.

```
Request:
{
  sourceCode: string,
  name: string,
  description: string,
  schema?: MiniAppSchema,
  permissions?: Permission[],
  visibility: "private" | "multiplayer"
}

Server flow:
1. Authenticate via API key → resolve to userId
2. Validate source (reuse validateSourceCode)
3. Bundle (reuse bundleComponent)
4. Validate bundle (reuse validateBundle)
5. Create app record (status: "ready" immediately)
6. Create version record
7. Provision per-app DB if schema provided
8. Upload to S3
9. Return { appId, versionId }
```

No Claude call, no credits for generation, no background worker needed.

---

## API Key Auth

- New entity `api_keys`: `{ key (unique, indexed), userId (indexed), name, createdAt }`
- Users generate keys from app Settings
- Keys hashed (SHA-256) before storage
- CLI reads from `~/.plotpaper/config.json` or `PLOTPAPER_API_KEY` env var

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
| **7** | `POST /api/custom-apps/submit` — server endpoint | Medium | Future |
| **8** | `@plotpaper/cli submit` — wire up to API | Small | Future |
| **9** | API key auth system | Medium | Future |

Phases 1-6 complete. CLI wired for submit (Phase 8) but needs server endpoint (Phase 7) and auth (Phase 9).

## Notes

- Server uses **structured output** for schema (separate from source code, not `@schema` comments)
- CLI uses `schema.json` file alongside source — no inline `@schema` support
- CLI command is `plotpaper-cli` (not `plotpaper`)
- Schema uses **array-based format** with `name` fields (matches server's `MiniAppSchemaZ` Zod schema exactly)
- Permissions are optional — server defaults to auth-required (`auth.id != null`) for all operations
- CLI `--schema` flag lets you point to any schema.json file explicitly
- All validation rules and bundler logic match the server's `validation.ts` and `bundler.ts` exactly
