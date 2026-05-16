export interface LandingResult {
  chatgptFile: File | null;
  claudeFile: File | null;
}

export function renderLanding(root: HTMLElement, onSubmit: (r: LandingResult) => void): void {
  root.innerHTML = `
    <section class="landing">
      <h1>AI Wrapped</h1>
      <p class="tagline">Your year in AI conversations, beautifully.</p>
      <p class="privacy">100% in your browser. Nothing leaves your device.</p>

      <div class="drops">
        ${dropZone("chatgpt", "ChatGPT export")}
        ${dropZone("claude", "Claude export")}
      </div>

      <button class="primary" id="go" disabled>See my year →</button>

      <details class="howto">
        <summary>How do I get my export?</summary>
        <p><strong>ChatGPT:</strong> Settings → Data Controls → Export data. You'll get an email with a ZIP. Inside is <code>conversations.json</code>. Drop that file above.</p>
        <p><strong>Claude:</strong> Settings → Privacy → Export data. You'll get an email with a ZIP. Inside is <code>conversations.json</code>. Drop that file above.</p>
      </details>
    </section>
  `;

  const state: LandingResult = { chatgptFile: null, claudeFile: null };
  const go = root.querySelector<HTMLButtonElement>("#go")!;

  for (const which of ["chatgpt", "claude"] as const) {
    const zone = root.querySelector<HTMLLabelElement>(`label[data-which="${which}"]`)!;
    const input = zone.querySelector<HTMLInputElement>("input[type=file]")!;
    const label = zone.querySelector<HTMLSpanElement>(".filename")!;

    const accept = (file: File | null) => {
      if (which === "chatgpt") state.chatgptFile = file;
      else state.claudeFile = file;
      label.textContent = file ? file.name : "";
      zone.classList.toggle("has-file", !!file);
      go.disabled = !(state.chatgptFile || state.claudeFile);
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
}

function dropZone(which: "chatgpt" | "claude", label: string): string {
  return `
    <label class="drop" data-which="${which}">
      <input type="file" accept=".json,application/json" hidden />
      <div class="drop-label">${label}</div>
      <div class="drop-hint">Drop the JSON file or click to browse</div>
      <span class="filename"></span>
    </label>
  `;
}
