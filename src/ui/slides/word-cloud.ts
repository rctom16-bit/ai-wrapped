import type { ReportData } from "../report";

export function wordCloudSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-words";
  const words = data.topWords.slice(0, 40);
  if (words.length === 0) {
    el.innerHTML = `<div class="label">Not enough words yet</div>`;
    return el;
  }
  const max = words[0]!.count;
  const min = words.at(-1)!.count;
  const range = Math.max(1, max - min);
  const palette = ["#ff4d8d", "#7c4dff", "#00e5ff", "#ffd166", "#06d6a0"];
  const items = words.map((w, i) => {
    const scale = 0.8 + ((w.count - min) / range) * 2.4;
    const color = palette[i % palette.length];
    return `<span class="cloud-word" style="font-size:${scale.toFixed(2)}em;color:${color};" title="${w.count}">${escapeHtml(w.word)}</span>`;
  }).join(" ");
  el.innerHTML = `
    <div class="label">Your year in 40 words</div>
    <h2 class="words-title">${escapeHtml(words[0]!.word)}</h2>
    <div class="word-cloud">${items}</div>
  `;
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
