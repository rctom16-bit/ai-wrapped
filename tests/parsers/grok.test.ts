import { describe, it, expect } from "vitest";
import { parseGrokExport } from "../../src/parsers/grok";
import fixture from "./fixtures/grok-minimal.json";

describe("parseGrokExport", () => {
  it("returns one conversation with two messages", () => {
    const result = parseGrokExport(fixture);
    expect(result.source).toBe("grok");
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0]!.messages).toHaveLength(2);
  });

  it("maps USER/ASSISTANT to user/assistant roles", () => {
    const { conversations } = parseGrokExport(fixture);
    expect(conversations[0]!.messages[0]!.role).toBe("user");
    expect(conversations[0]!.messages[1]!.role).toBe("assistant");
  });

  it("parses ISO timestamps", () => {
    const { conversations } = parseGrokExport(fixture);
    expect(conversations[0]!.createdAt.toISOString()).toBe("2025-09-10T14:00:00.000Z");
  });

  it("preserves message content", () => {
    const { conversations } = parseGrokExport(fixture);
    expect(conversations[0]!.messages[0]!.text).toMatch(/mars/);
  });
});
