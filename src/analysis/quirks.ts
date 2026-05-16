import type { Conversation } from "../parsers/types";

export interface Quirks {
  politenessCount: number;       // "please", "thanks", "thank you", "appreciate"
  questionRate: number;          // 0..1 — fraction of user msgs ending in ?
  emojiCount: number;            // emoji chars in user messages
  codeBlockCount: number;        // occurrences of ``` pairs in user messages
  avgUserMessageWords: number;
  avgAssistantMessageWords: number;
  hoursSpent: number;            // estimate from typing + reading speed
}

const POLITE = /\b(please|thanks|thank you|appreciate)\b/gi;
const EMOJI_RE = /\p{Extended_Pictographic}/gu;

export function computeQuirks(conversations: Conversation[]): Quirks {
  let politenessCount = 0;
  let questions = 0;
  let userMessages = 0;
  let userWords = 0;
  let assistantMessages = 0;
  let assistantWords = 0;
  let emojiCount = 0;
  let backtickRuns = 0;

  for (const c of conversations) {
    for (const m of c.messages) {
      const words = countWords(m.text);
      if (m.role === "user") {
        userMessages++;
        userWords += words;
        const matches = m.text.match(POLITE);
        if (matches) politenessCount += matches.length;
        if (/\?\s*$/.test(m.text.trim())) questions++;
        const emojis = m.text.match(EMOJI_RE);
        if (emojis) emojiCount += emojis.length;
        const backticks = m.text.match(/```/g);
        if (backticks) backtickRuns += backticks.length;
      } else {
        assistantMessages++;
        assistantWords += words;
      }
    }
  }

  return {
    politenessCount,
    questionRate: userMessages === 0 ? 0 : questions / userMessages,
    emojiCount,
    codeBlockCount: Math.floor(backtickRuns / 2),
    avgUserMessageWords: userMessages === 0 ? 0 : Math.round(userWords / userMessages),
    avgAssistantMessageWords: assistantMessages === 0 ? 0 : Math.round(assistantWords / assistantMessages),
    hoursSpent: estimateHours(userWords, assistantWords),
  };
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// Estimate: user types at ~35 wpm; user reads AI replies at ~250 wpm.
function estimateHours(userWords: number, assistantWords: number): number {
  const minutes = userWords / 35 + assistantWords / 250;
  return Math.round((minutes / 60) * 10) / 10;
}
