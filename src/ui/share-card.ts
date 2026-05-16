import { toPng } from "html-to-image";
import type { ReportData } from "./report";

export function shareCardSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">Save your share card</div>
    <div id="share-card" class="share-card">
      <div class="sc-header">AI Wrapped • 2026</div>
      <div class="sc-archetype">${data.archetype.emoji}</div>
      <div class="sc-name">${data.archetype.name}</div>
      <div class="sc-stats">
        <div><strong>${data.stats.conversationCount.toLocaleString()}</strong> conversations</div>
        <div><strong>${data.stats.messageCount.toLocaleString()}</strong> messages</div>
        <div>Top topic: <strong>${data.topics[0]?.name ?? "—"}</strong></div>
      </div>
      <div class="sc-footer">ai-wrapped</div>
    </div>
    <button class="primary" id="download-card" style="margin-top:24px;">Download PNG</button>
  `;
  setTimeout(() => {
    const btn = el.querySelector<HTMLButtonElement>("#download-card")!;
    const card = el.querySelector<HTMLDivElement>("#share-card")!;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Rendering…";
      try {
        const dataUrl = await toPng(card, { pixelRatio: 2 });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "ai-wrapped.png";
        a.click();
      } finally {
        btn.disabled = false;
        btn.textContent = "Download PNG";
      }
    });
  }, 0);
  return el;
}
