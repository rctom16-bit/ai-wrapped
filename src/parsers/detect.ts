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
