import type { ReportData } from "../report";

export function compareSlide(data: ReportData): HTMLElement | null {
  if (!(data.hasChatGPT && data.hasClaude)) return null;
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">You use both</div>
    <h2 class="compare-title">ChatGPT &amp; Claude</h2>
    <p class="compare-blurb">Two different AIs, two different vibes. We see you.</p>
  `;
  return el;
}
