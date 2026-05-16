import type { ReportData } from "../report";

export function quirksSlide(data: ReportData): HTMLElement {
  const el = document.createElement("div");
  el.className = "slide-card theme-quirks";
  const q = data.quirks;
  const items = [
    {
      icon: "🙏",
      title: q.politenessCount.toLocaleString(),
      subtitle: `times you said "please" or "thanks"`,
      flavour: q.politenessCount >= 30 ? "The AI doesn't have feelings, but it appreciates you." :
               q.politenessCount === 0 ? "Direct and to the point. No fluff." :
               "Just polite enough.",
      countTo: q.politenessCount,
    },
    {
      icon: "❓",
      title: `${Math.round(q.questionRate * 100)}%`,
      subtitle: "of your messages end with a question",
      flavour: q.questionRate >= 0.7 ? "You're a question machine." :
               q.questionRate >= 0.4 ? "Curious by nature." :
               "More statements than questions.",
    },
    {
      icon: "✨",
      title: q.emojiCount.toLocaleString(),
      subtitle: "emojis you sent the AI",
      flavour: q.emojiCount >= 50 ? "Why use words 💯" :
               q.emojiCount >= 10 ? "A sprinkle here and there." :
               "Strictly text.",
      countTo: q.emojiCount,
    },
    {
      icon: "💻",
      title: q.codeBlockCount.toLocaleString(),
      subtitle: "code blocks pasted into the chat",
      flavour: q.codeBlockCount >= 20 ? "Debugging buddy energy." :
               q.codeBlockCount > 0 ? "A coder, sometimes." :
               "All words, no code.",
      countTo: q.codeBlockCount,
    },
  ];

  el.innerHTML = `
    <div class="label">A few quirks</div>
    <h2 class="quirks-title">About how you chat</h2>
    <div class="quirks-grid">
      ${items.map((it) => `
        <div class="quirk-card">
          <div class="quirk-icon">${it.icon}</div>
          <div class="quirk-num"${"countTo" in it && it.countTo !== undefined ? ` data-count-to="${it.countTo}"` : ""}>${it.title}</div>
          <div class="quirk-sub">${escapeHtml(it.subtitle)}</div>
          <div class="quirk-flavour">${escapeHtml(it.flavour)}</div>
        </div>
      `).join("")}
    </div>
  `;
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
