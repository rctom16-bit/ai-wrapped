import { describe, it, expect } from "vitest";
import { computeQuirks } from "../../src/analysis/quirks";
import type { Conversation } from "../../src/parsers/types";

function convo(...texts: { role: "user" | "assistant"; text: string }[]): Conversation {
  return {
    id: "x", title: null, createdAt: new Date(), updatedAt: new Date(), source: "chatgpt",
    messages: texts.map((t) => ({ ...t, timestamp: new Date() })),
  };
}

describe("computeQuirks", () => {
  it("counts polite words across user messages", () => {
    const q = computeQuirks([convo(
      { role: "user", text: "please can you help, thanks" },
      { role: "assistant", text: "sure thanks" },
      { role: "user", text: "thank you, i appreciate it" },
    )]);
    expect(q.politenessCount).toBe(4);
  });

  it("computes question rate from user messages ending in ?", () => {
    const q = computeQuirks([convo(
      { role: "user", text: "what is rust?" },
      { role: "user", text: "okay" },
      { role: "user", text: "really?" },
    )]);
    expect(q.questionRate).toBeCloseTo(2 / 3, 2);
  });

  it("counts emojis in user messages", () => {
    const q = computeQuirks([convo(
      { role: "user", text: "hi 🌙 wow 🚀" },
      { role: "assistant", text: "ok 🤖" },
    )]);
    expect(q.emojiCount).toBe(2);
  });

  it("counts paired code blocks via triple backticks", () => {
    const q = computeQuirks([convo(
      { role: "user", text: "fix this:\n```js\nconsole.log()\n```" },
      { role: "user", text: "and this ```py\nprint(1)\n```" },
    )]);
    expect(q.codeBlockCount).toBe(2);
  });

  it("estimates hours from typing + reading speeds", () => {
    const q = computeQuirks([convo(
      { role: "user", text: Array(350).fill("word").join(" ") },        // 10 min typing
      { role: "assistant", text: Array(2500).fill("word").join(" ") },  // 10 min reading
    )]);
    expect(q.hoursSpent).toBeGreaterThan(0.2);
    expect(q.hoursSpent).toBeLessThan(0.5);
  });
});
