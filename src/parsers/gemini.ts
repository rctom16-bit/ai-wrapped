import type { Conversation, Message, ParseResult } from "./types";

interface Activity {
  header?: string;
  title?: string;
  time?: string;
}

const THIRTY_MIN = 30 * 60 * 1000;

export function parseGeminiExport(raw: unknown): ParseResult {
  if (!Array.isArray(raw)) {
    throw new Error("Gemini export must be a JSON array of activity records");
  }
  const prompts: { text: string; ts: Date }[] = [];
  for (const a of raw as Activity[]) {
    if (!a.header || !a.title || !a.time) continue;
    if (!/gemini/i.test(a.header)) continue;
    const text = stripPrefix(a.title);
    if (!text) continue;
    prompts.push({ text, ts: new Date(a.time) });
  }
  prompts.sort((a, b) => a.ts.getTime() - b.ts.getTime());

  const conversations: Conversation[] = [];
  let current: Message[] = [];
  let currentStart: Date | null = null;
  let lastTs: Date | null = null;
  let convoIdx = 0;

  const flush = () => {
    if (current.length === 0 || !currentStart || !lastTs) return;
    conversations.push({
      id: `gemini-${convoIdx++}`,
      title: null,
      createdAt: currentStart,
      updatedAt: lastTs,
      messages: current,
      source: "gemini",
    });
    current = [];
    currentStart = null;
    lastTs = null;
  };

  for (const p of prompts) {
    if (lastTs && p.ts.getTime() - lastTs.getTime() > THIRTY_MIN) flush();
    if (currentStart === null) currentStart = p.ts;
    current.push({ role: "user", text: p.text, timestamp: p.ts });
    lastTs = p.ts;
  }
  flush();
  return { conversations, source: "gemini" };
}

function stripPrefix(s: string): string {
  return s.replace(/^Prompted:\s*/i, "").trim();
}
