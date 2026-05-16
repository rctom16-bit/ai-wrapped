import type { Stats } from "./stats";
import type { TopicScore } from "./topics";
import type { Quirks } from "./quirks";
import type { Patterns } from "./patterns";
import archetypes from "./archetypes.json";

export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
}

export interface PersonalitySignals {
  stats: Stats;
  topics: TopicScore[];
  quirks?: Quirks;
  patterns?: Patterns;
  hasChatGPT?: boolean;
  hasClaude?: boolean;
  chatgptMessageCount?: number;
  claudeMessageCount?: number;
}

const ARCHETYPES = archetypes as Archetype[];

function byId(id: string): Archetype {
  const a = ARCHETYPES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown archetype: ${id}`);
  return a;
}

const topTopic = (topics: TopicScore[]) => topics[0]?.name ?? null;

interface Rule {
  id: string;
  match: (s: PersonalitySignals) => boolean;
}

const RULES: Rule[] = [
  { id: "power-user",         match: ({ stats }) => stats.messageCount >= 5000 },
  { id: "two-tab-diplomat",   match: ({ hasChatGPT, hasClaude, chatgptMessageCount, claudeMessageCount }) =>
      !!hasChatGPT && !!hasClaude && (chatgptMessageCount ?? 0) > 100 && (claudeMessageCount ?? 0) > 100 },
  { id: "insomniac",          match: ({ stats }) => stats.peakHour >= 2 && stats.peakHour <= 4 },
  { id: "night-coder",        match: ({ stats, topics }) => topTopic(topics) === "Code" && stats.peakHour >= 21 },
  { id: "morning-thinker",    match: ({ stats }) => stats.peakHour >= 5 && stats.peakHour <= 9 },
  { id: "apologetic",         match: ({ patterns }) => !!patterns && patterns.apologyCount >= 15 },
  { id: "polite-one",         match: ({ quirks }) => !!quirks && quirks.politenessCount >= 25 },
  { id: "emoji-poet",         match: ({ quirks }) => !!quirks && quirks.emojiCount >= 30 },
  { id: "question-machine",   match: ({ quirks }) => !!quirks && quirks.questionRate >= 0.7 },
  { id: "make-it-better",     match: ({ patterns }) => !!patterns && patterns.makeItBetterCount >= 40 },
  { id: "comma-splicer",      match: ({ patterns }) => !!patterns && patterns.longestMessageWords >= 400 },
  { id: "deep-diver",         match: ({ quirks }) => !!quirks && quirks.avgUserMessageWords >= 80 },
  { id: "existential",        match: ({ stats, quirks }) => !!quirks && stats.messageCount < 100 && quirks.avgUserMessageWords >= 50 && quirks.questionRate >= 0.6 },
  { id: "first-draft-forever",match: ({ topics, patterns }) => topTopic(topics) === "Writing" && !!patterns && patterns.makeItBetterCount >= 20 },
  { id: "couch-detective",    match: ({ topics, quirks }) => topTopic(topics) === "Entertainment" && !!quirks && quirks.questionRate >= 0.55 },
  { id: "soft-launch",        match: ({ topics, stats, quirks }) => topTopic(topics) === "Relationships" && stats.messageCount >= 80 && !!quirks && quirks.avgUserMessageWords < 35 },
  { id: "heart-whisperer",    match: ({ topics }) => topTopic(topics) === "Relationships" },
  { id: "pantry-improviser",  match: ({ topics, stats, quirks }) => topTopic(topics) === "Cooking" && stats.messageCount >= 50 && !!quirks && quirks.avgUserMessageWords < 25 },
  { id: "recipe-hunter",      match: ({ topics }) => topTopic(topics) === "Cooking" },
  { id: "travel-planner",     match: ({ topics }) => topTopic(topics) === "Travel" },
  { id: "pet-parent",         match: ({ topics }) => topTopic(topics) === "Pets" },
  { id: "career-climber",     match: ({ topics }) => topTopic(topics) === "Work" },
  { id: "wellness-geek",      match: ({ topics }) => topTopic(topics) === "Health" || topTopic(topics) === "Fitness" },
  { id: "wordsmith",          match: ({ topics }) => topTopic(topics) === "Writing" },
  { id: "lifelong-learner",   match: ({ topics }) => topTopic(topics) === "Learning" },
  { id: "money-mind",         match: ({ topics }) => topTopic(topics) === "Finance" },
  { id: "tinkerer",           match: ({ topics }) => topTopic(topics) === "Home" },
  { id: "renaissance",        match: ({ topics }) => topics.length >= 5 && (topics[0]?.score ?? 0) < (topics[1]?.score ?? 0) * 1.6 },
  { id: "hyperfixator",       match: ({ stats, topics }) => stats.longestStreak >= 14 && topics.length > 0 && (topics[0]?.score ?? 0) > (topics[1]?.score ?? 0) * 3 },
  { id: "weekend-warrior",    match: ({ stats }) => isWeekendDominant(stats) },
  { id: "lurker",             match: ({ stats }) => stats.messageCount < 50 },
];

export function pickArchetype(signals: PersonalitySignals): Archetype {
  for (const r of RULES) {
    if (r.match(signals)) return byId(r.id);
  }
  return byId("polyglot");
}

function isWeekendDominant(stats: Stats): boolean {
  let weekend = 0;
  let weekday = 0;
  for (const [day, count] of stats.dailyCounts) {
    const dow = new Date(day + "T00:00:00Z").getUTCDay();
    if (dow === 0 || dow === 6) weekend += count;
    else weekday += count;
  }
  return weekend > weekday;
}
