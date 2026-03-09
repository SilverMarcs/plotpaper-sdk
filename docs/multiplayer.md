# Multiplayer Apps

Multiplayer apps run in Plotpaper Spaces — shared environments where multiple users interact with the same app instance.

## How it works

- Each space publication gets its own InstantDB instance
- Queries are automatically scoped by space — no extra code needed
- All space members have full read/write access to the space's data

## Data model pattern

For user-created content, include `createdBy` and `createdByName` fields:

```json
{
  "entities": [
    {
      "name": "posts",
      "attrs": [
        { "name": "content", "valueType": "string" },
        { "name": "createdBy", "valueType": "string", "indexed": true },
        { "name": "createdByName", "valueType": "string" },
        { "name": "createdAt", "valueType": "date", "indexed": true }
      ]
    }
  ]
}
```

When creating records:

```tsx
const user = await sdk.getUserInfo();
sdk.db.transact(sdk.db.tx.posts[sdk.db.id()].update({
  content: "Hello!",
  createdBy: user.profileId,
  createdByName: user.displayName,
  createdAt: Date.now(),
}));
```

## Per-user interactions

For features like "likes" or "completions" per user, create a separate entity instead of arrays on the parent:

```json
{
  "entities": [
    { "name": "posts", "attrs": [...] },
    {
      "name": "post_likes",
      "attrs": [
        { "name": "postId", "valueType": "string", "indexed": true },
        { "name": "likedBy", "valueType": "string", "indexed": true }
      ]
    }
  ]
}
```

Query user-specific state:

```tsx
const user = await sdk.getUserInfo();
const { data } = sdk.db.useQuery({
  post_likes: { $: { where: { likedBy: user.profileId } } }
});
```

## Space members

```tsx
const members = await sdk.getSpaceMembers();
// [{ profileId, displayName, imageUrl, role }, ...]

const space = await sdk.getSpaceInfo();
// { spaceId, spaceName }
```

## User profiles

Look up any user's profile for leaderboards, mentions, etc:

```tsx
const profile = await sdk.getProfileById("abc123");
// { profileId, displayName, imageUrl } or null

// Open a user's profile in the main app
sdk.openProfile("abc123");
```

## App mode

Set your app as multiplayer when submitting:

```bash
plotpaper submit ./MyApp.tsx --mode multiplayer --name "Group Poll"
```
