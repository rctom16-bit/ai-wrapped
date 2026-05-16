import type { ParseResult, Source } from "./types";
import { parseChatGPTExport } from "./chatgpt";
import { parseClaudeExport } from "./claude";
import { parseGrokExport } from "./grok";
import { parseGeminiExport } from "./gemini";

export function detectFormat(raw: unknown): Source {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Export must be a non-empty JSON array.");
  }
  const sample = raw[0] as Record<string, unknown>;
  if (!sample || typeof sample !== "object") {
    throw new Error("Could not detect export format.");
  }
  if ("mapping" in sample) return "chatgpt";
  if ("chat_messages" in sample) return "claude";
  if ("messages" in sample && "createdAt" in sample) return "grok";
  if ("header" in sample && "time" in sample) return "gemini";
  throw new Error("Could not detect ChatGPT, Claude, Grok, or Gemini export format.");
}

export function parseExport(raw: unknown): ParseResult {
  const fmt = detectFormat(raw);
  switch (fmt) {
    case "chatgpt": return parseChatGPTExport(raw);
    case "claude":  return parseClaudeExport(raw);
    case "grok":    return parseGrokExport(raw);
    case "gemini":  return parseGeminiExport(raw);
  }
}
