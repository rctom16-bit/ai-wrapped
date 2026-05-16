import type { Conversation } from "../parsers/types";
import categories from "./categories.json";

export interface TopicScore {
  name: string;
  score: number;
}

export function computeTopics(conversations: Conversation[]): TopicScore[] {
  const dict = categories as Record<string, string[]>;
  const scores = new Map<string, number>();
  for (const [name] of Object.entries(dict)) scores.set(name, 0);

  for (const c of conversations) {
    for (const m of c.messages) {
      if (m.role !== "user") continue;
      const lower = m.text.toLowerCase();
      for (const [name, words] of Object.entries(dict)) {
        let hits = 0;
        for (const w of words) {
          if (lower.includes(w)) hits++;
        }
        if (hits > 0) scores.set(name, (scores.get(name) ?? 0) + hits);
      }
    }
  }

  return [...scores.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, score]) => ({ name, score }));
}
