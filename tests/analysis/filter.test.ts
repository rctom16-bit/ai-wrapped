import { describe, it, expect } from "vitest";
import { filterToLast12Months } from "../../src/analysis/filter";
import type { Conversation } from "../../src/parsers/types";

function convo(daysAgo: number): Conversation {
  const t = new Date();
  t.setDate(t.getDate() - daysAgo);
  return {
    id: String(daysAgo),
    title: null,
    createdAt: t,
    updatedAt: t,
    messages: [{ role: "user", text: "hi", timestamp: t }],
    source: "chatgpt",
  };
}

describe("filterToLast12Months", () => {
  it("keeps conversations from the last 365 days", () => {
    const input = [convo(10), convo(100), convo(400)];
    const out = filterToLast12Months(input);
    expect(out).toHaveLength(2);
  });

  it("filters individual messages too", () => {
    const old = new Date();
    old.setDate(old.getDate() - 500);
    const recent = new Date();
    recent.setDate(recent.getDate() - 10);
    const c: Conversation = {
      id: "x", title: null, createdAt: old, updatedAt: recent, source: "chatgpt",
      messages: [
        { role: "user", text: "old", timestamp: old },
        { role: "assistant", text: "recent", timestamp: recent },
      ],
    };
    const [out] = filterToLast12Months([c]);
    expect(out!.messages).toHaveLength(1);
    expect(out!.messages[0]!.text).toBe("recent");
  });
});
