import { describe, it, expect } from "vitest";
import { parseExport, detectFormat } from "../../src/parsers/detect";
import chatgptFixture from "./fixtures/chatgpt-minimal.json";
import claudeFixture from "./fixtures/claude-minimal.json";

describe("detectFormat", () => {
  it("identifies a ChatGPT export by the presence of `mapping`", () => {
    expect(detectFormat(chatgptFixture)).toBe("chatgpt");
  });

  it("identifies a Claude export by the presence of `chat_messages`", () => {
    expect(detectFormat(claudeFixture)).toBe("claude");
  });

  it("throws on unknown shape", () => {
    expect(() => detectFormat({ random: "data" })).toThrow();
    expect(() => detectFormat([])).toThrow();
  });
});

describe("parseExport", () => {
  it("dispatches to ChatGPT parser", () => {
    const r = parseExport(chatgptFixture);
    expect(r.source).toBe("chatgpt");
  });

  it("dispatches to Claude parser", () => {
    const r = parseExport(claudeFixture);
    expect(r.source).toBe("claude");
  });
});
