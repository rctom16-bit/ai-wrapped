import { describe, it, expect } from "vitest";
import { computePatterns } from "../../src/analysis/patterns";
import type { Conversation, Message } from "../../src/parsers/types";

const u = (text: string, iso = "2025-01-01T12:00:00Z"): Message => ({ role: "user", text, timestamp: new Date(iso) });

function convo(...messages: Message[]): Conversation {
  return { id: "x", title: null, createdAt: messages[0]!.timestamp, updatedAt: messages.at(-1)!.timestamp, source: "chatgpt", messages };
}

describe("computePatterns", () => {
  it("counts top filler words across user messages", () => {
    const p = computePatterns([convo(
      u("like basically i was like, literally just like"),
      u("honestly basically actually"),
    )]);
    expect(p.fillerWords[0]!.word).toBe("like");
    expect(p.fillerWords[0]!.count).toBe(3);
  });

  it("counts 'make it better' loop instances", () => {
    const p = computePatterns([convo(
      u("make it shorter please"),
      u("now make it punchier"),
      u("try again, more concise"),
      u("ok that's fine"),
    )]);
    expect(p.makeItBetterCount).toBeGreaterThanOrEqual(3);
  });

  it("counts apologies to the AI", () => {
    const p = computePatterns([convo(
      u("sorry, i meant the other one"),
      u("oops my bad"),
      u("apologies for the confusion"),
      u("regular message"),
    )]);
    expect(p.apologyCount).toBe(3);
  });

  it("finds top greeting opener across conversations", () => {
    const p = computePatterns([
      convo(u("hi can you help me")),
      convo(u("hi what is rust")),
      convo(u("hey there")),
      convo(u("hello friend")),
      convo(u("hi gemini")),
    ]);
    expect(p.topGreeting.word).toBe("hi");
    expect(p.topGreeting.count).toBe(3);
  });

  it("reports shortest and longest user message in words", () => {
    const p = computePatterns([convo(
      u("hi"),
      u("this message is exactly nine words long right here"),
    )]);
    expect(p.shortestMessageWords).toBe(1);
    expect(p.longestMessageWords).toBe(9);
  });

  it("finds the day with the most messages", () => {
    const p = computePatterns([
      convo(u("a", "2025-03-10T08:00:00Z"), u("b", "2025-03-10T09:00:00Z"), u("c", "2025-03-10T10:00:00Z")),
      convo(u("d", "2025-04-01T08:00:00Z")),
    ]);
    expect(p.marathonDay.date).toBe("2025-03-10");
    expect(p.marathonDay.count).toBe(3);
  });
});
