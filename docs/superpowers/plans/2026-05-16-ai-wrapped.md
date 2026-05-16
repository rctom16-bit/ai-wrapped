# AI Wrapped Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static web app where visitors drop in ChatGPT and/or Claude conversation exports and instantly get a scrollable, Spotify-Wrapped-style year-in-review report that runs entirely in their browser. Deploy to GitHub Pages.

**Architecture:** Static site built with Vite + TypeScript, no backend. A small adapter layer normalizes both export formats into a single internal `Conversation[]` model. Pure functions analyze that model to produce stats, topics, an "AI Personality" archetype, and highlights. A slide-based UI renders the report. A canvas-based renderer produces a downloadable PNG share card. Plausible-style analytics counts visits only.

**Tech Stack:** TypeScript, Vite (build + dev server), Vitest (unit tests), vanilla DOM/CSS (no framework), `html-to-image` for share card rendering, GoatCounter for free privacy-respecting analytics, GitHub Pages for hosting.

---

## File Structure

```
ai-wrapped/
├── index.html                        # Single-page entry
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── README.md
├── LICENSE                            # MIT
├── CONTRIBUTING.md                    # "How to add an archetype"
├── .gitignore
├── public/
│   ├── og-image.png                   # Social share preview
│   └── samples/
│       ├── chatgpt-sample.json        # Anonymized test fixture
│       └── claude-sample.json         # Anonymized test fixture
├── src/
│   ├── main.ts                        # App bootstrap; wires landing → report
│   ├── styles.css                     # Global tokens + slide layout
│   ├── parsers/
│   │   ├── types.ts                   # Internal Conversation/Message model
│   │   ├── chatgpt.ts                 # ChatGPT export → Conversation[]
│   │   ├── claude.ts                  # Claude export → Conversation[]
│   │   └── detect.ts                  # Sniff format + dispatch to parser
│   ├── analysis/
│   │   ├── filter.ts                  # Window to last 12 months
│   │   ├── stats.ts                   # Counts, words, time-of-day, streaks
│   │   ├── topics.ts                  # Keyword-categorized top topics
│   │   ├── categories.json            # Topic keyword dictionary
│   │   ├── personality.ts             # Archetype rules
│   │   ├── archetypes.json            # Archetype definitions
│   │   └── highlights.ts              # Longest convo, opening phrases
│   ├── ui/
│   │   ├── landing.ts                 # Drop zones + "how to export" help
│   │   ├── report.ts                  # Slide controller (scroll/keyboard)
│   │   ├── slides/
│   │   │   ├── numbers.ts
│   │   │   ├── rhythm.ts
│   │   │   ├── topics.ts
│   │   │   ├── personality.ts
│   │   │   ├── compare.ts
│   │   │   └── highlights.ts
│   │   └── share-card.ts              # PNG export of stats card
└── tests/
    ├── parsers/
    │   ├── chatgpt.test.ts
    │   ├── claude.test.ts
    │   ├── detect.test.ts
    │   └── fixtures/
    │       ├── chatgpt-minimal.json
    │       └── claude-minimal.json
    └── analysis/
        ├── stats.test.ts
        ├── topics.test.ts
        ├── personality.test.ts
        └── highlights.test.ts
```

**File-size discipline:** No source file should exceed ~200 lines. If a slide or analyzer grows past that, split it.

---

## Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `index.html`, `src/main.ts`, `src/styles.css`, `LICENSE`, `README.md`

- [ ] **Step 1: Initialize npm**

Run: `npm init -y`
Expected: Creates `package.json`.

- [ ] **Step 2: Install dev dependencies**

Run: `npm install --save-dev vite typescript vitest @types/node jsdom html-to-image`
Expected: Adds dependencies, creates `node_modules/`.

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Write `vite.config.ts`**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: { target: "es2022", outDir: "dist" },
});
```

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Write `.gitignore`**

```
node_modules/
dist/
.DS_Store
*.log
.vite/
```

- [ ] **Step 7: Write minimal `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Wrapped — Your year in AI conversations</title>
    <meta name="description" content="A fun, private year-in-review for your ChatGPT and Claude conversations. Runs 100% in your browser." />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 8: Write skeleton `src/main.ts`**

```ts
const app = document.getElementById("app");
if (app) app.textContent = "AI Wrapped — scaffold ready.";
```

- [ ] **Step 9: Write empty `src/styles.css`**

```css
:root {
  --bg: #0b0b14;
  --fg: #ffffff;
  --accent-1: #ff4d8d;
  --accent-2: #7c4dff;
  --accent-3: #00e5ff;
}
html, body { margin: 0; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; }
```

- [ ] **Step 10: Add npm scripts to `package.json`**

Edit `package.json` `"scripts"` section to:

```json
{
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Also add `"type": "module"` at the top level of `package.json`.

- [ ] **Step 11: Run dev server to verify scaffold**

Run: `npm run dev`
Expected: Vite starts on `http://localhost:5173` and the page shows "AI Wrapped — scaffold ready." Kill with Ctrl-C.

- [ ] **Step 12: Write MIT `LICENSE`**

Standard MIT license text with current year and the GitHub username (placeholder `<OWNER>` to fill at deploy time — replace before committing the real one).

- [ ] **Step 13: Write README stub**

```markdown
# AI Wrapped

Your year in AI conversations, beautifully — 100% in your browser.

> **Try it:** <link will go here after deploy>

Drop in your ChatGPT and/or Claude export and get a fun, shareable year-in-review. Nothing is uploaded. Nothing is stored. The page never talks to a server about your data.

## Status

Pre-release. See `docs/superpowers/specs/2026-05-16-ai-wrapped-design.md` for the design.
```

- [ ] **Step 14: Initialize git and first commit**

```bash
git init
git add .
git commit -m "chore: scaffold vite + typescript + vitest"
```

---

## Task 2: Define the internal Conversation model

**Files:**
- Create: `src/parsers/types.ts`
- Test: (none — type-only file)

- [ ] **Step 1: Write `src/parsers/types.ts`**

```ts
export type Source = "chatgpt" | "claude";
export type Role = "user" | "assistant";

export interface Message {
  role: Role;
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  source: Source;
  model?: string;
}

export interface ParseResult {
  conversations: Conversation[];
  source: Source;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/parsers/types.ts
git commit -m "feat: define internal Conversation model"
```

---

## Task 3: ChatGPT export parser (TDD)

ChatGPT's `conversations.json` is an array of objects. Each has a `mapping` field that is a tree of message nodes (some with `null` author for system or root nodes). We need to flatten the tree into ordered user/assistant messages.

**Files:**
- Create: `src/parsers/chatgpt.ts`, `tests/parsers/chatgpt.test.ts`, `tests/parsers/fixtures/chatgpt-minimal.json`

- [ ] **Step 1: Write fixture `tests/parsers/fixtures/chatgpt-minimal.json`**

```json
[
  {
    "id": "c1",
    "title": "Pasta recipe",
    "create_time": 1700000000.0,
    "update_time": 1700000100.0,
    "mapping": {
      "root": { "id": "root", "parent": null, "children": ["m1"], "message": null },
      "m1": {
        "id": "m1",
        "parent": "root",
        "children": ["m2"],
        "message": {
          "id": "m1",
          "author": { "role": "user" },
          "create_time": 1700000000.0,
          "content": { "content_type": "text", "parts": ["how do i make carbonara?"] }
        }
      },
      "m2": {
        "id": "m2",
        "parent": "m1",
        "children": [],
        "message": {
          "id": "m2",
          "author": { "role": "assistant" },
          "create_time": 1700000050.0,
          "content": { "content_type": "text", "parts": ["Boil pasta, mix eggs and pecorino..."] },
          "metadata": { "model_slug": "gpt-4" }
        }
      }
    }
  }
]
```

- [ ] **Step 2: Write failing tests `tests/parsers/chatgpt.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { parseChatGPTExport } from "../../src/parsers/chatgpt";
import fixture from "./fixtures/chatgpt-minimal.json";

describe("parseChatGPTExport", () => {
  it("returns one conversation with two messages", () => {
    const result = parseChatGPTExport(fixture);
    expect(result.source).toBe("chatgpt");
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0]!.messages).toHaveLength(2);
  });

  it("flattens the mapping tree in chronological order", () => {
    const { conversations } = parseChatGPTExport(fixture);
    const [c] = conversations;
    expect(c!.messages[0]!.role).toBe("user");
    expect(c!.messages[0]!.text).toBe("how do i make carbonara?");
    expect(c!.messages[1]!.role).toBe("assistant");
  });

  it("parses unix timestamps to Date objects", () => {
    const { conversations } = parseChatGPTExport(fixture);
    expect(conversations[0]!.createdAt.getTime()).toBe(1700000000 * 1000);
  });

  it("captures model when present", () => {
    const { conversations } = parseChatGPTExport(fixture);
    expect(conversations[0]!.model).toBe("gpt-4");
  });

  it("skips messages with null author (system/root nodes)", () => {
    const { conversations } = parseChatGPTExport(fixture);
    expect(conversations[0]!.messages.every((m) => m.role === "user" || m.role === "assistant")).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests, expect failure**

Run: `npm test -- chatgpt`
Expected: FAIL with module-not-found.

- [ ] **Step 4: Implement `src/parsers/chatgpt.ts`**

```ts
import type { Conversation, Message, ParseResult, Role } from "./types";

interface RawNode {
  id: string;
  parent: string | null;
  children: string[];
  message: RawMessage | null;
}

interface RawMessage {
  id: string;
  author: { role: string } | null;
  create_time: number | null;
  content: { content_type: string; parts: unknown[] } | null;
  metadata?: { model_slug?: string };
}

interface RawConversation {
  id: string;
  title: string | null;
  create_time: number;
  update_time: number;
  mapping: Record<string, RawNode>;
}

export function parseChatGPTExport(raw: unknown): ParseResult {
  if (!Array.isArray(raw)) {
    throw new Error("ChatGPT export must be a JSON array of conversations");
  }
  const conversations: Conversation[] = [];
  for (const item of raw as RawConversation[]) {
    const messages = flattenMapping(item.mapping);
    if (messages.length === 0) continue;
    conversations.push({
      id: item.id,
      title: item.title,
      createdAt: new Date((item.create_time ?? messages[0]!.timestamp.getTime() / 1000) * 1000),
      updatedAt: new Date((item.update_time ?? messages.at(-1)!.timestamp.getTime() / 1000) * 1000),
      messages,
      source: "chatgpt",
      model: findFirstModel(item.mapping),
    });
  }
  return { conversations, source: "chatgpt" };
}

function flattenMapping(mapping: Record<string, RawNode>): Message[] {
  const out: Message[] = [];
  for (const node of Object.values(mapping)) {
    const m = node.message;
    if (!m || !m.author) continue;
    const role = m.author.role;
    if (role !== "user" && role !== "assistant") continue;
    const text = textFromParts(m.content?.parts ?? []);
    if (!text.trim()) continue;
    const ts = m.create_time ?? 0;
    out.push({ role: role as Role, text, timestamp: new Date(ts * 1000) });
  }
  out.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return out;
}

function textFromParts(parts: unknown[]): string {
  return parts
    .map((p) => (typeof p === "string" ? p : ""))
    .filter(Boolean)
    .join("\n");
}

function findFirstModel(mapping: Record<string, RawNode>): string | undefined {
  for (const node of Object.values(mapping)) {
    const slug = node.message?.metadata?.model_slug;
    if (slug) return slug;
  }
  return undefined;
}
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test -- chatgpt`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/parsers/chatgpt.ts tests/parsers/
git commit -m "feat(parser): ChatGPT export → internal Conversation[]"
```

---

## Task 4: Claude export parser (TDD)

Claude's export is a ZIP that contains `conversations.json` — an array where each conversation has a `chat_messages` array with `sender` (`"human"` or `"assistant"`), `text`, and `created_at` ISO strings. Simpler than ChatGPT (no tree). For the parser we only handle the parsed JSON; ZIP extraction happens in the UI layer later.

**Files:**
- Create: `src/parsers/claude.ts`, `tests/parsers/claude.test.ts`, `tests/parsers/fixtures/claude-minimal.json`

- [ ] **Step 1: Write fixture `tests/parsers/fixtures/claude-minimal.json`**

```json
[
  {
    "uuid": "abc-123",
    "name": "Travel ideas",
    "created_at": "2025-03-01T10:00:00Z",
    "updated_at": "2025-03-01T10:05:00Z",
    "chat_messages": [
      {
        "uuid": "m1",
        "sender": "human",
        "text": "where should i go for a long weekend?",
        "created_at": "2025-03-01T10:00:00Z"
      },
      {
        "uuid": "m2",
        "sender": "assistant",
        "text": "Lisbon, Mexico City, or Edinburgh depending on your vibe.",
        "created_at": "2025-03-01T10:04:30Z"
      }
    ]
  }
]
```

- [ ] **Step 2: Write failing tests `tests/parsers/claude.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { parseClaudeExport } from "../../src/parsers/claude";
import fixture from "./fixtures/claude-minimal.json";

describe("parseClaudeExport", () => {
  it("returns one conversation with two messages", () => {
    const result = parseClaudeExport(fixture);
    expect(result.source).toBe("claude");
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0]!.messages).toHaveLength(2);
  });

  it("maps sender to role", () => {
    const { conversations } = parseClaudeExport(fixture);
    expect(conversations[0]!.messages[0]!.role).toBe("user");
    expect(conversations[0]!.messages[1]!.role).toBe("assistant");
  });

  it("parses ISO timestamps", () => {
    const { conversations } = parseClaudeExport(fixture);
    expect(conversations[0]!.createdAt.toISOString()).toBe("2025-03-01T10:00:00.000Z");
  });

  it("preserves message text", () => {
    const { conversations } = parseClaudeExport(fixture);
    expect(conversations[0]!.messages[0]!.text).toMatch(/long weekend/);
  });
});
```

- [ ] **Step 3: Run tests, expect failure**

Run: `npm test -- claude`
Expected: FAIL.

- [ ] **Step 4: Implement `src/parsers/claude.ts`**

```ts
import type { Conversation, Message, ParseResult } from "./types";

interface RawMessage {
  uuid: string;
  sender: string;
  text: string;
  created_at: string;
}

interface RawConversation {
  uuid: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  chat_messages: RawMessage[];
}

export function parseClaudeExport(raw: unknown): ParseResult {
  if (!Array.isArray(raw)) {
    throw new Error("Claude export must be a JSON array of conversations");
  }
  const conversations: Conversation[] = [];
  for (const item of raw as RawConversation[]) {
    const messages: Message[] = [];
    for (const m of item.chat_messages ?? []) {
      const role = m.sender === "human" ? "user" : m.sender === "assistant" ? "assistant" : null;
      if (!role) continue;
      if (!m.text?.trim()) continue;
      messages.push({ role, text: m.text, timestamp: new Date(m.created_at) });
    }
    if (messages.length === 0) continue;
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    conversations.push({
      id: item.uuid,
      title: item.name,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      messages,
      source: "claude",
    });
  }
  return { conversations, source: "claude" };
}
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test -- claude`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/parsers/claude.ts tests/parsers/claude.test.ts tests/parsers/fixtures/claude-minimal.json
git commit -m "feat(parser): Claude export → internal Conversation[]"
```

---

## Task 5: Format detection + unified parse entry

**Files:**
- Create: `src/parsers/detect.ts`, `tests/parsers/detect.test.ts`

- [ ] **Step 1: Write failing tests `tests/parsers/detect.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { parseExport, detectFormat } from "../../src/parsers/detect";
import chatgptFixture from "./fixtures/chatgpt-minimal.json";
import claudeFixture from "./fixtures/claude-minimal.json";

describe("detectFormat", () => {
  it("identifies a ChatGPT export by the presence of `mapping`", () => {
    expect(detectFormat(chatgptFixture)).toBe("chatgpt");
  });

  it("identifies a Claude export by the presence of `chat_messages`", () => {
    expect(detectFormat(claudeFixture)).toBe("claude");
  });

  it("throws on unknown shape", () => {
    expect(() => detectFormat({ random: "data" })).toThrow();
    expect(() => detectFormat([])).toThrow();
  });
});

describe("parseExport", () => {
  it("dispatches to ChatGPT parser", () => {
    const r = parseExport(chatgptFixture);
    expect(r.source).toBe("chatgpt");
  });

  it("dispatches to Claude parser", () => {
    const r = parseExport(claudeFixture);
    expect(r.source).toBe("claude");
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test -- detect`
Expected: FAIL.

- [ ] **Step 3: Implement `src/parsers/detect.ts`**

```ts
import type { ParseResult, Source } from "./types";
import { parseChatGPTExport } from "./chatgpt";
import { parseClaudeExport } from "./claude";

export function detectFormat(raw: unknown): Source {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Export must be a non-empty JSON array of conversations.");
  }
  const sample = raw[0] as Record<string, unknown>;
  if (sample && typeof sample === "object" && "mapping" in sample) return "chatgpt";
  if (sample && typeof sample === "object" && "chat_messages" in sample) return "claude";
  throw new Error("Could not detect ChatGPT or Claude export format.");
}

export function parseExport(raw: unknown): ParseResult {
  const fmt = detectFormat(raw);
  return fmt === "chatgpt" ? parseChatGPTExport(raw) : parseClaudeExport(raw);
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test -- detect`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/parsers/detect.ts tests/parsers/detect.test.ts
git commit -m "feat(parser): format detection + unified entry"
```

---

## Task 6: Time-window filter (last 12 months)

**Files:**
- Create: `src/analysis/filter.ts`, `tests/analysis/filter.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from "vitest";
import { filterToLast12Months } from "../../src/analysis/filter";
import type { Conversation } from "../../src/parsers/types";

function convo(daysAgo: number): Conversation {
  const t = new Date();
  t.setDate(t.getDate() - daysAgo);
  return {
    id: String(daysAgo),
    title: null,
    createdAt: t,
    updatedAt: t,
    messages: [{ role: "user", text: "hi", timestamp: t }],
    source: "chatgpt",
  };
}

describe("filterToLast12Months", () => {
  it("keeps conversations from the last 365 days", () => {
    const input = [convo(10), convo(100), convo(400)];
    const out = filterToLast12Months(input);
    expect(out).toHaveLength(2);
  });

  it("filters individual messages too", () => {
    const old = new Date();
    old.setDate(old.getDate() - 500);
    const recent = new Date();
    recent.setDate(recent.getDate() - 10);
    const c: Conversation = {
      id: "x", title: null, createdAt: old, updatedAt: recent, source: "chatgpt",
      messages: [
        { role: "user", text: "old", timestamp: old },
        { role: "assistant", text: "recent", timestamp: recent },
      ],
    };
    const [out] = filterToLast12Months([c]);
    expect(out!.messages).toHaveLength(1);
    expect(out!.messages[0]!.text).toBe("recent");
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test -- filter`
Expected: FAIL.

- [ ] **Step 3: Implement `src/analysis/filter.ts`**

```ts
import type { Conversation } from "../parsers/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function filterToLast12Months(conversations: Conversation[], now = new Date()): Conversation[] {
  const cutoff = now.getTime() - 365 * MS_PER_DAY;
  const out: Conversation[] = [];
  for (const c of conversations) {
    const messages = c.messages.filter((m) => m.timestamp.getTime() >= cutoff);
    if (messages.length === 0) continue;
    out.push({ ...c, messages });
  }
  return out;
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test -- filter`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/analysis/filter.ts tests/analysis/filter.test.ts
git commit -m "feat(analysis): 12-month window filter"
```

---

## Task 7: Stats analyzer (TDD)

Computes counts, word totals, time-of-day histogram, calendar heatmap data, peak hour, longest streak.

**Files:**
- Create: `src/analysis/stats.ts`, `tests/analysis/stats.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from "vitest";
import { computeStats } from "../../src/analysis/stats";
import type { Conversation } from "../../src/parsers/types";

function msg(role: "user" | "assistant", text: string, isoTime: string): Conversation["messages"][number] {
  return { role, text, timestamp: new Date(isoTime) };
}

function convo(id: string, ...messages: Conversation["messages"]): Conversation {
  return {
    id, title: null, source: "chatgpt",
    createdAt: messages[0]!.timestamp,
    updatedAt: messages.at(-1)!.timestamp,
    messages,
  };
}

describe("computeStats", () => {
  const data: Conversation[] = [
    convo("a",
      msg("user", "hello there friend", "2025-01-01T08:00:00Z"),
      msg("assistant", "hi! how can I help", "2025-01-01T08:00:30Z")),
    convo("b",
      msg("user", "what is rust", "2025-01-02T23:30:00Z"),
      msg("assistant", "a systems language", "2025-01-02T23:30:10Z")),
  ];

  it("counts conversations and messages", () => {
    const s = computeStats(data);
    expect(s.conversationCount).toBe(2);
    expect(s.messageCount).toBe(4);
  });

  it("counts user vs assistant words separately", () => {
    const s = computeStats(data);
    expect(s.userWords).toBe(6);       // "hello there friend" + "what is rust"
    expect(s.assistantWords).toBe(8);  // "hi! how can I help" (5) + "a systems language" (3)
  });

  it("returns 24-bucket hourly histogram in UTC", () => {
    const s = computeStats(data);
    expect(s.hourly).toHaveLength(24);
    expect(s.hourly[8]).toBe(2);   // both 08:00 messages
    expect(s.hourly[23]).toBe(2);  // both 23:30 messages
  });

  it("finds the peak hour", () => {
    const s = computeStats(data);
    expect([8, 23]).toContain(s.peakHour);
  });

  it("computes per-day counts", () => {
    const s = computeStats(data);
    expect(s.dailyCounts.get("2025-01-01")).toBe(2);
    expect(s.dailyCounts.get("2025-01-02")).toBe(2);
  });

  it("reports longest active streak in days", () => {
    const s = computeStats(data);
    expect(s.longestStreak).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test -- stats`
Expected: FAIL.

- [ ] **Step 3: Implement `src/analysis/stats.ts`**

```ts
import type { Conversation } from "../parsers/types";

export interface Stats {
  conversationCount: number;
  messageCount: number;
  userWords: number;
  assistantWords: number;
  hourly: number[];                 // length 24
  peakHour: number;                 // 0-23
  dailyCounts: Map<string, number>; // "YYYY-MM-DD" → count
  longestStreak: number;
}

export function computeStats(conversations: Conversation[]): Stats {
  const hourly = new Array<number>(24).fill(0);
  const dailyCounts = new Map<string, number>();
  let messageCount = 0;
  let userWords = 0;
  let assistantWords = 0;

  for (const c of conversations) {
    for (const m of c.messages) {
      messageCount++;
      const words = countWords(m.text);
      if (m.role === "user") userWords += words;
      else assistantWords += words;
      hourly[m.timestamp.getUTCHours()]!++;
      const day = m.timestamp.toISOString().slice(0, 10);
      dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
    }
  }

  return {
    conversationCount: conversations.length,
    messageCount,
    userWords,
    assistantWords,
    hourly,
    peakHour: argmax(hourly),
    dailyCounts,
    longestStreak: longestConsecutiveStreak(dailyCounts),
  };
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function argmax(arr: number[]): number {
  let best = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i]! > arr[best]!) best = i;
  return best;
}

function longestConsecutiveStreak(counts: Map<string, number>): number {
  const days = [...counts.keys()].sort();
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;
  for (const d of days) {
    const date = new Date(d + "T00:00:00Z");
    if (previous && date.getTime() - previous.getTime() === 86_400_000) {
      current++;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    previous = date;
  }
  return longest;
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test -- stats`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/analysis/stats.ts tests/analysis/stats.test.ts
git commit -m "feat(analysis): counts, hourly histogram, streaks"
```

---

## Task 8: Topics analyzer (keyword categorization)

**Files:**
- Create: `src/analysis/categories.json`, `src/analysis/topics.ts`, `tests/analysis/topics.test.ts`

- [ ] **Step 1: Write the curated category dictionary `src/analysis/categories.json`**

```json
{
  "Code": ["code", "function", "bug", "error", "python", "javascript", "typescript", "rust", "react", "api", "git", "docker", "sql", "regex", "compile", "deploy", "debug", "stack", "library", "framework"],
  "Cooking": ["recipe", "cook", "bake", "dinner", "lunch", "breakfast", "ingredient", "oven", "pasta", "chicken", "vegan", "vegetarian", "sauce", "dessert", "marinade", "spice"],
  "Travel": ["travel", "flight", "hotel", "airbnb", "vacation", "trip", "itinerary", "passport", "visa", "tokyo", "paris", "lisbon", "country", "city", "airport"],
  "Relationships": ["girlfriend", "boyfriend", "partner", "husband", "wife", "dating", "breakup", "argument", "feel", "feeling", "friend", "family", "mom", "dad", "sister", "brother"],
  "Work": ["job", "boss", "manager", "interview", "resume", "salary", "raise", "meeting", "project", "deadline", "coworker", "email", "career", "linkedin", "promotion"],
  "Health": ["health", "doctor", "symptom", "pain", "sleep", "anxiety", "diet", "exercise", "workout", "weight", "medication", "therapy", "mental"],
  "Writing": ["write", "essay", "article", "blog", "story", "poem", "novel", "draft", "editor", "grammar", "rephrase", "tone", "headline"],
  "Learning": ["learn", "study", "tutorial", "explain", "definition", "math", "history", "language", "spanish", "french", "german", "course", "concept"],
  "Finance": ["money", "salary", "invest", "stock", "etf", "tax", "budget", "savings", "loan", "mortgage", "crypto", "bitcoin", "retirement", "401k"],
  "Tech": ["iphone", "android", "laptop", "mac", "windows", "linux", "router", "wifi", "smart home", "speaker", "headphones"],
  "Entertainment": ["movie", "film", "show", "series", "episode", "netflix", "hbo", "actor", "director", "music", "song", "album", "playlist"],
  "Books": ["book", "novel", "author", "chapter", "read", "fiction", "nonfiction", "audiobook", "kindle"],
  "Home": ["paint", "renovation", "diy", "ikea", "furniture", "garden", "plant", "kitchen", "bathroom", "apartment", "lease", "landlord"],
  "Pets": ["dog", "cat", "puppy", "kitten", "pet", "vet", "leash", "litter", "training", "treats"],
  "Fitness": ["run", "running", "gym", "lift", "squat", "deadlift", "marathon", "cycling", "yoga", "pilates", "strava"]
}
```

- [ ] **Step 2: Write failing tests `tests/analysis/topics.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { computeTopics } from "../../src/analysis/topics";
import type { Conversation, Message } from "../../src/parsers/types";

const u = (text: string): Message => ({ role: "user", text, timestamp: new Date() });

function convo(...messages: Message[]): Conversation {
  return { id: "x", title: null, createdAt: new Date(), updatedAt: new Date(), source: "chatgpt", messages };
}

describe("computeTopics", () => {
  it("ranks the top topic by keyword hits in user messages", () => {
    const data = [
      convo(u("show me a python function with a bug"), u("debug this api error")),
      convo(u("how to deploy a rust library")),
      convo(u("what is a good recipe for pasta")),
    ];
    const topics = computeTopics(data);
    expect(topics[0]!.name).toBe("Code");
    expect(topics[0]!.score).toBeGreaterThan(topics[1]!.score);
  });

  it("returns at most 5 topics", () => {
    const data = [convo(u("recipe code travel job health book dog yoga"))];
    expect(computeTopics(data).length).toBeLessThanOrEqual(5);
  });

  it("ignores assistant messages", () => {
    const data: Conversation[] = [{
      id: "x", title: null, createdAt: new Date(), updatedAt: new Date(), source: "chatgpt",
      messages: [{ role: "assistant", text: "recipe code travel", timestamp: new Date() }],
    }];
    expect(computeTopics(data)).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run tests, expect failure**

Run: `npm test -- topics`
Expected: FAIL.

- [ ] **Step 4: Implement `src/analysis/topics.ts`**

```ts
import type { Conversation } from "../parsers/types";
import categories from "./categories.json";

export interface TopicScore {
  name: string;
  score: number;
}

export function computeTopics(conversations: Conversation[]): TopicScore[] {
  const dict = categories as Record<string, string[]>;
  const scores = new Map<string, number>();
  for (const [name] of Object.entries(dict)) scores.set(name, 0);

  for (const c of conversations) {
    for (const m of c.messages) {
      if (m.role !== "user") continue;
      const lower = m.text.toLowerCase();
      for (const [name, words] of Object.entries(dict)) {
        let hits = 0;
        for (const w of words) {
          if (lower.includes(w)) hits++;
        }
        if (hits > 0) scores.set(name, (scores.get(name) ?? 0) + hits);
      }
    }
  }

  return [...scores.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, score]) => ({ name, score }));
}
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test -- topics`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/analysis/categories.json src/analysis/topics.ts tests/analysis/topics.test.ts
git commit -m "feat(analysis): top topics via keyword categories"
```

---

## Task 9: Personality archetype analyzer

**Files:**
- Create: `src/analysis/archetypes.json`, `src/analysis/personality.ts`, `tests/analysis/personality.test.ts`

- [ ] **Step 1: Write `src/analysis/archetypes.json`**

```json
[
  { "id": "night-coder",       "name": "The Night Coder",        "emoji": "🌙",  "blurb": "You and your IDE see more sunrises than your bed does." },
  { "id": "morning-thinker",   "name": "The Morning Thinker",    "emoji": "☀️",  "blurb": "Coffee in hand, brain online before most people are." },
  { "id": "weekend-warrior",   "name": "The Weekend Warrior",    "emoji": "🛠️",  "blurb": "Monday-to-Friday is real life. Saturdays are for adventures with AI." },
  { "id": "recipe-hunter",     "name": "The Recipe Hunter",      "emoji": "🍝",  "blurb": "You'd ask a chatbot before you'd ask your grandma." },
  { "id": "travel-planner",    "name": "The Travel Planner",     "emoji": "✈️",  "blurb": "You've already drafted next year's trip in 3 alternate versions." },
  { "id": "heart-whisperer",   "name": "The Heart Whisperer",    "emoji": "💌",  "blurb": "Some things you tell only the AI. We get it." },
  { "id": "career-climber",    "name": "The Career Climber",     "emoji": "📈",  "blurb": "Your AI has helped rewrite your resume more times than HR has read it." },
  { "id": "wellness-geek",     "name": "The Wellness Geek",      "emoji": "🧘",  "blurb": "Sleep scores, supplements, and second opinions." },
  { "id": "wordsmith",         "name": "The Wordsmith",          "emoji": "✒️",  "blurb": "Drafts, redrafts, and a small army of synonyms." },
  { "id": "lifelong-learner",  "name": "The Lifelong Learner",   "emoji": "📚",  "blurb": "If it can be explained, you've asked for it to be explained." },
  { "id": "money-mind",        "name": "The Money Mind",         "emoji": "💸",  "blurb": "Budgets, returns, and quietly compounding curiosity." },
  { "id": "polyglot",          "name": "The Curious Polymath",   "emoji": "🦊",  "blurb": "You can't stay on one topic for long, and that's the point." },
  { "id": "power-user",        "name": "The Power User",         "emoji": "⚡",  "blurb": "If chat tokens were frequent flyer miles, you'd own a small airline." },
  { "id": "tinkerer",          "name": "The Tinkerer",           "emoji": "🔧",  "blurb": "There is no problem that cannot be solved with a how-to and some grit." },
  { "id": "lurker",            "name": "The Quiet Listener",     "emoji": "🤫",  "blurb": "Short, sharp questions. You know exactly what you want." }
]
```

- [ ] **Step 2: Write failing tests `tests/analysis/personality.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { pickArchetype } from "../../src/analysis/personality";
import type { Stats } from "../../src/analysis/stats";
import type { TopicScore } from "../../src/analysis/topics";

function s(overrides: Partial<Stats> = {}): Stats {
  return {
    conversationCount: 10,
    messageCount: 100,
    userWords: 500,
    assistantWords: 1000,
    hourly: new Array(24).fill(0).map((_, i) => (i === 23 ? 50 : 1)),
    peakHour: 23,
    dailyCounts: new Map(),
    longestStreak: 5,
    ...overrides,
  };
}

describe("pickArchetype", () => {
  it("picks Night Coder when top topic is Code and peak hour is late", () => {
    const topics: TopicScore[] = [{ name: "Code", score: 100 }];
    expect(pickArchetype(s(), topics).id).toBe("night-coder");
  });

  it("picks Morning Thinker when peak hour is early", () => {
    const topics: TopicScore[] = [{ name: "Writing", score: 10 }];
    const stats = s({ peakHour: 7, hourly: new Array(24).fill(0).map((_, i) => (i === 7 ? 50 : 1)) });
    expect(pickArchetype(stats, topics).id).toBe("morning-thinker");
  });

  it("picks Recipe Hunter when Cooking dominates", () => {
    const topics: TopicScore[] = [{ name: "Cooking", score: 80 }];
    expect(pickArchetype(s(), topics).id).toBe("recipe-hunter");
  });

  it("picks Power User on very high volume", () => {
    const stats = s({ messageCount: 8000 });
    const topics: TopicScore[] = [{ name: "Travel", score: 1 }];
    expect(pickArchetype(stats, topics).id).toBe("power-user");
  });

  it("falls back to Curious Polymath when nothing else matches", () => {
    const topics: TopicScore[] = [];
    const stats = s({ peakHour: 14, messageCount: 50 });
    expect(pickArchetype(stats, topics).id).toBe("polyglot");
  });
});
```

- [ ] **Step 3: Run tests, expect failure**

Run: `npm test -- personality`
Expected: FAIL.

- [ ] **Step 4: Implement `src/analysis/personality.ts`**

```ts
import type { Stats } from "./stats";
import type { TopicScore } from "./topics";
import archetypes from "./archetypes.json";

export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
}

const ARCHETYPES = archetypes as Archetype[];

function byId(id: string): Archetype {
  const a = ARCHETYPES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown archetype: ${id}`);
  return a;
}

interface Rule {
  id: string;
  match: (stats: Stats, topics: TopicScore[]) => boolean;
}

const topTopic = (topics: TopicScore[]) => topics[0]?.name ?? null;

const RULES: Rule[] = [
  { id: "power-user",       match: (s) => s.messageCount >= 5000 },
  { id: "night-coder",      match: (s, t) => topTopic(t) === "Code" && s.peakHour >= 21 },
  { id: "morning-thinker",  match: (s) => s.peakHour >= 5 && s.peakHour <= 9 },
  { id: "recipe-hunter",    match: (_s, t) => topTopic(t) === "Cooking" },
  { id: "travel-planner",   match: (_s, t) => topTopic(t) === "Travel" },
  { id: "heart-whisperer",  match: (_s, t) => topTopic(t) === "Relationships" },
  { id: "career-climber",   match: (_s, t) => topTopic(t) === "Work" },
  { id: "wellness-geek",    match: (_s, t) => topTopic(t) === "Health" || topTopic(t) === "Fitness" },
  { id: "wordsmith",        match: (_s, t) => topTopic(t) === "Writing" },
  { id: "lifelong-learner", match: (_s, t) => topTopic(t) === "Learning" },
  { id: "money-mind",       match: (_s, t) => topTopic(t) === "Finance" },
  { id: "tinkerer",         match: (_s, t) => topTopic(t) === "Home" },
  { id: "weekend-warrior",  match: (s) => isWeekendDominant(s) },
  { id: "lurker",           match: (s) => s.messageCount < 50 },
];

export function pickArchetype(stats: Stats, topics: TopicScore[]): Archetype {
  for (const r of RULES) {
    if (r.match(stats, topics)) return byId(r.id);
  }
  return byId("polyglot");
}

function isWeekendDominant(stats: Stats): boolean {
  let weekend = 0;
  let weekday = 0;
  for (const [day, count] of stats.dailyCounts) {
    const dow = new Date(day + "T00:00:00Z").getUTCDay();
    if (dow === 0 || dow === 6) weekend += count;
    else weekday += count;
  }
  return weekend > weekday;
}
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test -- personality`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/analysis/archetypes.json src/analysis/personality.ts tests/analysis/personality.test.ts
git commit -m "feat(analysis): archetype detection rules"
```

---

## Task 10: Highlights analyzer

**Files:**
- Create: `src/analysis/highlights.ts`, `tests/analysis/highlights.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from "vitest";
import { computeHighlights } from "../../src/analysis/highlights";
import type { Conversation, Message } from "../../src/parsers/types";

const m = (role: "user" | "assistant", text: string, iso: string): Message => ({ role, text, timestamp: new Date(iso) });

describe("computeHighlights", () => {
  const data: Conversation[] = [
    { id: "a", title: null, source: "chatgpt", createdAt: new Date("2025-01-01"), updatedAt: new Date("2025-01-01"),
      messages: [m("user", "can you help me write a poem", "2025-01-01T08:00:00Z"), m("assistant", "sure", "2025-01-01T08:00:30Z")] },
    { id: "b", title: null, source: "chatgpt", createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01"),
      messages: Array.from({ length: 40 }, (_, i) => m(i % 2 === 0 ? "user" : "assistant", "msg", `2025-02-01T0${0}:0${0}:0${0}Z`)) },
    { id: "c", title: null, source: "chatgpt", createdAt: new Date("2025-03-01"), updatedAt: new Date("2025-03-01"),
      messages: [m("user", "can you help me find a job", "2025-03-01T09:00:00Z")] },
  ];

  it("finds the longest conversation by message count", () => {
    const h = computeHighlights(data);
    expect(h.longestConversation.messageCount).toBe(40);
  });

  it("finds the busiest day", () => {
    const h = computeHighlights(data);
    expect(h.busiestDay.date).toBe("2025-02-01");
    expect(h.busiestDay.messageCount).toBe(40);
  });

  it("finds the most common opening phrase from user messages", () => {
    const h = computeHighlights(data);
    expect(h.commonOpeningPhrase.toLowerCase()).toContain("can you help me");
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test -- highlights`
Expected: FAIL.

- [ ] **Step 3: Implement `src/analysis/highlights.ts`**

```ts
import type { Conversation } from "../parsers/types";

export interface Highlights {
  longestConversation: { messageCount: number };
  busiestDay: { date: string; messageCount: number };
  commonOpeningPhrase: string;
}

export function computeHighlights(conversations: Conversation[]): Highlights {
  let longest = 0;
  const dayCounts = new Map<string, number>();
  const openings: string[] = [];

  for (const c of conversations) {
    if (c.messages.length > longest) longest = c.messages.length;
    for (const m of c.messages) {
      const day = m.timestamp.toISOString().slice(0, 10);
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    const firstUser = c.messages.find((m) => m.role === "user");
    if (firstUser) openings.push(firstFiveWords(firstUser.text).toLowerCase());
  }

  let busyDay = "";
  let busyCount = 0;
  for (const [day, count] of dayCounts) {
    if (count > busyCount) { busyDay = day; busyCount = count; }
  }

  return {
    longestConversation: { messageCount: longest },
    busiestDay: { date: busyDay, messageCount: busyCount },
    commonOpeningPhrase: mostCommon(openings) ?? "—",
  };
}

function firstFiveWords(text: string): string {
  return text.trim().split(/\s+/).slice(0, 5).join(" ");
}

function mostCommon(items: string[]): string | null {
  const counts = new Map<string, number>();
  for (const x of items) counts.set(x, (counts.get(x) ?? 0) + 1);
  let best: string | null = null;
  let bestCount = 0;
  for (const [k, v] of counts) if (v > bestCount) { best = k; bestCount = v; }
  return best;
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test -- highlights`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/analysis/highlights.ts tests/analysis/highlights.test.ts
git commit -m "feat(analysis): highlights (longest, busiest, opening)"
```

---

## Task 11: Landing page UI with file drop

**Files:**
- Create: `src/ui/landing.ts`
- Modify: `src/main.ts`, `src/styles.css`

- [ ] **Step 1: Implement `src/ui/landing.ts`**

```ts
export interface LandingResult {
  chatgptFile: File | null;
  claudeFile: File | null;
}

export function renderLanding(root: HTMLElement, onSubmit: (r: LandingResult) => void): void {
  root.innerHTML = `
    <section class="landing">
      <h1>AI Wrapped</h1>
      <p class="tagline">Your year in AI conversations, beautifully.</p>
      <p class="privacy">100% in your browser. Nothing leaves your device.</p>

      <div class="drops">
        ${dropZone("chatgpt", "ChatGPT export")}
        ${dropZone("claude", "Claude export")}
      </div>

      <button class="primary" id="go" disabled>See my year →</button>

      <details class="howto">
        <summary>How do I get my export?</summary>
        <p><strong>ChatGPT:</strong> Settings → Data Controls → Export data. You'll get an email with a ZIP. Inside is <code>conversations.json</code>. Drop that file above.</p>
        <p><strong>Claude:</strong> Settings → Privacy → Export data. You'll get an email with a ZIP. Inside is <code>conversations.json</code>. Drop that file above.</p>
      </details>
    </section>
  `;

  const state: LandingResult = { chatgptFile: null, claudeFile: null };
  const go = root.querySelector<HTMLButtonElement>("#go")!;

  for (const which of ["chatgpt", "claude"] as const) {
    const zone = root.querySelector<HTMLLabelElement>(`label[data-which="${which}"]`)!;
    const input = zone.querySelector<HTMLInputElement>("input[type=file]")!;
    const label = zone.querySelector<HTMLSpanElement>(".filename")!;

    const accept = (file: File | null) => {
      if (which === "chatgpt") state.chatgptFile = file;
      else state.claudeFile = file;
      label.textContent = file ? file.name : "";
      zone.classList.toggle("has-file", !!file);
      go.disabled = !(state.chatgptFile || state.claudeFile);
    };

    input.addEventListener("change", () => accept(input.files?.[0] ?? null));
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragging"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragging"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragging");
      const f = e.dataTransfer?.files?.[0] ?? null;
      if (f) accept(f);
    });
  }

  go.addEventListener("click", () => onSubmit(state));
}

function dropZone(which: "chatgpt" | "claude", label: string): string {
  return `
    <label class="drop" data-which="${which}">
      <input type="file" accept=".json,application/json" hidden />
      <div class="drop-label">${label}</div>
      <div class="drop-hint">Drop the JSON file or click to browse</div>
      <span class="filename"></span>
    </label>
  `;
}
```

- [ ] **Step 2: Update `src/main.ts` to render landing**

```ts
import { renderLanding } from "./ui/landing";

const app = document.getElementById("app");
if (app) {
  renderLanding(app, (result) => {
    console.log("submit", result);
  });
}
```

- [ ] **Step 3: Add landing styles to `src/styles.css`** (append):

```css
.landing { max-width: 720px; margin: 0 auto; padding: 64px 24px; text-align: center; }
.landing h1 { font-size: clamp(48px, 8vw, 96px); margin: 0; background: linear-gradient(90deg, var(--accent-1), var(--accent-2), var(--accent-3)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.tagline { font-size: 20px; opacity: 0.9; }
.privacy { font-size: 14px; opacity: 0.7; }
.drops { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; margin: 32px 0; }
@media (max-width: 640px) { .drops { grid-template-columns: 1fr; } }
.drop { display: flex; flex-direction: column; gap: 8px; padding: 32px 16px; border: 2px dashed rgba(255,255,255,0.25); border-radius: 16px; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.drop:hover, .drop.dragging { border-color: var(--accent-2); background: rgba(124,77,255,0.08); }
.drop.has-file { border-color: var(--accent-3); background: rgba(0,229,255,0.08); }
.drop-label { font-weight: 600; font-size: 18px; }
.drop-hint { font-size: 13px; opacity: 0.6; }
.filename { font-size: 12px; opacity: 0.85; word-break: break-all; }
button.primary { background: linear-gradient(90deg, var(--accent-1), var(--accent-2)); border: none; color: white; padding: 16px 32px; font-size: 18px; font-weight: 600; border-radius: 999px; cursor: pointer; }
button.primary[disabled] { opacity: 0.4; cursor: not-allowed; }
.howto { margin-top: 32px; text-align: left; opacity: 0.85; }
.howto code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; }
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Open `http://localhost:5173`. Confirm the landing renders, files can be selected, the "See my year →" button enables after a file is added. Console-logs the result. Kill with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add src/ui/landing.ts src/main.ts src/styles.css
git commit -m "feat(ui): landing page with drag-and-drop"
```

---

## Task 12: Pipeline glue — parse + analyze + log

Wire the landing's file submission to the parsers + analyzers and log the results to the console. We'll replace `console.log` with the report UI in later tasks.

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Update `src/main.ts`**

```ts
import { renderLanding } from "./ui/landing";
import { parseExport } from "./parsers/detect";
import type { Conversation } from "./parsers/types";
import { filterToLast12Months } from "./analysis/filter";
import { computeStats } from "./analysis/stats";
import { computeTopics } from "./analysis/topics";
import { pickArchetype } from "./analysis/personality";
import { computeHighlights } from "./analysis/highlights";

const app = document.getElementById("app")!;

renderLanding(app, async (result) => {
  const all: Conversation[] = [];
  if (result.chatgptFile) all.push(...(await parseFile(result.chatgptFile)));
  if (result.claudeFile) all.push(...(await parseFile(result.claudeFile)));
  const recent = filterToLast12Months(all);
  const stats = computeStats(recent);
  const topics = computeTopics(recent);
  const archetype = pickArchetype(stats, topics);
  const highlights = computeHighlights(recent);
  console.log({ stats, topics, archetype, highlights });
});

async function parseFile(file: File): Promise<Conversation[]> {
  const text = await file.text();
  const json = JSON.parse(text);
  return parseExport(json).conversations;
}
```

- [ ] **Step 2: Manual smoke test**

Run: `npm run dev`. Drop in a real export (the user's own, or a fixture). Open the browser console and confirm an object with `stats`, `topics`, `archetype`, `highlights` is logged. Kill with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: end-to-end pipeline (landing → parse → analyze)"
```

---

## Task 13: Slide controller

A simple scroll-snap container with keyboard arrow navigation.

**Files:**
- Create: `src/ui/report.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement `src/ui/report.ts`**

```ts
export interface ReportData {
  stats: import("../analysis/stats").Stats;
  topics: import("../analysis/topics").TopicScore[];
  archetype: import("../analysis/personality").Archetype;
  highlights: import("../analysis/highlights").Highlights;
  hasChatGPT: boolean;
  hasClaude: boolean;
}

export type SlideRenderer = (data: ReportData) => HTMLElement;

export function renderReport(root: HTMLElement, data: ReportData, slides: SlideRenderer[]): void {
  root.innerHTML = `<div class="report"></div>`;
  const container = root.querySelector<HTMLDivElement>(".report")!;
  for (const slide of slides) container.appendChild(wrap(slide(data)));
  setupKeyboardNav(container);
}

function wrap(el: HTMLElement): HTMLElement {
  const wrapper = document.createElement("section");
  wrapper.className = "slide";
  wrapper.appendChild(el);
  return wrapper;
}

function setupKeyboardNav(container: HTMLElement): void {
  const sections = () => Array.from(container.querySelectorAll<HTMLElement>(".slide"));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const dir = e.key === "ArrowDown" ? 1 : -1;
    const list = sections();
    const i = list.findIndex((s) => Math.abs(s.getBoundingClientRect().top) < window.innerHeight / 2);
    const next = list[Math.max(0, Math.min(list.length - 1, i + dir))];
    next?.scrollIntoView({ behavior: "smooth" });
  });
}
```

- [ ] **Step 2: Add slide layout styles to `src/styles.css`** (append):

```css
.report { scroll-snap-type: y mandatory; height: 100vh; overflow-y: scroll; }
.slide { scroll-snap-align: start; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px; }
.slide-card { max-width: 720px; width: 100%; text-align: center; }
.big-number { font-size: clamp(72px, 16vw, 200px); font-weight: 800; line-height: 1; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.label { font-size: 18px; opacity: 0.8; margin-top: 12px; }
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/report.ts src/styles.css
git commit -m "feat(ui): scroll-snap slide controller"
```

---

## Task 14: Slides — Numbers and Rhythm

**Files:**
- Create: `src/ui/slides/numbers.ts`, `src/ui/slides/rhythm.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement `src/ui/slides/numbers.ts`**

```ts
import type { ReportData } from "../report";

export function numbersSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">You had</div>
    <div class="big-number">${data.stats.conversationCount.toLocaleString()}</div>
    <div class="label">conversations this year</div>
    <div class="numbers-grid">
      <div><div class="num">${data.stats.messageCount.toLocaleString()}</div><div class="sub">messages</div></div>
      <div><div class="num">${data.stats.userWords.toLocaleString()}</div><div class="sub">words from you</div></div>
      <div><div class="num">${data.stats.assistantWords.toLocaleString()}</div><div class="sub">words from AI</div></div>
    </div>
  `;
  return el;
}
```

- [ ] **Step 2: Implement `src/ui/slides/rhythm.ts`**

```ts
import type { ReportData } from "../report";

export function rhythmSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  const peak = formatHour(data.stats.peakHour);
  el.innerHTML = `
    <div class="label">Your peak hour is</div>
    <div class="big-number">${peak}</div>
    <div class="label">You're a ${classify(data.stats.peakHour)}</div>
    <div class="hourly" aria-hidden="true">${renderHourly(data.stats.hourly)}</div>
    <div class="label" style="margin-top:24px;">Longest active streak: ${data.stats.longestStreak} days</div>
  `;
  return el;
}

function formatHour(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h === 0 ? 12 : h <= 12 ? h : h - 12;
  return `${hour12} ${period}`;
}

function classify(h: number): string {
  if (h >= 5 && h <= 9) return "morning person ☀️";
  if (h >= 10 && h <= 16) return "daytime thinker 🌤️";
  if (h >= 17 && h <= 21) return "evening regular 🌆";
  return "night owl 🌙";
}

function renderHourly(hourly: number[]): string {
  const max = Math.max(1, ...hourly);
  return hourly.map((v, i) => {
    const h = Math.max(2, (v / max) * 100);
    return `<span class="bar" style="height:${h}%" title="${i}:00 — ${v}"></span>`;
  }).join("");
}
```

- [ ] **Step 3: Append slide styles to `src/styles.css`**

```css
.numbers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
.numbers-grid .num { font-size: 36px; font-weight: 700; color: var(--accent-3); }
.numbers-grid .sub { font-size: 13px; opacity: 0.7; margin-top: 4px; }
.hourly { display: flex; align-items: flex-end; gap: 4px; height: 120px; margin-top: 32px; }
.hourly .bar { flex: 1; background: linear-gradient(180deg, var(--accent-1), var(--accent-2)); border-radius: 4px; }
```

- [ ] **Step 4: Wire slides into the pipeline — update `src/main.ts`**

```ts
import { renderLanding } from "./ui/landing";
import { parseExport } from "./parsers/detect";
import type { Conversation } from "./parsers/types";
import { filterToLast12Months } from "./analysis/filter";
import { computeStats } from "./analysis/stats";
import { computeTopics } from "./analysis/topics";
import { pickArchetype } from "./analysis/personality";
import { computeHighlights } from "./analysis/highlights";
import { renderReport } from "./ui/report";
import { numbersSlide } from "./ui/slides/numbers";
import { rhythmSlide } from "./ui/slides/rhythm";

const app = document.getElementById("app")!;

renderLanding(app, async (result) => {
  const all: Conversation[] = [];
  if (result.chatgptFile) all.push(...(await parseFile(result.chatgptFile)));
  if (result.claudeFile) all.push(...(await parseFile(result.claudeFile)));
  const recent = filterToLast12Months(all);
  const stats = computeStats(recent);
  const topics = computeTopics(recent);
  const archetype = pickArchetype(stats, topics);
  const highlights = computeHighlights(recent);
  renderReport(app, {
    stats, topics, archetype, highlights,
    hasChatGPT: !!result.chatgptFile,
    hasClaude: !!result.claudeFile,
  }, [numbersSlide, rhythmSlide]);
});

async function parseFile(file: File): Promise<Conversation[]> {
  const text = await file.text();
  return parseExport(JSON.parse(text)).conversations;
}
```

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev`. Drop in a real export. Confirm Numbers and Rhythm slides render and scroll between them with arrow keys / scroll wheel. Kill with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add src/ui/slides/ src/main.ts src/styles.css
git commit -m "feat(slides): Numbers + Rhythm"
```

---

## Task 15: Slides — Topics and Personality

**Files:**
- Create: `src/ui/slides/topics.ts`, `src/ui/slides/personality.ts`
- Modify: `src/main.ts`, `src/styles.css`

- [ ] **Step 1: Implement `src/ui/slides/topics.ts`**

```ts
import type { ReportData } from "../report";

export function topicsSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  const max = Math.max(1, ...data.topics.map((t) => t.score));
  const pills = data.topics.map((t) => {
    const scale = 0.7 + (t.score / max) * 0.8;
    return `<span class="topic-pill" style="font-size:${scale}em;">${escapeHtml(t.name)}</span>`;
  }).join("");
  el.innerHTML = `
    <div class="label">You talk about</div>
    <h2 class="topics-title">${data.topics[0]?.name ?? "a bit of everything"}</h2>
    <div class="topic-pills">${pills}</div>
  `;
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
```

- [ ] **Step 2: Implement `src/ui/slides/personality.ts`**

```ts
import type { ReportData } from "../report";

export function personalitySlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">Your AI personality is</div>
    <div class="archetype-emoji">${data.archetype.emoji}</div>
    <h2 class="archetype-name">${data.archetype.name}</h2>
    <p class="archetype-blurb">${data.archetype.blurb}</p>
  `;
  return el;
}
```

- [ ] **Step 3: Append styles to `src/styles.css`**

```css
.topics-title { font-size: clamp(48px, 10vw, 120px); margin: 16px 0; background: linear-gradient(135deg, var(--accent-3), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.topic-pills { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 32px; }
.topic-pill { padding: 8px 18px; border-radius: 999px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); }
.archetype-emoji { font-size: 120px; margin: 16px 0; }
.archetype-name { font-size: clamp(40px, 8vw, 80px); margin: 0; background: linear-gradient(135deg, var(--accent-1), var(--accent-3)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.archetype-blurb { font-size: 18px; opacity: 0.85; max-width: 480px; margin: 24px auto; }
```

- [ ] **Step 4: Add slides to the pipeline in `src/main.ts`**

Add imports and update the `renderReport(...)` slide list:

```ts
import { topicsSlide } from "./ui/slides/topics";
import { personalitySlide } from "./ui/slides/personality";

// ...inside the submit handler, replace the slide array with:
[numbersSlide, rhythmSlide, topicsSlide, personalitySlide]
```

- [ ] **Step 5: Smoke test in browser**

Run: `npm run dev`, confirm all four slides render. Kill with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add src/ui/slides/topics.ts src/ui/slides/personality.ts src/main.ts src/styles.css
git commit -m "feat(slides): Topics + Personality"
```

---

## Task 16: Slides — Compare and Highlights

**Files:**
- Create: `src/ui/slides/compare.ts`, `src/ui/slides/highlights.ts`
- Modify: `src/main.ts`, `src/styles.css`

- [ ] **Step 1: Implement `src/ui/slides/compare.ts`**

```ts
import type { ReportData } from "../report";

export function compareSlide(data: ReportData): HTMLElement | null {
  if (!(data.hasChatGPT && data.hasClaude)) return null;
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">You use both</div>
    <h2 class="compare-title">ChatGPT &amp; Claude</h2>
    <p class="compare-blurb">Two different AIs, two different vibes. We see you.</p>
  `;
  return el;
}
```

- [ ] **Step 2: Implement `src/ui/slides/highlights.ts`**

```ts
import type { ReportData } from "../report";

export function highlightsSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">The highlights</div>
    <ul class="highlight-list">
      <li><span class="hl-num">${data.highlights.longestConversation.messageCount}</span><span class="hl-label">messages in your longest chat</span></li>
      <li><span class="hl-num">${data.highlights.busiestDay.messageCount}</span><span class="hl-label">messages on your busiest day (${data.highlights.busiestDay.date})</span></li>
      <li><span class="hl-num">"${escapeHtml(data.highlights.commonOpeningPhrase)}"</span><span class="hl-label">your most common opener</span></li>
    </ul>
  `;
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
```

- [ ] **Step 3: Append styles to `src/styles.css`**

```css
.compare-title { font-size: clamp(40px, 8vw, 80px); margin: 16px 0; background: linear-gradient(90deg, #10a37f, var(--accent-1)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.compare-blurb { font-size: 18px; opacity: 0.85; }
.highlight-list { list-style: none; padding: 0; display: grid; gap: 32px; margin-top: 24px; }
.highlight-list li { display: grid; gap: 4px; }
.hl-num { font-size: 56px; font-weight: 800; color: var(--accent-3); }
.hl-label { font-size: 15px; opacity: 0.75; }
```

- [ ] **Step 4: Update `src/main.ts` to include conditional Compare slide**

Add imports and adjust the slide list to filter out `null`s:

```ts
import { compareSlide } from "./ui/slides/compare";
import { highlightsSlide } from "./ui/slides/highlights";

// Inside submit handler — build the slide list with optional compare slide:
const slideRenderers = [
  numbersSlide,
  rhythmSlide,
  topicsSlide,
  personalitySlide,
  ...(result.chatgptFile && result.claudeFile ? [compareSlide] : []),
  highlightsSlide,
].filter(Boolean) as Parameters<typeof renderReport>[2];

renderReport(app, { stats, topics, archetype, highlights, hasChatGPT: !!result.chatgptFile, hasClaude: !!result.claudeFile }, slideRenderers);
```

Update the `SlideRenderer` type in `src/ui/report.ts` to allow returning `HTMLElement | null` and skip nulls:

```ts
export type SlideRenderer = (data: ReportData) => HTMLElement | null;

export function renderReport(root: HTMLElement, data: ReportData, slides: SlideRenderer[]): void {
  root.innerHTML = `<div class="report"></div>`;
  const container = root.querySelector<HTMLDivElement>(".report")!;
  for (const slide of slides) {
    const el = slide(data);
    if (el) container.appendChild(wrap(el));
  }
  setupKeyboardNav(container);
}
```

- [ ] **Step 5: Smoke test**

Run: `npm run dev`, drop a real export. Confirm 5 slides (single source) or 6 slides (both sources). Kill with Ctrl-C.

- [ ] **Step 6: Commit**

```ts
git add src/ui/slides/compare.ts src/ui/slides/highlights.ts src/ui/report.ts src/main.ts src/styles.css
git commit -m "feat(slides): Compare + Highlights"
```

---

## Task 17: Shareable PNG card

**Files:**
- Create: `src/ui/share-card.ts`
- Modify: `src/main.ts`, `src/styles.css`

- [ ] **Step 1: Implement `src/ui/share-card.ts`**

```ts
import { toPng } from "html-to-image";
import type { ReportData } from "./report";

export function shareCardSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">Save your share card</div>
    <div id="share-card" class="share-card">
      <div class="sc-header">AI Wrapped • 2026</div>
      <div class="sc-archetype">${data.archetype.emoji}</div>
      <div class="sc-name">${data.archetype.name}</div>
      <div class="sc-stats">
        <div><strong>${data.stats.conversationCount.toLocaleString()}</strong> conversations</div>
        <div><strong>${data.stats.messageCount.toLocaleString()}</strong> messages</div>
        <div>Top topic: <strong>${data.topics[0]?.name ?? "—"}</strong></div>
      </div>
      <div class="sc-footer">ai-wrapped.example</div>
    </div>
    <button class="primary" id="download-card" style="margin-top:24px;">Download PNG</button>
  `;
  setTimeout(() => {
    const btn = el.querySelector<HTMLButtonElement>("#download-card")!;
    const card = el.querySelector<HTMLDivElement>("#share-card")!;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Rendering…";
      try {
        const dataUrl = await toPng(card, { pixelRatio: 2 });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "ai-wrapped.png";
        a.click();
      } finally {
        btn.disabled = false;
        btn.textContent = "Download PNG";
      }
    });
  }, 0);
  return el;
}
```

- [ ] **Step 2: Append styles to `src/styles.css`**

```css
.share-card { width: 540px; max-width: 100%; aspect-ratio: 9/16; margin: 24px auto; padding: 48px 32px; border-radius: 24px; background: linear-gradient(135deg, var(--accent-2), var(--accent-1) 60%, var(--accent-3)); color: white; display: flex; flex-direction: column; gap: 16px; align-items: center; justify-content: center; text-align: center; }
.sc-header { font-size: 14px; letter-spacing: 0.2em; opacity: 0.85; }
.sc-archetype { font-size: 96px; }
.sc-name { font-size: 36px; font-weight: 700; }
.sc-stats { display: grid; gap: 8px; font-size: 16px; opacity: 0.95; }
.sc-stats strong { font-weight: 700; }
.sc-footer { margin-top: 16px; font-size: 13px; opacity: 0.8; }
```

- [ ] **Step 3: Append share-card slide to the pipeline in `src/main.ts`**

```ts
import { shareCardSlide } from "./ui/share-card";

// Append shareCardSlide to the slide list (always last):
const slideRenderers = [
  numbersSlide, rhythmSlide, topicsSlide, personalitySlide,
  ...(result.chatgptFile && result.claudeFile ? [compareSlide] : []),
  highlightsSlide, shareCardSlide,
].filter(Boolean) as Parameters<typeof renderReport>[2];
```

- [ ] **Step 4: Smoke test**

Run: `npm run dev`, drop an export, scroll to the last slide, click Download PNG, confirm a PNG file downloads with the correct content. Kill with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add src/ui/share-card.ts src/main.ts src/styles.css
git commit -m "feat(ui): downloadable PNG share card"
```

---

## Task 18: Error handling for invalid files

**Files:**
- Modify: `src/main.ts`, `src/styles.css`

- [ ] **Step 1: Wrap the parsing pipeline in try/catch and render a friendly error**

Replace the body of the `renderLanding` callback in `src/main.ts`:

```ts
renderLanding(app, async (result) => {
  try {
    const all: Conversation[] = [];
    if (result.chatgptFile) all.push(...(await parseFile(result.chatgptFile)));
    if (result.claudeFile) all.push(...(await parseFile(result.claudeFile)));
    if (all.length === 0) throw new Error("No conversations found in that file.");

    const recent = filterToLast12Months(all);
    if (recent.length === 0) throw new Error("No conversations from the last 12 months.");

    const stats = computeStats(recent);
    const topics = computeTopics(recent);
    const archetype = pickArchetype(stats, topics);
    const highlights = computeHighlights(recent);

    const slideRenderers = [
      numbersSlide, rhythmSlide, topicsSlide, personalitySlide,
      ...(result.chatgptFile && result.claudeFile ? [compareSlide] : []),
      highlightsSlide, shareCardSlide,
    ].filter(Boolean) as Parameters<typeof renderReport>[2];

    renderReport(app, {
      stats, topics, archetype, highlights,
      hasChatGPT: !!result.chatgptFile,
      hasClaude: !!result.claudeFile,
    }, slideRenderers);
  } catch (err) {
    showError(app, err instanceof Error ? err.message : String(err));
  }
});

function showError(root: HTMLElement, message: string): void {
  const banner = document.createElement("div");
  banner.className = "error-banner";
  banner.textContent = `Something went wrong: ${message}`;
  root.prepend(banner);
}
```

- [ ] **Step 2: Append error styling**

```css
.error-banner { background: #ff4d4d; color: white; padding: 16px; text-align: center; font-weight: 600; }
```

- [ ] **Step 3: Smoke test with a bad file**

Run: `npm run dev`, drop in a random non-export JSON file. Confirm the error banner appears and the page does not crash. Kill with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add src/main.ts src/styles.css
git commit -m "feat: friendly error banner for invalid files"
```

---

## Task 19: Add analytics (GoatCounter)

**Files:**
- Modify: `index.html`, `README.md`

- [ ] **Step 1: Add the GoatCounter script tag to `index.html`** before the closing `</body>` tag

```html
<script data-goatcounter="https://<YOUR-CODE>.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
```

(The user will sign up at goatcounter.com and replace `<YOUR-CODE>` during deployment.)

- [ ] **Step 2: Add a privacy/analytics note to `README.md`**

```markdown
## Analytics

This site uses [GoatCounter](https://www.goatcounter.com/), a privacy-respecting, cookie-free, GDPR-friendly visitor counter. It counts page views only. It never sees, touches, uploads, or stores anything from your conversation files — those stay on your device.
```

- [ ] **Step 3: Commit**

```bash
git add index.html README.md
git commit -m "chore: add goatcounter analytics + privacy note"
```

---

## Task 20: Polish README + CONTRIBUTING + sample files

**Files:**
- Modify: `README.md`
- Create: `CONTRIBUTING.md`, `public/samples/chatgpt-sample.json`, `public/samples/claude-sample.json`

- [ ] **Step 1: Rewrite `README.md`**

```markdown
# AI Wrapped

> Your year in AI conversations, beautifully — 100% in your browser.

**Try it:** https://<OWNER>.github.io/ai-wrapped/

Drop in your ChatGPT and/or Claude export and get a fun, shareable year-in-review. Nothing is uploaded. Nothing is stored. The page never talks to a server about your data.

## How to get your export

- **ChatGPT** — Settings → Data Controls → Export data → confirm via email → unzip → grab `conversations.json`.
- **Claude** — Settings → Privacy → Export data → confirm via email → unzip → grab `conversations.json`.

Drop the JSON file (or both) into the page and scroll.

## Why it's private

- No backend. The repo is a static site on GitHub Pages.
- Your file is read by the browser's File API and parsed in JavaScript.
- Nothing is sent to any server about its contents. Audit the source — there are no fetch calls touching your data.

## Run locally

```bash
npm install
npm run dev   # http://localhost:5173
npm test      # vitest
npm run build # produces dist/
```

## Add your own AI personality

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
```

- [ ] **Step 2: Write `CONTRIBUTING.md`**

```markdown
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

3. Add a test case in `tests/analysis/personality.test.ts` showing your rule fires under expected conditions.

4. Open a PR.

## Other contributions

- New topic keywords? Edit `src/analysis/categories.json`.
- Support for another export format? Add a `src/parsers/<name>.ts` and update `src/parsers/detect.ts`. Include a fixture and tests.
```

- [ ] **Step 3: Generate sample files**

Create `public/samples/chatgpt-sample.json` and `public/samples/claude-sample.json` — synthesized fake exports (~50 conversations each) covering 12 months. Use a small script (one-off, not committed) or hand-craft a representative set. These ship in the site so visitors with no export can try a "View a demo" link.

- [ ] **Step 4: Add "Try with demo data" link to landing**

Edit `src/ui/landing.ts` to include a small link below the drops:

```ts
// Inside the rendered HTML, just under the Go button:
`<p class="demo"><a href="#" id="try-demo">Try with sample data</a></p>`
```

Wire it in the same setup function:

```ts
root.querySelector<HTMLAnchorElement>("#try-demo")!.addEventListener("click", async (e) => {
  e.preventDefault();
  const res = await fetch("./samples/chatgpt-sample.json");
  const blob = await res.blob();
  const file = new File([blob], "chatgpt-sample.json", { type: "application/json" });
  onSubmit({ chatgptFile: file, claudeFile: null });
});
```

- [ ] **Step 5: Smoke test**

Run: `npm run dev`, click "Try with sample data" on the landing, confirm the full report renders from the bundled sample. Kill with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add README.md CONTRIBUTING.md public/samples src/ui/landing.ts
git commit -m "docs: README, CONTRIBUTING, sample data + demo link"
```

---

## Task 21: Build, smoke-test the production bundle, deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Run a production build**

Run: `npm run build`
Expected: PASS with no type errors; `dist/` directory created.

- [ ] **Step 2: Preview the build locally**

Run: `npm run preview`
Open the URL printed, confirm everything works against the built bundle. Kill with Ctrl-C.

- [ ] **Step 3: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Walk the user through creating the GitHub repo (interactive)**

In conversation with the user:
1. Create a new GitHub account if needed.
2. Create a new public repo named `ai-wrapped`.
3. Add the remote: `git remote add origin https://github.com/<USER>/ai-wrapped.git`.
4. Push: `git branch -M main && git push -u origin main`.
5. In repo Settings → Pages, set Source to "GitHub Actions".

- [ ] **Step 5: Sign up for GoatCounter and replace `<YOUR-CODE>` in `index.html`**

Walk the user through goatcounter.com signup, then edit `index.html` to use their site code. Commit and push.

- [ ] **Step 6: Verify the live site**

After the deploy workflow finishes, open `https://<USER>.github.io/ai-wrapped/` and smoke test end-to-end.

- [ ] **Step 7: Final commit + push**

```bash
git add .github/workflows/deploy.yml
git commit -m "chore: GitHub Pages deploy workflow"
git push
```

---

## Self-Review checklist (done)

- **Spec coverage:** Every slide from the spec (Numbers, Rhythm, Topics, Personality, Compare, Highlights, Share Card) has a task. Privacy story is enforced by the no-fetch architecture and documented in README. 12-month window is implemented in Task 6. Analytics is in Task 19. Bold/playful styling is baked into the CSS gradients.
- **Placeholder scan:** No "TBD" or "implement later". The only placeholders are real ones flagged for user input at deploy time: `<OWNER>` in README/LICENSE, `<YOUR-CODE>` in the GoatCounter script tag, `<USER>` in deploy walkthrough.
- **Type consistency:** `Conversation`, `Message`, `Stats`, `TopicScore`, `Archetype`, `Highlights`, `ReportData`, `SlideRenderer` all defined in their respective tasks and used consistently in later tasks. `pickArchetype(stats, topics)` signature matches between definition (Task 9) and call sites (Tasks 12, 18).
- **Decomposition:** Each file has one clear responsibility; no file is expected to exceed ~200 lines.
