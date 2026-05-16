export interface LandingResult {
  chatgptFile: File | null;
  claudeFile: File | null;
  grokFile: File | null;
  geminiFile: File | null;
}

type Which = "chatgpt" | "claude" | "grok" | "gemini";

const LABELS: Record<Which, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  grok: "Grok",
  gemini: "Gemini",
};

export function renderLanding(root: HTMLElement, onSubmit: (r: LandingResult) => void): void {
  root.innerHTML = `
    <section class="landing">
      <h1>AI Wrapped</h1>
      <p class="tagline">Your year in AI conversations, beautifully.</p>
      <p class="privacy">100% in your browser. Nothing leaves your device.</p>

      <div class="drops drops-4">
        ${dropZone("chatgpt")}
        ${dropZone("claude")}
        ${dropZone("grok")}
        ${dropZone("gemini")}
      </div>

      <button class="primary" id="go" disabled>See my year →</button>

      <p class="demo">Don't have an export handy? <a href="#" id="try-demo">Try with sample data</a>.</p>

      <details class="howto">
        <summary>How do I get my export?</summary>
        <p><strong>ChatGPT:</strong> Settings → Data Controls → Export data. You'll get an email with a ZIP. Inside is <code>conversations.json</code>. Drop that file above.</p>
        <p><strong>Claude:</strong> Settings → Privacy → Export data. Same flow as ChatGPT.</p>
        <p><strong>Grok:</strong> accounts.x.ai/data → Download account data, or grok.com Settings → Data → Export Data. JSON inside the ZIP.</p>
        <p><strong>Gemini:</strong> Google Takeout (takeout.google.com) → My Activity → Gemini Apps. Drop the <code>MyActivity.json</code> file above.</p>
      </details>
    </section>
  `;

  const state: LandingResult = { chatgptFile: null, claudeFile: null, grokFile: null, geminiFile: null };
  const go = root.querySelector<HTMLButtonElement>("#go")!;
  const anyFile = (s: LandingResult) => !!(s.chatgptFile || s.claudeFile || s.grokFile || s.geminiFile);

  for (const which of ["chatgpt", "claude", "grok", "gemini"] as const) {
    const zone = root.querySelector<HTMLLabelElement>(`label[data-which="${which}"]`)!;
    const input = zone.querySelector<HTMLInputElement>("input[type=file]")!;
    const label = zone.querySelector<HTMLSpanElement>(".filename")!;

    const accept = (file: File | null) => {
      if (which === "chatgpt") state.chatgptFile = file;
      else if (which === "claude") state.claudeFile = file;
      else if (which === "grok") state.grokFile = file;
      else if (which === "gemini") state.geminiFile = file;
      label.textContent = file ? file.name : "";
      zone.classList.toggle("has-file", !!file);
      go.disabled = !anyFile(state);
    };

    input.addEventListener("change", () => accept(input.files?.[0] ?? null));
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragging"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragging"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragging");
      const f = e.dataTransfer?.files?.[0] ?? null;
      if (f) accept(f);
    });
  }

  go.addEventListener("click", () => onSubmit(state));

  root.querySelector<HTMLAnchorElement>("#try-demo")!.addEventListener("click", async (e) => {
    e.preventDefault();
    const [chatBlob, claudeBlob] = await Promise.all([
      fetch("./samples/chatgpt-sample.json").then((r) => r.blob()),
      fetch("./samples/claude-sample.json").then((r) => r.blob()),
    ]);
    onSubmit({
      chatgptFile: new File([chatBlob], "chatgpt-sample.json", { type: "application/json" }),
      claudeFile: new File([claudeBlob], "claude-sample.json", { type: "application/json" }),
      grokFile: null,
      geminiFile: null,
    });
  });
}

function dropZone(which: Which): string {
  return `
    <label class="drop" data-which="${which}">
      <input type="file" accept=".json,application/json" hidden />
      <div class="drop-label">${LABELS[which]}</div>
      <div class="drop-hint">JSON export</div>
      <span class="filename"></span>
    </label>
  `;
}
