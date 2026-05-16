import { describe, it, expect } from "vitest";
import { parseClaudeExport } from "../../src/parsers/claude";
import fixture from "./fixtures/claude-minimal.json";

describe("parseClaudeExport", () => {
  it("returns one conversation with two messages", () => {
    const result = parseClaudeExport(fixture);
    expect(result.source).toBe("claude");
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0]!.messages).toHaveLength(2);
  });

  it("maps sender to role", () => {
    const { conversations } = parseClaudeExport(fixture);
    expect(conversations[0]!.messages[0]!.role).toBe("user");
    expect(conversations[0]!.messages[1]!.role).toBe("assistant");
  });

  it("parses ISO timestamps", () => {
    const { conversations } = parseClaudeExport(fixture);
    expect(conversations[0]!.createdAt.toISOString()).toBe("2025-03-01T10:00:00.000Z");
  });

  it("preserves message text", () => {
    const { conversations } = parseClaudeExport(fixture);
    expect(conversations[0]!.messages[0]!.text).toMatch(/long weekend/);
  });
});
