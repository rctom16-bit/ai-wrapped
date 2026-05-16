import type { Conversation } from "../parsers/types";

export interface WordCount { word: string; count: number; }

export interface Patterns {
  fillerWords: WordCount[];
  makeItBetterCount: number;
  apologyCount: number;
  topGreeting: WordCount;
  shortestMessageWords: number;
  longestMessageWords: number;
  marathonDay: { date: string; count: number };
}

const FILLER_LIST = ["basically", "literally", "actually", "honestly", "essentially", "like", "just", "kinda", "sorta"];

const MAKE_IT_BETTER = /\b(make it (better|shorter|longer|punchier|simpler|funnier|more \w+|less \w+)|try again|redo|do (it|that) again|one more time|regenerate|another version)\b/i;

const APOLOGY = /^\s*(sorry|my bad|apologies|oops|whoops|sry)\b/i;

export function computePatterns(conversations: Conversation[]): Patterns {
  const fillerCounts = new Map<string, number>();
  for (const w of FILLER_LIST) fillerCounts.set(w, 0);

  const greetingCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();
  let makeIt = 0;
  let apologies = 0;
  let shortest = Number.POSITIVE_INFINITY;
  let longest = 0;

  for (const c of conversations) {
    let seenFirstUser = false;
    for (const m of c.messages) {
      if (m.role !== "user") continue;
      const text = m.text.trim();
      const lower = text.toLowerCase();

      for (const w of FILLER_LIST) {
        const re = new RegExp(`\\b${w}\\b`, "g");
        const hits = lower.match(re);
        if (hits) fillerCounts.set(w, (fillerCounts.get(w) ?? 0) + hits.length);
      }

      if (MAKE_IT_BETTER.test(text)) makeIt++;
      if (APOLOGY.test(text)) apologies++;

      const words = text.split(/\s+/).filter(Boolean).length;
      if (words > 0) {
        if (words < shortest) shortest = words;
        if (words > longest) longest = words;
      }

      const day = m.timestamp.toISOString().slice(0, 10);
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);

      if (!seenFirstUser) {
        seenFirstUser = true;
        const first = (lower.match(/^[a-z]+/)?.[0] ?? "").trim();
        if (first) greetingCounts.set(first, (greetingCounts.get(first) ?? 0) + 1);
      }
    }
  }

  const fillerWords = [...fillerCounts.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word, count]) => ({ word, count }));

  let topGreetingWord = "—";
  let topGreetingCount = 0;
  for (const [w, n] of greetingCounts) if (n > topGreetingCount) { topGreetingWord = w; topGreetingCount = n; }

  let marathonDay = "—";
  let marathonCount = 0;
  for (const [d, n] of dayCounts) if (n > marathonCount) { marathonDay = d; marathonCount = n; }

  return {
    fillerWords,
    makeItBetterCount: makeIt,
    apologyCount: apologies,
    topGreeting: { word: topGreetingWord, count: topGreetingCount },
    shortestMessageWords: shortest === Number.POSITIVE_INFINITY ? 0 : shortest,
    longestMessageWords: longest,
    marathonDay: { date: marathonDay, count: marathonCount },
  };
}
