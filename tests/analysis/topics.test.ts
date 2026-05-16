import { describe, it, expect } from "vitest";
import { computeTopics } from "../../src/analysis/topics";
import type { Conversation, Message } from "../../src/parsers/types";

const u = (text: string): Message => ({ role: "user", text, timestamp: new Date() });

function convo(...messages: Message[]): Conversation {
  return { id: "x", title: null, createdAt: new Date(), updatedAt: new Date(), source: "chatgpt", messages };
}

describe("computeTopics", () => {
  it("ranks the top topic by keyword hits in user messages", () => {
    const data = [
      convo(u("show me a python function with a bug"), u("debug this api error")),
      convo(u("how to deploy a rust library")),
      convo(u("what is a good recipe for pasta")),
    ];
    const topics = computeTopics(data);
    expect(topics[0]!.name).toBe("Code");
    expect(topics[0]!.score).toBeGreaterThan(topics[1]!.score);
  });

  it("returns at most 5 topics", () => {
    const data = [convo(u("recipe code travel job health book dog yoga"))];
    expect(computeTopics(data).length).toBeLessThanOrEqual(5);
  });

  it("ignores assistant messages", () => {
    const data: Conversation[] = [{
      id: "x", title: null, createdAt: new Date(), updatedAt: new Date(), source: "chatgpt",
      messages: [{ role: "assistant", text: "recipe code travel", timestamp: new Date() }],
    }];
    expect(computeTopics(data)).toHaveLength(0);
  });
});
