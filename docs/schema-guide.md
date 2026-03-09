# Schema Guide

Mini apps define their data model using a `schema.json` file that provisions a real-time InstantDB instance.

## Defining a schema

Create a `schema.json` file alongside your app source:

```
my-app/
├── App.tsx
├── schema.json
└── permissions.json   (optional)
```

**schema.json:**
```json
{
  "entities": [
    {
      "name": "todos",
      "attrs": [
        { "name": "title", "valueType": "string" },
        { "name": "done", "valueType": "boolean" },
        { "name": "createdAt", "valueType": "date", "indexed": true }
      ]
    }
  ]
}
```

**permissions.json** (optional — defaults to auth-required for all operations):
```json
[
  {
    "entity": "$default",
    "allow": {
      "view": "auth.id != null",
      "create": "auth.id != null",
      "update": "auth.id != null",
      "delete": "auth.id != null"
    }
  }
]
```

The CLI automatically detects `schema.json` next to your source file. You can also pass it explicitly:

```bash
plotpaper validate ./App.tsx --schema ./path/to/schema.json
```

## Value types

| Type | Description | Example values |
|------|-------------|----------------|
| `string` | Text | `"hello"` |
| `number` | Integer or float | `42`, `3.14` |
| `boolean` | True/false | `true`, `false` |
| `date` | Timestamp | `Date.now()` |
| `json` | Any JSON value | `{ key: "value" }`, `[1, 2, 3]` |

## Attribute flags

- `indexed: true` — required for any attribute used in `order` clauses. Also improves query performance for filtered lookups.
- `unique: true` — enforces uniqueness across all records.

```json
{ "name": "email", "valueType": "string", "indexed": true, "unique": true }
```

**Important:** Any attribute used in `sdk.db.useQuery({ entity: { $: { order: { myAttr: "desc" } } } })` must have `indexed: true`. The built-in `serverCreatedAt` is always available for ordering without needing to be in the schema.

## Links (relationships)

Define relationships between entities:

```json
{
  "entities": [
    { "name": "projects", "attrs": [{ "name": "name", "valueType": "string" }] },
    { "name": "tasks", "attrs": [{ "name": "title", "valueType": "string" }, { "name": "done", "valueType": "boolean" }] }
  ],
  "links": [
    {
      "name": "projectTasks",
      "forward": { "on": "tasks", "label": "project", "has": "one" },
      "reverse": { "on": "projects", "label": "tasks", "has": "many" }
    }
  ]
}
```

Query linked data:

```tsx
const { data } = sdk.db.useQuery({ projects: { tasks: {} } });
// data.projects[0].tasks → array of linked tasks
```

Link cardinality options: `"one"` or `"many"`.

Add `"onDelete": "cascade"` to automatically delete linked records when the parent is deleted.

## Record creation rules

When creating records with `transact`, include ALL attributes defined in your schema:

```tsx
// CORRECT — all attrs present
sdk.db.transact(sdk.db.tx.todos[sdk.db.id()].update({
  title: "New todo",
  done: false,
  createdAt: Date.now(),
}));

// WRONG — missing "done" and "createdAt"
sdk.db.transact(sdk.db.tx.todos[sdk.db.id()].update({
  title: "New todo",
}));
```

## Apps without a schema

If your app doesn't need data persistence, don't create a `schema.json` file. The `sdk.db` will still be available but will return empty results and no-op on writes.

## Schema changes

When you update your app, schema changes are applied automatically:
- **Adding entities/attributes:** Safe, no data loss.
- **Removing entities/attributes:** Data for removed items is no longer queryable but not physically deleted.
- **Renaming entities/attributes:** This is equivalent to removing the old name and adding a new one — **existing data will not be migrated**. Avoid renaming if you have existing data.
