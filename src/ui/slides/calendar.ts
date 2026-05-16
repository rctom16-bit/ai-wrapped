import type { ReportData } from "../report";

const MS_DAY = 86_400_000;

export function calendarSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-calendar";
  const cells = buildCells(data.stats.dailyCounts);
  const activeDays = cells.filter((c) => c.count > 0).length;

  el.innerHTML = `
    <div class="label">A whole year</div>
    <h2 class="cal-title">${activeDays} active days</h2>
    <p class="cal-subtitle">Every square is a day. Brighter = more messages.</p>
    <div class="cal-grid" role="img" aria-label="Calendar heatmap of daily AI messages">
      ${cells.map((c) => `<span class="cal-cell" data-l="${c.level}" title="${c.date}: ${c.count} messages"></span>`).join("")}
    </div>
    <div class="cal-legend">
      <span>less</span>
      <span class="cal-cell" data-l="0"></span>
      <span class="cal-cell" data-l="1"></span>
      <span class="cal-cell" data-l="2"></span>
      <span class="cal-cell" data-l="3"></span>
      <span class="cal-cell" data-l="4"></span>
      <span>more</span>
    </div>
  `;
  return el;
}

interface Cell { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

function buildCells(daily: Map<string, number>): Cell[] {
  const today = new Date();
  const start = new Date(today.getTime() - 364 * MS_DAY);
  const cells: Cell[] = [];
  const counts: number[] = [];
  for (let d = new Date(start); d <= today; d = new Date(d.getTime() + MS_DAY)) {
    const key = d.toISOString().slice(0, 10);
    counts.push(daily.get(key) ?? 0);
  }
  const sorted = [...counts].filter((n) => n > 0).sort((a, b) => a - b);
  const p = (q: number) => sorted[Math.floor(sorted.length * q)] ?? 0;
  const q1 = p(0.25), q2 = p(0.5), q3 = p(0.75), q4 = p(0.95);

  for (let i = 0; i < counts.length; i++) {
    const d = new Date(start.getTime() + i * MS_DAY);
    const count = counts[i]!;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > q4) level = 4;
    else if (count > q3) level = 3;
    else if (count > q2) level = 2;
    else if (count > 0 || count > q1) level = count > 0 ? 1 : 0;
    cells.push({ date: d.toISOString().slice(0, 10), count, level });
  }
  return cells;
}
