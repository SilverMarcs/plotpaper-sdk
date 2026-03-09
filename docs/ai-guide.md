# AI Guide

The SDK provides AI capabilities via `sdk.ai`. Credits are deducted automatically.

## Text generation

```tsx
const { text } = await sdk.ai.generateText({
  prompt: "Write a motivational quote about persistence",
  system: "You are a motivational coach", // optional
});
```

## Structured object generation

Returns typed JSON matching your schema:

```tsx
const { object } = await sdk.ai.generateObject({
  prompt: "Generate a workout plan for today",
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      exercises: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            sets: { type: "number" },
            reps: { type: "number" },
          }
        }
      }
    }
  },
  system: "You are a fitness expert",
});
```

## Image generation

```tsx
// Single image
const { url } = await sdk.ai.generateImage({
  prompt: "A serene mountain landscape at sunset, digital art style",
});
// <Image source={{ uri: url }} />

// Batch (max 5)
const { images } = await sdk.ai.generateImages({
  prompts: ["A red rose", "A blue ocean wave", "A green forest path"],
});
// images[0].url, images[1].url, etc.
```

Generated images are stored persistently — URLs don't expire.

## AI + Database pattern

**Always store AI results in the database, not React state.** This leverages real-time subscriptions so the UI updates automatically.

```tsx
const [generating, setGenerating] = React.useState(false);
const { data } = sdk.db.useQuery({ items: { $: { order: { serverCreatedAt: "desc" } } } });

const handleGenerate = async () => {
  setGenerating(true);
  const id = sdk.db.id();

  // Create placeholder record with ALL schema fields
  sdk.db.transact(sdk.db.tx.items[id].update({
    title: "", body: "", imageUrl: "", status: "generating"
  }));

  try {
    const { object } = await sdk.ai.generateObject({ prompt: "...", schema: { ... } });
    const { url } = await sdk.ai.generateImage({ prompt: object.title });
    sdk.db.transact(sdk.db.tx.items[id].update({ ...object, imageUrl: url, status: "ready" }));
  } catch {
    sdk.db.transact(sdk.db.tx.items[id].delete());
  }

  setGenerating(false);
};
```

## Rules

- **Never call AI on mount or in useEffect.** AI calls must be triggered by user actions.
- Create DB records with ALL schema attributes (use empty strings, 0, false as placeholders).
- Use a `status` field (`"generating"` / `"ready"`) to show loading UI.
- On error, delete the placeholder record or set `status: "error"`.

## Limits

- Max prompt: 2000 characters
- Max system prompt: 1000 characters
- Max images per batch: 5
- Max AI calls: 30 per minute
