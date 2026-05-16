import type { ReportData } from "../report";

export function numbersSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-numbers";
  el.innerHTML = `
    <div class="label">You had</div>
    <div class="big-number" data-count-to="${data.stats.conversationCount}">0</div>
    <div class="label">conversations this year</div>
    <div class="numbers-grid">
      <div>
        <div class="num" data-count-to="${data.stats.messageCount}">0</div>
        <div class="sub">messages</div>
      </div>
      <div>
        <div class="num">${data.quirks.hoursSpent.toLocaleString()}h</div>
        <div class="sub">spent chatting</div>
      </div>
      <div>
        <div class="num" data-count-to="${data.stats.userWords}">0</div>
        <div class="sub">words from you</div>
      </div>
    </div>
  `;
  return el;
}
