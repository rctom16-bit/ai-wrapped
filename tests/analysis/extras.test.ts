import { describe, it, expect } from "vitest";
import { computeMonthly, computeLongestGap, computeWordCloud, computeHourByDay, computeFirstMessage, computeReplyLengthRatio } from "../../src/analysis/extras";
import type { Conversation, Message } from "../../src/parsers/types";

const m = (role: "user" | "assistant", text: string, iso: string): Message => ({ role, text, timestamp: new Date(iso) });
const c = (...messages: Message[]): Conversation => ({ id: "x", title: null, createdAt: messages[0]!.timestamp, updatedAt: messages.at(-1)!.timestamp, source: "chatgpt", messages });

describe("computeMonthly", () => {
  it("returns 12 entries, indexed Jan..Dec with message counts", () => {
    const data = [
      c(m("user", "a", "2025-01-15T00:00:00Z")),
      c(m("user", "b", "2025-01-16T00:00:00Z")),
      c(m("user", "c", "2025-07-01T00:00:00Z")),
    ];
    const monthly = computeMonthly(data);
    expect(monthly).toHaveLength(12);
    expect(monthly[0]!.month).toBe("Jan");
    expect(monthly[0]!.count).toBe(2);
    expect(monthly[6]!.count).toBe(1);
  });
});

describe("computeLongestGap", () => {
  it("finds the longest gap between consecutive messages", () => {
    const data = [
      c(m("user", "first", "2025-01-01T08:00:00Z")),
      c(m("user", "after-gap", "2025-02-15T08:00:00Z")),
      c(m("user", "soon-after", "2025-02-16T08:00:00Z")),
    ];
    const g = computeLongestGap(data);
    expect(g.days).toBe(45);
    expect(g.endDate.toISOString().slice(0, 10)).toBe("2025-02-15");
  });
});

describe("computeWordCloud", () => {
  it("returns top user words excluding common stopwords", () => {
    const data = [c(
      m("user", "build a rocket about rockets and rocket science", "2025-01-01T00:00:00Z"),
      m("user", "rocket fuel and chemistry chemistry chemistry", "2025-01-01T00:01:00Z"),
    )];
    const words = computeWordCloud(data, 5);
    const top = words.map((w) => w.word);
    expect(top[0]).toBe("chemistry");
    expect(top).toContain("rocket");
    expect(top).not.toContain("a");
    expect(top).not.toContain("and");
  });
});

describe("computeHourByDay", () => {
  it("returns 7x24 grid of message counts", () => {
    const data = [c(
      m("user", "a", "2025-01-06T09:00:00Z"),
      m("user", "b", "2025-01-06T09:30:00Z"),
      m("user", "c", "2025-01-07T22:00:00Z"),
    )];
    const grid = computeHourByDay(data);
    expect(grid).toHaveLength(7);
    expect(grid[0]).toHaveLength(24);
    expect(grid[1]![9]).toBe(2);
    expect(grid[2]![22]).toBe(1);
  });
});

describe("computeFirstMessage", () => {
  it("returns the earliest user message date and first 5 words", () => {
    const data = [
      c(m("user", "hello how are you doing today", "2025-03-01T08:00:00Z")),
      c(m("user", "earliest one here", "2025-01-04T09:47:00Z")),
    ];
    const f = computeFirstMessage(data);
    expect(f.date.toISOString().slice(0, 10)).toBe("2025-01-04");
    expect(f.keywords).toBe("earliest one here");
  });
});

describe("computeReplyLengthRatio", () => {
  it("returns avg user words, avg AI words, and ratio", () => {
    const data = [c(
      m("user", "a b c", "2025-01-01T00:00:00Z"),
      m("assistant", "one two three four five six seven eight nine ten eleven twelve", "2025-01-01T00:00:30Z"),
    )];
    const r = computeReplyLengthRatio(data);
    expect(r.userAvg).toBe(3);
    expect(r.assistantAvg).toBe(12);
    expect(r.ratio).toBe(4);
  });
});
