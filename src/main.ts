import { renderLanding } from "./ui/landing";
import { parseExport } from "./parsers/detect";
import type { Conversation } from "./parsers/types";
import { filterToLast12Months } from "./analysis/filter";
import { computeStats } from "./analysis/stats";
import { computeTopics } from "./analysis/topics";
import { pickArchetype } from "./analysis/personality";
import { computeHighlights } from "./analysis/highlights";
import { renderReport, type SlideRenderer } from "./ui/report";
import { numbersSlide } from "./ui/slides/numbers";
import { rhythmSlide } from "./ui/slides/rhythm";
import { topicsSlide } from "./ui/slides/topics";
import { personalitySlide } from "./ui/slides/personality";
import { compareSlide } from "./ui/slides/compare";
import { highlightsSlide } from "./ui/slides/highlights";
import { shareCardSlide } from "./ui/share-card";

const app = document.getElementById("app")!;

renderLanding(app, async (result) => {
  try {
    const all: Conversation[] = [];
    if (result.chatgptFile) all.push(...(await parseFile(result.chatgptFile)));
    if (result.claudeFile) all.push(...(await parseFile(result.claudeFile)));
    if (all.length === 0) throw new Error("No conversations found in that file.");

    const recent = filterToLast12Months(all);
    if (recent.length === 0) throw new Error("No conversations from the last 12 months.");

    const stats = computeStats(recent);
    const topics = computeTopics(recent);
    const archetype = pickArchetype(stats, topics);
    const highlights = computeHighlights(recent);

    const hasChatGPT = !!result.chatgptFile;
    const hasClaude = !!result.claudeFile;

    const slideRenderers: SlideRenderer[] = [
      numbersSlide,
      rhythmSlide,
      topicsSlide,
      personalitySlide,
      ...(hasChatGPT && hasClaude ? [compareSlide] : []),
      highlightsSlide,
      shareCardSlide,
    ];

    renderReport(app, { stats, topics, archetype, highlights, hasChatGPT, hasClaude }, slideRenderers);
  } catch (err) {
    showError(app, err instanceof Error ? err.message : String(err));
  }
});

async function parseFile(file: File): Promise<Conversation[]> {
  const text = await file.text();
  return parseExport(JSON.parse(text)).conversations;
}

function showError(root: HTMLElement, message: string): void {
  const banner = document.createElement("div");
  banner.className = "error-banner";
  banner.textContent = `Something went wrong: ${message}`;
  root.prepend(banner);
}
