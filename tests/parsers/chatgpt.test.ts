import { describe, it, expect } from "vitest";
import { parseChatGPTExport } from "../../src/parsers/chatgpt";
import fixture from "./fixtures/chatgpt-minimal.json";

describe("parseChatGPTExport", () => {
  it("returns one conversation with two messages", () => {
    const result = parseChatGPTExport(fixture);
    expect(result.source).toBe("chatgpt");
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0]!.messages).toHaveLength(2);
  });

  it("flattens the mapping tree in chronological order", () => {
    const { conversations } = parseChatGPTExport(fixture);
    const [c] = conversations;
    expect(c!.messages[0]!.role).toBe("user");
    expect(c!.messages[0]!.text).toBe("how do i make carbonara?");
    expect(c!.messages[1]!.role).toBe("assistant");
  });

  it("parses unix timestamps to Date objects", () => {
    const { conversations } = parseChatGPTExport(fixture);
    expect(conversations[0]!.createdAt.getTime()).toBe(1700000000 * 1000);
  });

  it("captures model when present", () => {
    const { conversations } = parseChatGPTExport(fixture);
    expect(conversations[0]!.model).toBe("gpt-4");
  });

  it("skips messages with null author (system/root nodes)", () => {
    const { conversations } = parseChatGPTExport(fixture);
    expect(conversations[0]!.messages.every((m) => m.role === "user" || m.role === "assistant")).toBe(true);
  });
});
