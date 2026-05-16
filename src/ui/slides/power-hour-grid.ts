import type { ReportData } from "../report";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function powerHourGridSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-powerhour";
  let max = 0;
  let peakDow = 0;
  let peakHour = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const v = data.hourByDay[d]![h]!;
      if (v > max) { max = v; peakDow = d; peakHour = h; }
    }
  }
  const cells = data.hourByDay.map((row, d) =>
    row.map((v, h) => {
      const alpha = max === 0 ? 0 : v / max;
      const isPeak = d === peakDow && h === peakHour;
      return `<span class="ph-cell${isPeak ? " peak" : ""}" style="--a:${alpha.toFixed(3)}" title="${DAY_NAMES[d]} ${h}:00 — ${v}"></span>`;
    }).join("")
  ).join("");

  el.innerHTML = `
    <div class="label">Your exact sweet spot</div>
    <h2 class="ph-title">${DAY_NAMES[peakDow]} ${formatHour(peakHour)}</h2>
    <p class="ph-blurb">More messages happen here than anywhere else on your week.</p>
    <div class="ph-wrap">
      <div class="ph-grid">${cells}</div>
      <div class="ph-y-labels">${DAY_NAMES.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="ph-x-labels"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span></div>
    </div>
  `;
  return el;
}

function formatHour(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h === 0 ? 12 : h <= 12 ? h : h - 12;
  return `${hour12} ${period}`;
}
