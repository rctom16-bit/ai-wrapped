import { renderLanding, type LandingResult } from "./ui/landing";
import { parseExport } from "./parsers/detect";
import type { Conversation, Source } from "./parsers/types";
import { filterToLast12Months } from "./analysis/filter";
import { computeStats } from "./analysis/stats";
import { computeTopics } from "./analysis/topics";
import { pickArchetype } from "./analysis/personality";
import { computeHighlights } from "./analysis/highlights";
import { computeQuirks } from "./analysis/quirks";
import { computePatterns } from "./analysis/patterns";
import { computeMonthly, computeLongestGap, computeWordCloud, computeHourByDay, computeFirstMessage, computeReplyLengthRatio } from "./analysis/extras";
import { renderReport, type SlideRenderer } from "./ui/report";
import { numbersSlide } from "./ui/slides/numbers";
import { calendarSlide } from "./ui/slides/calendar";
import { rhythmSlide } from "./ui/slides/rhythm";
import { powerHourGridSlide } from "./ui/slides/power-hour-grid";
import { monthlyHeartbeatSlide } from "./ui/slides/monthly-heartbeat";
import { topicsSlide } from "./ui/slides/topics";
import { wordCloudSlide } from "./ui/slides/word-cloud";
import { quirksSlide } from "./ui/slides/quirks";
import { replyMismatchSlide } from "./ui/slides/reply-mismatch";
import { firstMessageSlide } from "./ui/slides/first-message";
import { comebackGapSlide } from "./ui/slides/comeback-gap";
import { personalitySlide } from "./ui/slides/personality";
import { compareSlide } from "./ui/slides/compare";
import { highlightsSlide } from "./ui/slides/highlights";
import { shareCardSlide } from "./ui/share-card";

const app = document.getElementById("app")!;

renderLanding(app, async (result) => {
  try {
    const all = await collectConversations(result);
    if (all.length === 0) throw new Error("No conversations found in those files.");

    const recent = filterToLast12Months(all);
    if (recent.length === 0) throw new Error("No conversations from the last 12 months.");

    const stats = computeStats(recent);
    const topics = computeTopics(recent);
    const quirks = computeQuirks(recent);
    const patterns = computePatterns(recent);
    const highlights = computeHighlights(recent);
    const monthly = computeMonthly(recent);
    const longestGap = computeLongestGap(recent);
    const topWords = computeWordCloud(recent, 40);
    const firstMessage = computeFirstMessage(recent);
    const replyRatio = computeReplyLengthRatio(recent);
    const hourByDay = computeHourByDay(recent);

    const hasChatGPT = !!result.chatgptFile;
    const hasClaude = !!result.claudeFile;
    const hasGrok = !!result.grokFile;
    const hasGemini = !!result.geminiFile;
    const chatgptMessageCount = countMessages(recent, "chatgpt");
    const claudeMessageCount = countMessages(recent, "claude");
    const grokMessageCount = countMessages(recent, "grok");
    const geminiMessageCount = countMessages(recent, "gemini");

    const archetype = pickArchetype({
      stats, topics, quirks, patterns,
      hasChatGPT, hasClaude, chatgptMessageCount, claudeMessageCount,
    });

    const sourcesUsed = [hasChatGPT, hasClaude, hasGrok, hasGemini].filter(Boolean).length;

    const slideRenderers: SlideRenderer[] = [
      numbersSlide,
      calendarSlide,
      monthlyHeartbeatSlide,
      rhythmSlide,
      powerHourGridSlide,
      topicsSlide,
      wordCloudSlide,
      quirksSlide,
      replyMismatchSlide,
      firstMessageSlide,
      comebackGapSlide,
      personalitySlide,
      ...(sourcesUsed >= 2 ? [compareSlide] : []),
      highlightsSlide,
      shareCardSlide,
    ];

    renderReport(
      app,
      {
        stats, topics, archetype, highlights, quirks, patterns,
        monthly, longestGap, topWords, firstMessage, replyRatio, hourByDay,
        hasChatGPT, hasClaude, hasGrok, hasGemini,
        chatgptMessageCount, claudeMessageCount, grokMessageCount, geminiMessageCount,
      },
      slideRenderers,
    );
  } catch (err) {
    showError(app, err instanceof Error ? err.message : String(err));
  }
});

async function collectConversations(result: LandingResult): Promise<Conversation[]> {
  const all: Conversation[] = [];
  for (const file of [result.chatgptFile, result.claudeFile, result.grokFile, result.geminiFile]) {
    if (file) all.push(...(await parseFile(file)));
  }
  return all;
}

async function parseFile(file: File): Promise<Conversation[]> {
  const text = await file.text();
  return parseExport(JSON.parse(text)).conversations;
}

function countMessages(conversations: Conversation[], source: Source): number {
  let n = 0;
  for (const c of conversations) if (c.source === source) n += c.messages.length;
  return n;
}

function showError(root: HTMLElement, message: string): void {
  const banner = document.createElement("div");
  banner.className = "error-banner";
  banner.textContent = `Something went wrong: ${message}`;
  root.prepend(banner);
}
