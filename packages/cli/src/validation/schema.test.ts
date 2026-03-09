import { describe, it, expect } from "vitest";
import { validateSchema, validatePermissions } from "./schema";

describe("validateSchema", () => {
  it("validates a minimal schema", () => {
    const schema = validateSchema(
      JSON.stringify({
        entities: [
          {
            name: "todos",
            attrs: [
              { name: "title", valueType: "string" },
              { name: "done", valueType: "boolean" },
            ],
          },
        ],
      }),
    );
    expect(schema.entities).toHaveLength(1);
    expect(schema.entities[0].name).toBe("todos");
  });

  it("validates schema with links", () => {
    const schema = validateSchema(
      JSON.stringify({
        entities: [
          { name: "lists", attrs: [{ name: "title", valueType: "string" }] },
          { name: "items", attrs: [{ name: "text", valueType: "string" }] },
        ],
        links: [
          {
            name: "listItems",
            forward: { on: "lists", label: "items", has: "many" },
            reverse: { on: "items", label: "list", has: "one" },
          },
        ],
      }),
    );
    expect(schema.links).toHaveLength(1);
  });

  it("validates indexed and unique attributes", () => {
    const schema = validateSchema(
      JSON.stringify({
        entities: [
          {
            name: "users",
            attrs: [
              { name: "email", valueType: "string", indexed: true, unique: true },
              { name: "score", valueType: "number", indexed: true },
            ],
          },
        ],
      }),
    );
    expect(schema.entities[0].attrs[0].unique).toBe(true);
    expect(schema.entities[0].attrs[1].indexed).toBe(true);
  });

  it("rejects invalid JSON", () => {
    expect(() => validateSchema("not json")).toThrow("invalid JSON");
  });

  it("rejects invalid value types", () => {
    expect(() =>
      validateSchema(
        JSON.stringify({
          entities: [
            {
              name: "test",
              attrs: [{ name: "foo", valueType: "integer" }],
            },
          ],
        }),
      ),
    ).toThrow();
  });

  it("rejects links referencing unknown entities", () => {
    expect(() =>
      validateSchema(
        JSON.stringify({
          entities: [{ name: "todos", attrs: [{ name: "title", valueType: "string" }] }],
          links: [
            {
              name: "broken",
              forward: { on: "todos", label: "parent", has: "one" },
              reverse: { on: "categories", label: "items", has: "many" },
            },
          ],
        }),
      ),
    ).toThrow('unknown entity "categories"');
  });

  it("accepts all value types", () => {
    const types = ["string", "number", "boolean", "date", "json"];
    const schema = validateSchema(
      JSON.stringify({
        entities: [
          {
            name: "test",
            attrs: types.map((t) => ({ name: t, valueType: t })),
          },
        ],
      }),
    );
    expect(schema.entities[0].attrs).toHaveLength(5);
  });

  it("accepts schema with empty entities", () => {
    const schema = validateSchema(JSON.stringify({ entities: [] }));
    expect(schema.entities).toEqual([]);
  });
});

describe("validatePermissions", () => {
  it("validates valid permissions", () => {
    const perms = validatePermissions(
      JSON.stringify([
        {
          entity: "todos",
          allow: {
            view: "auth.id != null",
            create: "auth.id != null",
            update: "auth.id != null",
            delete: "auth.id != null",
          },
        },
      ]),
    );
    expect(perms).toHaveLength(1);
    expect(perms[0].entity).toBe("todos");
  });

  it("rejects invalid JSON", () => {
    expect(() => validatePermissions("bad")).toThrow("invalid JSON");
  });

  it("rejects missing allow fields", () => {
    expect(() =>
      validatePermissions(
        JSON.stringify([
          {
            entity: "todos",
            allow: { view: "true", create: "true" },
          },
        ]),
      ),
    ).toThrow();
  });
});
