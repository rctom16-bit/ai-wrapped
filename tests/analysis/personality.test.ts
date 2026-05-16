import { describe, it, expect } from "vitest";
import { pickArchetype } from "../../src/analysis/personality";
import type { Stats } from "../../src/analysis/stats";
import type { TopicScore } from "../../src/analysis/topics";

function s(overrides: Partial<Stats> = {}): Stats {
  return {
    conversationCount: 10,
    messageCount: 100,
    userWords: 500,
    assistantWords: 1000,
    hourly: new Array(24).fill(0).map((_, i) => (i === 23 ? 50 : 1)),
    peakHour: 23,
    dailyCounts: new Map(),
    longestStreak: 5,
    ...overrides,
  };
}

describe("pickArchetype", () => {
  it("picks Night Coder when top topic is Code and peak hour is late", () => {
    const topics: TopicScore[] = [{ name: "Code", score: 100 }];
    expect(pickArchetype({ stats: s(), topics }).id).toBe("night-coder");
  });

  it("picks Morning Thinker when peak hour is early", () => {
    const topics: TopicScore[] = [{ name: "Writing", score: 10 }];
    const stats = s({ peakHour: 7, hourly: new Array(24).fill(0).map((_, i) => (i === 7 ? 50 : 1)) });
    expect(pickArchetype({ stats, topics }).id).toBe("morning-thinker");
  });

  it("picks Recipe Hunter when Cooking dominates", () => {
    const topics: TopicScore[] = [{ name: "Cooking", score: 80 }];
    expect(pickArchetype({ stats: s(), topics }).id).toBe("recipe-hunter");
  });

  it("picks Power User on very high volume", () => {
    const stats = s({ messageCount: 8000 });
    const topics: TopicScore[] = [{ name: "Travel", score: 1 }];
    expect(pickArchetype({ stats, topics }).id).toBe("power-user");
  });

  it("falls back to Curious Polymath when nothing else matches", () => {
    const topics: TopicScore[] = [];
    const stats = s({ peakHour: 14, messageCount: 50 });
    expect(pickArchetype({ stats, topics }).id).toBe("polyglot");
  });

  it("picks Two-Tab Diplomat when user heavily uses both ChatGPT and Claude", () => {
    const topics: TopicScore[] = [];
    expect(pickArchetype({
      stats: s({ peakHour: 14 }),
      topics,
      hasChatGPT: true,
      hasClaude: true,
      chatgptMessageCount: 500,
      claudeMessageCount: 500,
    }).id).toBe("two-tab-diplomat");
  });

  it("picks Apologetic One when patterns show many apologies", () => {
    const topics: TopicScore[] = [];
    expect(pickArchetype({
      stats: s({ peakHour: 14, messageCount: 200 }),
      topics,
      patterns: {
        fillerWords: [], makeItBetterCount: 0, apologyCount: 20,
        topGreeting: { word: "hi", count: 1 }, shortestMessageWords: 1, longestMessageWords: 10,
        marathonDay: { date: "2025-01-01", count: 1 },
      },
    }).id).toBe("apologetic");
  });
});
