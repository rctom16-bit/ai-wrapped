import type { ReportData } from "../report";

export function comebackGapSlide(data: ReportData): HTMLElement | null {
  const g = data.longestGap;
  if (g.days < 3) return null;
  const el = document.createElement("div");
  el.className = "slide-card theme-gap";
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  el.innerHTML = `
    <div class="label">The longest break</div>
    <h2 class="gap-days"><span data-count-to="${g.days}">0</span> days</h2>
    <p class="gap-range">${fmt(g.startDate)} → ${fmt(g.endDate)}</p>
    <p class="gap-blurb">You went quiet. Then you came back.</p>
    <div class="gap-timeline" aria-hidden="true">
      <span class="gap-dot start"></span>
      <span class="gap-line"></span>
      <span class="gap-dot end"></span>
    </div>
  `;
  return el;
}
