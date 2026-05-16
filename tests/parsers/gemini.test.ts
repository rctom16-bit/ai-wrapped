import { describe, it, expect } from "vitest";
import { parseGeminiExport } from "../../src/parsers/gemini";
import fixture from "./fixtures/gemini-minimal.json";

describe("parseGeminiExport", () => {
  it("returns source 'gemini'", () => {
    expect(parseGeminiExport(fixture).source).toBe("gemini");
  });

  it("groups activities within 30 minutes into one conversation", () => {
    const { conversations } = parseGeminiExport(fixture);
    expect(conversations).toHaveLength(2);
    expect(conversations[0]!.messages).toHaveLength(2);
    expect(conversations[1]!.messages).toHaveLength(1);
  });

  it("strips the 'Prompted: ' prefix from message text", () => {
    const { conversations } = parseGeminiExport(fixture);
    expect(conversations[0]!.messages[0]!.text).toBe("explain entropy simply");
  });

  it("marks all messages as user role (Takeout has no replies)", () => {
    const { conversations } = parseGeminiExport(fixture);
    for (const c of conversations) {
      for (const m of c.messages) expect(m.role).toBe("user");
    }
  });

  it("ignores activities from non-Gemini products", () => {
    const mixed = [
      { "header": "Search", "title": "weather london", "time": "2025-11-04T09:00:00Z" },
      { "header": "Gemini Apps", "title": "Prompted: hi gemini", "time": "2025-11-04T09:10:00Z" },
    ];
    const { conversations } = parseGeminiExport(mixed);
    expect(conversations).toHaveLength(1);
    expect(conversations[0]!.messages).toHaveLength(1);
  });
});
