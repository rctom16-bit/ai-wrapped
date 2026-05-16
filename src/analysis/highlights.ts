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
