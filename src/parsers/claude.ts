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
