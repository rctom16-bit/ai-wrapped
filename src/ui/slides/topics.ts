import type { ReportData } from "../report";

export function topicsSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  const max = Math.max(1, ...data.topics.map((t) => t.score));
  const pills = data.topics.map((t) => {
    const scale = 0.7 + (t.score / max) * 0.8;
    return `<span class="topic-pill" style="font-size:${scale}em;">${escapeHtml(t.name)}</span>`;
  }).join("");
  el.innerHTML = `
    <div class="label">You talk about</div>
    <h2 class="topics-title">${data.topics[0]?.name ?? "a bit of everything"}</h2>
    <div class="topic-pills">${pills}</div>
  `;
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
