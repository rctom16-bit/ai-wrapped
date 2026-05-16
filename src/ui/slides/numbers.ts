import type { ReportData } from "../report";

export function numbersSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">You had</div>
    <div class="big-number">${data.stats.conversationCount.toLocaleString()}</div>
    <div class="label">conversations this year</div>
    <div class="numbers-grid">
      <div><div class="num">${data.stats.messageCount.toLocaleString()}</div><div class="sub">messages</div></div>
      <div><div class="num">${data.stats.userWords.toLocaleString()}</div><div class="sub">words from you</div></div>
      <div><div class="num">${data.stats.assistantWords.toLocaleString()}</div><div class="sub">words from AI</div></div>
    </div>
  `;
  return el;
}
