export function observeReveals(root: HTMLElement): void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visible");
        const target = e.target as HTMLElement;
        target.querySelectorAll<HTMLElement>("[data-count-to]").forEach(animateCount);
        if (target.dataset.fireConfetti === "true" && !target.dataset.confettiFired) {
          target.dataset.confettiFired = "true";
          void fireConfetti();
        }
        io.unobserve(e.target);
      }
    },
    { threshold: 0.35 }
  );
  root.querySelectorAll<HTMLElement>(".slide").forEach((s) => io.observe(s));
}

function animateCount(el: HTMLElement): void {
  const target = Number(el.dataset.countTo ?? "0");
  if (!Number.isFinite(target)) return;
  const durationMs = 1100;
  const start = performance.now();
  const startVal = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = Math.round(startVal + (target - startVal) * eased);
    el.textContent = v.toLocaleString();
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

async function fireConfetti(): Promise<void> {
  const { default: confetti } = await import("canvas-confetti");
  const colors = ["#ff4d8d", "#7c4dff", "#00e5ff", "#ffd166", "#06d6a0"];
  const burst = (originY: number) =>
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 45,
      origin: { y: originY },
      colors,
      scalar: 1.1,
    });
  burst(0.35);
  setTimeout(() => burst(0.4), 220);
  setTimeout(() => burst(0.45), 440);
}
