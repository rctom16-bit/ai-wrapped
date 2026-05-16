import type { Conversation } from "../parsers/types";

export interface Stats {
  conversationCount: number;
  messageCount: number;
  userWords: number;
  assistantWords: number;
  hourly: number[];
  peakHour: number;
  dailyCounts: Map<string, number>;
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
