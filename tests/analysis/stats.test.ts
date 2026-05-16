import { describe, it, expect } from "vitest";
import { computeStats } from "../../src/analysis/stats";
import type { Conversation } from "../../src/parsers/types";

function msg(role: "user" | "assistant", text: string, isoTime: string): Conversation["messages"][number] {
  return { role, text, timestamp: new Date(isoTime) };
}

function convo(id: string, ...messages: Conversation["messages"]): Conversation {
  return {
    id, title: null, source: "chatgpt",
    createdAt: messages[0]!.timestamp,
    updatedAt: messages.at(-1)!.timestamp,
    messages,
  };
}

describe("computeStats", () => {
  const data: Conversation[] = [
    convo("a",
      msg("user", "hello there friend", "2025-01-01T08:00:00Z"),
      msg("assistant", "hi! how can I help", "2025-01-01T08:00:30Z")),
    convo("b",
      msg("user", "what is rust", "2025-01-02T23:30:00Z"),
      msg("assistant", "a systems language", "2025-01-02T23:30:10Z")),
  ];

  it("counts conversations and messages", () => {
    const s = computeStats(data);
    expect(s.conversationCount).toBe(2);
    expect(s.messageCount).toBe(4);
  });

  it("counts user vs assistant words separately", () => {
    const s = computeStats(data);
    expect(s.userWords).toBe(6);
    expect(s.assistantWords).toBe(8);
  });

  it("returns 24-bucket hourly histogram in UTC", () => {
    const s = computeStats(data);
    expect(s.hourly).toHaveLength(24);
    expect(s.hourly[8]).toBe(2);
    expect(s.hourly[23]).toBe(2);
  });

  it("finds the peak hour", () => {
    const s = computeStats(data);
    expect([8, 23]).toContain(s.peakHour);
  });

  it("computes per-day counts", () => {
    const s = computeStats(data);
    expect(s.dailyCounts.get("2025-01-01")).toBe(2);
    expect(s.dailyCounts.get("2025-01-02")).toBe(2);
  });

  it("reports longest active streak in days", () => {
    const s = computeStats(data);
    expect(s.longestStreak).toBe(2);
  });
});
