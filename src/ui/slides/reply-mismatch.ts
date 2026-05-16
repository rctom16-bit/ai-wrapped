import type { ReportData } from "../report";

export function replyMismatchSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-mismatch";
  const r = data.replyRatio;
  const userWidth = 100;
  const assistantWidth = Math.min(100, userWidth * Math.max(1, r.ratio));

  el.innerHTML = `
    <div class="label">The asymmetry of attention</div>
    <h2 class="mismatch-title">You wrote ${r.userAvg.toLocaleString()} words on average</h2>
    <div class="bar-row">
      <span class="bar-label">YOU</span>
      <div class="bar bar-user" style="width:${userWidth}px"></div>
      <span class="bar-value">${r.userAvg.toLocaleString()}</span>
    </div>
    <div class="bar-row">
      <span class="bar-label">AI</span>
      <div class="bar bar-ai" style="width:${assistantWidth}%"></div>
      <span class="bar-value">${r.assistantAvg.toLocaleString()}</span>
    </div>
    <p class="mismatch-blurb">The AI replied with ${r.ratio >= 1 ? `<strong>${r.ratio}×</strong>` : "fewer"} as many words. Per message.</p>
  `;
  return el;
}
