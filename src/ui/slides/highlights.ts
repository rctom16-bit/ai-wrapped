import type { ReportData } from "../report";

export function highlightsSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">The highlights</div>
    <ul class="highlight-list">
      <li><span class="hl-num">${data.highlights.longestConversation.messageCount}</span><span class="hl-label">messages in your longest chat</span></li>
      <li><span class="hl-num">${data.highlights.busiestDay.messageCount}</span><span class="hl-label">messages on your busiest day (${data.highlights.busiestDay.date})</span></li>
      <li><span class="hl-num">"${escapeHtml(data.highlights.commonOpeningPhrase)}"</span><span class="hl-label">your most common opener</span></li>
    </ul>
  `;
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
