import type { Conversation } from "../parsers/types";

const MS_DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","to","of","in","on","for","at","by","with","is","are","was","were","be","been","being","have","has","had","do","does","did","i","you","me","my","your","this","that","these","those","it","its","we","us","our","they","them","their","he","she","him","her","his","not","no","yes","so","as","can","could","would","should","will","just","what","when","where","how","why","who","which","there","here","then","than","very","really","also","like","get","got","go","goes","going","want","need","make","made","one","two","three","please","thanks","thank","hi","hey","hello","ok","okay","right","tell","know","think","mean","sure"
]);

export interface MonthlyBucket { month: string; count: number; }
export function computeMonthly(conversations: Conversation[]): MonthlyBucket[] {
  const counts = new Array<number>(12).fill(0);
  for (const c of conversations) {
    for (const m of c.messages) counts[m.timestamp.getUTCMonth()]!++;
  }
  return counts.map((count, i) => ({ month: MONTHS[i]!, count }));
}

export interface LongestGap { startDate: Date; endDate: Date; days: number; }
export function computeLongestGap(conversations: Conversation[]): LongestGap {
  const timestamps: number[] = [];
  for (const c of conversations) for (const m of c.messages) timestamps.push(m.timestamp.getTime());
  timestamps.sort((a, b) => a - b);
  let max = 0;
  let start = 0;
  let end = 0;
  for (let i = 1; i < timestamps.length; i++) {
    const gap = timestamps[i]! - timestamps[i - 1]!;
    if (gap > max) { max = gap; start = timestamps[i - 1]!; end = timestamps[i]!; }
  }
  return { startDate: new Date(start), endDate: new Date(end), days: Math.round(max / MS_DAY) };
}

export interface WordHit { word: string; count: number; }
export function computeWordCloud(conversations: Conversation[], limit = 40): WordHit[] {
  const counts = new Map<string, number>();
  for (const c of conversations) {
    for (const msg of c.messages) {
      if (msg.role !== "user") continue;
      for (const raw of msg.text.toLowerCase().split(/[^a-z']+/)) {
        const w = raw.replace(/^'+|'+$/g, "");
        if (w.length < 3) continue;
        if (STOPWORDS.has(w)) continue;
        counts.set(w, (counts.get(w) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([word, count]) => ({ word, count }));
}

export function computeHourByDay(conversations: Conversation[]): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => new Array<number>(24).fill(0));
  for (const c of conversations) {
    for (const m of c.messages) {
      const dow = m.timestamp.getUTCDay();
      const hour = m.timestamp.getUTCHours();
      grid[dow]![hour]!++;
    }
  }
  return grid;
}

export interface FirstMessage { date: Date; keywords: string; }
export function computeFirstMessage(conversations: Conversation[]): FirstMessage {
  let best: { ts: number; text: string } | null = null;
  for (const c of conversations) {
    for (const m of c.messages) {
      if (m.role !== "user") continue;
      const ts = m.timestamp.getTime();
      if (!best || ts < best.ts) best = { ts, text: m.text };
    }
  }
  if (!best) return { date: new Date(0), keywords: "—" };
  return { date: new Date(best.ts), keywords: best.text.trim().split(/\s+/).slice(0, 5).join(" ") };
}

export interface ReplyRatio { userAvg: number; assistantAvg: number; ratio: number; }
export function computeReplyLengthRatio(conversations: Conversation[]): ReplyRatio {
  let userWords = 0, userMsgs = 0, asstWords = 0, asstMsgs = 0;
  for (const c of conversations) {
    for (const m of c.messages) {
      const w = m.text.trim().split(/\s+/).filter(Boolean).length;
      if (m.role === "user") { userWords += w; userMsgs++; }
      else { asstWords += w; asstMsgs++; }
    }
  }
  const userAvg = userMsgs === 0 ? 0 : Math.round(userWords / userMsgs);
  const assistantAvg = asstMsgs === 0 ? 0 : Math.round(asstWords / asstMsgs);
  const ratio = userAvg === 0 ? 0 : Math.round((assistantAvg / userAvg) * 10) / 10;
  return { userAvg, assistantAvg, ratio };
}
