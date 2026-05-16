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
