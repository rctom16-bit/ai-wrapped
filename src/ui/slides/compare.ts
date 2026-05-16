import type { ReportData } from "../report";

interface AiInfo { key: string; name: string; count: number; color: string; }

export function compareSlide(data: ReportData): HTMLElement | null {
  const all: AiInfo[] = [
    { key: "chatgpt", name: "ChatGPT", count: data.chatgptMessageCount, color: "#10a37f" },
    { key: "claude",  name: "Claude",  count: data.claudeMessageCount,  color: "#d97757" },
    { key: "grok",    name: "Grok",    count: data.grokMessageCount,    color: "#1d1d1f" },
    { key: "gemini",  name: "Gemini",  count: data.geminiMessageCount,  color: "#4285f4" },
  ].filter((a) => a.count > 0);

  if (all.length < 2) return null;

  const el = document.createElement("div");
  el.className = "slide-card theme-compare";
  const cards = all.map((a) => `
    <div class="compare-card" style="border-color: ${a.color}33;">
      <div class="label-sm">${a.name}</div>
      <div class="big" style="color:${a.color}" data-count-to="${a.count}">0</div>
      <div class="label-sm" style="opacity:0.6">messages</div>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="label">You use ${all.length} different AIs</div>
    <h2 class="compare-title">${all.map((a) => a.name).join(" · ")}</h2>
    <p class="compare-blurb">Different tools, different vibes. We see you.</p>
    <div class="compare-grid compare-${all.length}">
      ${cards}
    </div>
  `;
  return el;
}
