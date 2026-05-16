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
