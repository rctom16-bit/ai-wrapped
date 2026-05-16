# Contributing

The most fun way to contribute is to add a new **AI Personality archetype**.

## Adding an archetype

1. Open `src/analysis/archetypes.json`. Add an entry:

```json
{ "id": "your-id", "name": "The Cool Name", "emoji": "🎯", "blurb": "One-line description." }
```

2. Open `src/analysis/personality.ts`. Add a rule to the `RULES` array — earlier rules win:

```ts
{ id: "your-id", match: (stats, topics) => /* your condition */ }
```

3. Add a test in `tests/analysis/personality.test.ts` showing your rule fires under the expected conditions.

4. Open a PR.

## Other contributions

- **New topic keywords?** Edit `src/analysis/categories.json`.
- **Support another export format?** Add `src/parsers/<name>.ts` and update `src/parsers/detect.ts`. Include a fixture and tests.
- **Visual polish?** Tweak `src/styles.css` — the design tokens at the top (`--accent-1`, etc.) are the easy place to start.

## Ground rules

- The site must remain **fully static and private**. No backend calls that touch conversation data — ever.
- Keep dependencies small. New libraries need a good reason.
- New code lands with tests.
