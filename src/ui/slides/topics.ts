import type { ReportData } from "../report";

const EMOJI_MAP: Record<string, string> = {
  Code: "💻", Cooking: "🍳", Travel: "✈️", Relationships: "❤️",
  Work: "💼", Health: "🩺", Writing: "✍️", Learning: "📚",
  Finance: "💸", Tech: "📱", Entertainment: "🎬", Books: "📖",
  Home: "🏠", Pets: "🐾", Fitness: "🏃",
};

export function topicsSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-topics";
  const max = Math.max(1, ...data.topics.map((t) => t.score));
  const pills = data.topics.map((t) => {
    const scale = 0.85 + (t.score / max) * 0.55;
    const emoji = EMOJI_MAP[t.name] ?? "✨";
    return `<span class="topic-pill" style="font-size:${scale}em;"><span class="pill-emoji">${emoji}</span>${escapeHtml(t.name)}</span>`;
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
