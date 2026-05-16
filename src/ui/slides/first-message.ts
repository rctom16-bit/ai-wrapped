import type { ReportData } from "../report";

export function firstMessageSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-firstmsg";
  const date = data.firstMessage.date;
  const dateStr = date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const timeStr = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  el.innerHTML = `
    <div class="label">Your first message</div>
    <div class="firstmsg-line">&gt; ${dateStr} &middot; ${timeStr}</div>
    <p class="firstmsg-sub">You started the year by asking about:</p>
    <h2 class="firstmsg-keywords">"${escapeHtml(data.firstMessage.keywords)}"</h2>
    <p class="firstmsg-tail">Look how far you've come.</p>
  `;
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
