import type { ReportData } from "../report";

export function monthlyHeartbeatSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-monthly";
  const max = Math.max(1, ...data.monthly.map((m) => m.count));
  const peak = data.monthly.reduce((best, m) => (m.count > best.count ? m : best), data.monthly[0]!);
  const w = 720;
  const h = 200;
  const pad = 24;
  const stepX = (w - pad * 2) / 11;
  const points = data.monthly.map((m, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((m.count / max) * (h - pad * 2));
    return { x, y, ...m };
  });
  const path = points.map((p, i) => (i === 0 ? `M${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(" ");
  const area = `${path} L${points.at(-1)!.x.toFixed(1)} ${h - pad} L${pad} ${h - pad} Z`;
  const peakPoint = points.find((p) => p.month === peak.month)!;

  el.innerHTML = `
    <div class="label">Your year had a shape</div>
    <h2 class="monthly-title">Peak: ${peak.month}</h2>
    <div class="monthly-wrap">
      <svg viewBox="0 0 ${w} ${h}" class="monthly-svg" aria-label="Monthly message count sparkline">
        <defs>
          <linearGradient id="mhg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,209,102,0.6)"/>
            <stop offset="100%" stop-color="rgba(255,77,141,0.05)"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#mhg)" />
        <path d="${path}" fill="none" stroke="#ffd166" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${points.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#fff"/>`).join("")}
        <circle cx="${peakPoint.x.toFixed(1)}" cy="${peakPoint.y.toFixed(1)}" r="8" fill="#ff4d8d" stroke="#fff" stroke-width="2"/>
      </svg>
      <div class="monthly-axis">${points.map((p) => `<span>${p.month}</span>`).join("")}</div>
    </div>
    <p class="monthly-blurb">${peak.count.toLocaleString()} messages — your busiest month.</p>
  `;
  return el;
}
