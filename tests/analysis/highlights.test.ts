import { describe, it, expect } from "vitest";
import { computeHighlights } from "../../src/analysis/highlights";
import type { Conversation, Message } from "../../src/parsers/types";

const m = (role: "user" | "assistant", text: string, iso: string): Message => ({ role, text, timestamp: new Date(iso) });

describe("computeHighlights", () => {
  const data: Conversation[] = [
    { id: "a", title: null, source: "chatgpt", createdAt: new Date("2025-01-01"), updatedAt: new Date("2025-01-01"),
      messages: [m("user", "can you help me write a poem", "2025-01-01T08:00:00Z"), m("assistant", "sure", "2025-01-01T08:00:30Z")] },
    { id: "b", title: null, source: "chatgpt", createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01"),
      messages: Array.from({ length: 40 }, (_, i) => m(i % 2 === 0 ? "user" : "assistant", "msg", `2025-02-01T0${0}:0${0}:0${0}Z`)) },
    { id: "c", title: null, source: "chatgpt", createdAt: new Date("2025-03-01"), updatedAt: new Date("2025-03-01"),
      messages: [m("user", "can you help me find a job", "2025-03-01T09:00:00Z")] },
  ];

  it("finds the longest conversation by message count", () => {
    const h = computeHighlights(data);
    expect(h.longestConversation.messageCount).toBe(40);
  });

  it("finds the busiest day", () => {
    const h = computeHighlights(data);
    expect(h.busiestDay.date).toBe("2025-02-01");
    expect(h.busiestDay.messageCount).toBe(40);
  });

  it("finds the most common opening phrase from user messages", () => {
    const h = computeHighlights(data);
    expect(h.commonOpeningPhrase.toLowerCase()).toContain("can you help me");
  });
});
