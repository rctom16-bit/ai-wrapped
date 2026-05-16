import type { ReportData } from "../report";

export function rhythmSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-rhythm";
  const peak = formatHour(data.stats.peakHour);
  el.innerHTML = `
    <div class="label">Your peak hour is</div>
    <div class="big-number">${peak}</div>
    <div class="label">You're a ${classify(data.stats.peakHour)}</div>
    <div>
      <div class="hourly" aria-hidden="true">${renderHourly(data.stats.hourly)}</div>
      <div class="hourly-axis"><span>12am</span><span>6am</span><span>noon</span><span>6pm</span><span>11pm</span></div>
    </div>
    <div class="streak-pill">Longest streak <strong>${data.stats.longestStreak}</strong> days</div>
  `;
  return el;
}

function formatHour(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h === 0 ? 12 : h <= 12 ? h : h - 12;
  return `${hour12} ${period}`;
}

function classify(h: number): string {
  if (h >= 5 && h <= 9) return "morning person ☀️";
  if (h >= 10 && h <= 16) return "daytime thinker 🌤️";
  if (h >= 17 && h <= 21) return "evening regular 🌆";
  return "night owl 🌙";
}

function renderHourly(hourly: number[]): string {
  const max = Math.max(1, ...hourly);
  return hourly.map((v, i) => {
    const h = Math.max(4, (v / max) * 100);
    return `<span class="bar" style="height:${h}%" title="${i}:00 — ${v} messages"></span>`;
  }).join("");
}
