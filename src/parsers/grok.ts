import type { Conversation, Message, ParseResult, Role } from "./types";

interface RawMessage {
  sender: string;
  content?: string;
  text?: string;
  createdAt: string;
}

interface RawConversation {
  id: string;
  title: string | null;
  createdAt: string;
  messages: RawMessage[];
}

export function parseGrokExport(raw: unknown): ParseResult {
  if (!Array.isArray(raw)) {
    throw new Error("Grok export must be a JSON array of conversations");
  }
  const conversations: Conversation[] = [];
  for (const item of raw as RawConversation[]) {
    const messages: Message[] = [];
    for (const m of item.messages ?? []) {
      const role = mapSender(m.sender);
      if (!role) continue;
      const text = (m.content ?? m.text ?? "").trim();
      if (!text) continue;
      messages.push({ role, text, timestamp: new Date(m.createdAt) });
    }
    if (messages.length === 0) continue;
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    conversations.push({
      id: item.id,
      title: item.title,
      createdAt: new Date(item.createdAt),
      updatedAt: messages.at(-1)!.timestamp,
      messages,
      source: "grok",
    });
  }
  return { conversations, source: "grok" };
}

function mapSender(s: string | undefined): Role | null {
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower === "user" || lower === "human") return "user";
  if (lower === "assistant" || lower === "grok" || lower === "ai") return "assistant";
  return null;
}
