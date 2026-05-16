import type { Stats } from "./stats";
import type { TopicScore } from "./topics";
import archetypes from "./archetypes.json";

export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
}

const ARCHETYPES = archetypes as Archetype[];

function byId(id: string): Archetype {
  const a = ARCHETYPES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown archetype: ${id}`);
  return a;
}

interface Rule {
  id: string;
  match: (stats: Stats, topics: TopicScore[]) => boolean;
}

const topTopic = (topics: TopicScore[]) => topics[0]?.name ?? null;

const RULES: Rule[] = [
  { id: "power-user",       match: (s) => s.messageCount >= 5000 },
  { id: "night-coder",      match: (s, t) => topTopic(t) === "Code" && s.peakHour >= 21 },
  { id: "morning-thinker",  match: (s) => s.peakHour >= 5 && s.peakHour <= 9 },
  { id: "recipe-hunter",    match: (_s, t) => topTopic(t) === "Cooking" },
  { id: "travel-planner",   match: (_s, t) => topTopic(t) === "Travel" },
  { id: "heart-whisperer",  match: (_s, t) => topTopic(t) === "Relationships" },
  { id: "career-climber",   match: (_s, t) => topTopic(t) === "Work" },
  { id: "wellness-geek",    match: (_s, t) => topTopic(t) === "Health" || topTopic(t) === "Fitness" },
  { id: "wordsmith",        match: (_s, t) => topTopic(t) === "Writing" },
  { id: "lifelong-learner", match: (_s, t) => topTopic(t) === "Learning" },
  { id: "money-mind",       match: (_s, t) => topTopic(t) === "Finance" },
  { id: "tinkerer",         match: (_s, t) => topTopic(t) === "Home" },
  { id: "weekend-warrior",  match: (s) => isWeekendDominant(s) },
  { id: "lurker",           match: (s) => s.messageCount < 50 },
];

export function pickArchetype(stats: Stats, topics: TopicScore[]): Archetype {
  for (const r of RULES) {
    if (r.match(stats, topics)) return byId(r.id);
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
