export type Source = "chatgpt" | "claude" | "grok" | "gemini";
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
