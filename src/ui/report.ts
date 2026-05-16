import type { Stats } from "../analysis/stats";
import type { TopicScore } from "../analysis/topics";
import type { Archetype } from "../analysis/personality";
import type { Highlights } from "../analysis/highlights";
import type { Quirks } from "../analysis/quirks";
import type { Patterns } from "../analysis/patterns";
import type { MonthlyBucket, LongestGap, WordHit, FirstMessage, ReplyRatio } from "../analysis/extras";
import { observeReveals } from "./animate";

export interface ReportData {
  stats: Stats;
  topics: TopicScore[];
  archetype: Archetype;
  highlights: Highlights;
  quirks: Quirks;
  patterns: Patterns;
  monthly: MonthlyBucket[];
  longestGap: LongestGap;
  topWords: WordHit[];
  firstMessage: FirstMessage;
  replyRatio: ReplyRatio;
  hourByDay: number[][];
  hasChatGPT: boolean;
  hasClaude: boolean;
  hasGrok: boolean;
  hasGemini: boolean;
  chatgptMessageCount: number;
  claudeMessageCount: number;
  grokMessageCount: number;
  geminiMessageCount: number;
}

export type SlideRenderer = (data: ReportData) => HTMLElement | null;

export function renderReport(root: HTMLElement, data: ReportData, slides: SlideRenderer[]): void {
  root.innerHTML = `<div class="report"></div>`;
  const container = root.querySelector<HTMLDivElement>(".report")!;
  for (const slide of slides) {
    const el = slide(data);
    if (el) container.appendChild(wrap(el));
  }
  setupKeyboardNav(container);
  observeReveals(container);
  const first = container.querySelector<HTMLElement>(".slide");
  if (first) first.classList.add("is-visible");
}

function wrap(el: HTMLElement): HTMLElement {
  const wrapper = document.createElement("section");
  wrapper.className = "slide";
  wrapper.appendChild(el);
  return wrapper;
}

function setupKeyboardNav(container: HTMLElement): void {
  const sections = () => Array.from(container.querySelectorAll<HTMLElement>(".slide"));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const dir = e.key === "ArrowDown" ? 1 : -1;
    const list = sections();
    const i = list.findIndex((s) => Math.abs(s.getBoundingClientRect().top) < window.innerHeight / 2);
    const next = list[Math.max(0, Math.min(list.length - 1, i + dir))];
    next?.scrollIntoView({ behavior: "smooth" });
  });
}
