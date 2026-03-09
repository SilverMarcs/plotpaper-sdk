# SDK Reference

The Plotpaper SDK is available via `usePlotpaperSDK()` hook from `@plotpaper/mini-app-sdk`.

```tsx
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";

export default function MyApp() {
  const sdk = usePlotpaperSDK();
  // ...
}
```

## Theme (synchronous)

Access theme colors synchronously — no loading state needed:

```tsx
const colors = sdk.theme.colors;
const mode = sdk.theme.mode; // "light" | "dark"
```

Available colors: `background`, `foreground`, `card`, `cardForeground`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `muted`, `mutedForeground`, `accent`, `accentForeground`, `border`, `input`, `destructive`, `success`, `warning`, `info`

The theme auto-updates when the user toggles dark mode.

## Database (sdk.db)

Your app gets its own InstantDB instance with real-time subscriptions.

```tsx
// Real-time query — re-renders automatically when data changes
const { isLoading, error, data } = sdk.db.useQuery({ todos: {} });
const todos = data?.todos ?? [];

// Query with filters and ordering
const { data } = sdk.db.useQuery({
  todos: { $: { where: { done: false }, order: { serverCreatedAt: "desc" } } }
});

// Create a record
sdk.db.transact(sdk.db.tx.todos[sdk.db.id()].update({ title: "New todo", done: false }));

// Update a record
sdk.db.transact(sdk.db.tx.todos[todo.id].update({ done: true }));

// Delete a record
sdk.db.transact(sdk.db.tx.todos[todo.id].delete());

// Batch operations
sdk.db.transact([
  sdk.db.tx.todos[id1].update({ done: true }),
  sdk.db.tx.todos[id2].delete(),
]);
```

`sdk.db.useQuery()` is a React hook — call it at the top level of your component.

Only use entity names that are defined in your `@schema`. Using an undefined entity causes a runtime error.

## User Info

```tsx
const user = await sdk.getUserInfo();
// { displayName: "Alice", imageUrl: "https://...", profileId: "abc123" }
```

## User Profiles

```tsx
// Look up any user's public profile
const profile = await sdk.getProfileById("abc123");
// { profileId, displayName, imageUrl } or null

// Get all members of the current space (multiplayer apps)
const members = await sdk.getSpaceMembers();
// [{ profileId, displayName, imageUrl, role }, ...]

// Open a user's profile (closes the mini app)
sdk.openProfile("abc123");
```

## App & Space Info

```tsx
const info = await sdk.getAppInfo();
// { appId, appName, sdkVersion }

const space = await sdk.getSpaceInfo();
// { spaceId, spaceName }
```

## Credits

```tsx
const c = await sdk.getCredits();          // { available: 4500 }
const r = await sdk.consumeCredits(10, "reason"); // { success, remaining }
```

## Feed Actions

Surface live updates on the user's home feed.

**Static:**

```tsx
sdk.setFeedAction({
  title: "5 tasks completed today",
  body: "You're on a 3-day streak!",
  icon: "🔥"
});
```

**Template-based (dynamic values):**

```tsx
sdk.setFeedAction({
  title: "{{completed}}/{{total}} done",
  body: "Keep going!",
  icon: "🔥",
  dataKeys: { completed: "completedCount", total: "totalCount" },
  buttons: [
    { label: "+1", action: { type: "increment", key: "completedCount" } },
    { label: "Reset", action: { type: "set", key: "completedCount", value: 0 } }
  ]
});
```

```tsx
sdk.clearFeedAction(); // Remove the feed card
```

## Messaging

```tsx
sdk.composeMessage({
  context: {
    preview: { title: "Result", subtitle: "Score: 42" },
    payload: { score: 42 }
  },
  text: "Check this out!"
});
```

## Notifications

```tsx
sdk.scheduleNotification({
  id: "reminder",
  title: "Don't forget!",
  body: "Log your progress",
  trigger: { type: "daily", hour: 9, minute: 0 }
});

sdk.cancelNotification("reminder");
sdk.cancelAllNotifications();
const list = await sdk.getScheduledNotifications();
```

## Navigation

```tsx
sdk.close();              // Close the app
sdk.showToast("Saved!");  // Brief toast notification
```

## AI (sdk.ai)

All AI calls deduct credits automatically.

```tsx
// Text generation
const { text } = await sdk.ai.generateText({
  prompt: "Write a motivational quote",
  system: "You are a motivational coach", // optional
});

// Structured object generation
const { object } = await sdk.ai.generateObject({
  prompt: "Generate a workout plan",
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      exercises: { type: "array", items: { type: "object", properties: { name: { type: "string" }, reps: { type: "number" } } } }
    }
  },
});

// Single image
const { url } = await sdk.ai.generateImage({
  prompt: "A mountain landscape at sunset",
});

// Batch images (max 5)
const { images } = await sdk.ai.generateImages({
  prompts: ["A red rose", "A blue ocean"],
});
```

**Limits:** Max prompt 2000 chars, max system 1000 chars, max 5 images/batch, max 30 AI calls/minute.

**Important:** Never call AI on mount or in useEffect. Always trigger AI calls from user actions (button press, form submit). Store results in the database, not React state.

## Events

```tsx
const unsubscribe = sdk.on("themeChange", () => {
  // Theme changed
});

// Later: unsubscribe();
```
