import type { ReportData } from "../report";

export function personalitySlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card";
  el.innerHTML = `
    <div class="label">Your AI personality is</div>
    <div class="archetype-emoji">${data.archetype.emoji}</div>
    <h2 class="archetype-name">${data.archetype.name}</h2>
    <p class="archetype-blurb">${data.archetype.blurb}</p>
  `;
  return el;
}
