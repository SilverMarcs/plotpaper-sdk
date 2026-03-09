# Security Model

Mini apps run in a sandboxed environment. This document explains what's allowed and what's blocked.

## Allowed imports

Only these modules can be imported:

- `react`
- `react-native`
- `@plotpaper/mini-app-sdk`
- `@expo/vector-icons/Feather`
- `react-native-svg`
- `react-native-safe-area-context`

Any other import or require will be rejected.

## Blocked patterns

The following patterns are blocked in source code:

| Pattern | Reason |
|---------|--------|
| `fetch()` | No network requests. Use `sdk.ai` for AI content. |
| `XMLHttpRequest` | No network requests. |
| `eval()` | Code execution is restricted. |
| `Function()` constructor | Code execution is restricted. |
| `AsyncStorage` | Use `sdk.db` for persistence. |
| `Linking` | No deep linking or URL opening. |
| `NativeModules` | No direct native module access. |
| `constructor.constructor` | Prototype chain escape prevention. |
| `.__proto__` | Prototype access prevention. |
| `Object.getPrototypeOf()` | Prototype access prevention. |
| `Reflect.defineProperty/setPrototypeOf/set` | Reflect mutation prevention. |
| `process.` | No process/environment access. |
| `globalThis` (except `__pp*`) | No global scope access. |

## Size limits

- **Source code:** 50 KB max
- **Bundle output:** 150 KB max

## How bundling works

Your source code goes through this pipeline:

1. **esbuild transform** — JSX to `React.createElement()`, async/await to generators, targeting ES2016
2. **Comment stripping** — removes all comments (preserves strings)
3. **Import rewriting** — converts `import X from "react"` to `var X = __m["react"]` (shared module registry)
4. **IIFE wrapping** — wraps everything in a self-executing function that registers your component

The bundled code runs in the Hermes JavaScript engine (React Native).

## Runtime security

At runtime, the Plotpaper app applies additional checks:

- The shared module registry (`__ppModules`) is frozen — mini apps cannot modify React/RN references
- Each bundle can only register one component under its assigned ID
- Global scope access is restricted to the module registry

## Database security

Each mini app gets its own isolated InstantDB instance:

- Apps cannot access other apps' data
- All database operations require authentication
- Multiplayer apps are automatically scoped by space
