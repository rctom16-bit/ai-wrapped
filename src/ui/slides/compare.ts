import type { ReportData } from "../report";

export function compareSlide(data: ReportData): HTMLElement | null {
  if (!(data.hasChatGPT && data.hasClaude)) return null;
  const el = document.createElement("div");
  el.className = "slide-card theme-compare";
  el.innerHTML = `
    <div class="label">You use both</div>
    <h2 class="compare-title">ChatGPT &amp; Claude</h2>
    <p class="compare-blurb">Two different AIs, two different vibes. We see you.</p>
    <div class="compare-grid">
      <div class="compare-card chatgpt">
        <div class="label-sm">ChatGPT</div>
        <div class="big" data-count-to="${data.chatgptMessageCount}">0</div>
        <div class="label-sm" style="opacity:0.6">messages</div>
      </div>
      <div class="compare-card claude">
        <div class="label-sm">Claude</div>
        <div class="big" data-count-to="${data.claudeMessageCount}">0</div>
        <div class="label-sm" style="opacity:0.6">messages</div>
      </div>
    </div>
  `;
  return el;
}
