# Feed Actions

Feed actions surface live updates on the user's home feed. They appear as cards users can glance at without opening the app.

## When to use feed actions

Add a feed action whenever your app tracks meaningful state:
- Progress tracking (tasks completed, goals reached)
- Streaks (daily habits, workout streaks)
- Scores (quiz scores, game levels)
- Countdowns (days until event)
- Daily summaries

Call `setFeedAction` after the relevant data changes.

## Static feed action

Fixed title and body:

```tsx
sdk.setFeedAction({
  title: "5 tasks completed today",
  body: "You're on a 3-day streak!",
  icon: "🔥"
});
```

## Template feed action

Dynamic values that resolve from stored data:

```tsx
sdk.setFeedAction({
  title: "{{completed}}/{{total}} done",
  body: "Keep going!",
  icon: "🔥",
  dataKeys: { completed: "completedCount", total: "totalCount" },
});
```

Template placeholders like `{{completed}}` resolve from `custom_app_data` records matching the `dataKeys` mapping.

## Buttons

Add quick-action buttons to feed cards:

```tsx
sdk.setFeedAction({
  title: "Water intake: {{glasses}} glasses",
  dataKeys: { glasses: "waterGlasses" },
  buttons: [
    { label: "+1", icon: "💧", action: { type: "increment", key: "waterGlasses" } },
    { label: "Reset", action: { type: "set", key: "waterGlasses", value: 0 } }
  ]
});
```

### Button action types

- `{ type: "increment", key: string, amount?: number }` — increment a data key (default amount: 1)
- `{ type: "set", key: string, value: any }` — set a data key to a specific value

## Clearing

```tsx
sdk.clearFeedAction();
```
