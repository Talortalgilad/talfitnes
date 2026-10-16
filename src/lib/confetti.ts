// Loaded on demand (keeps the first load small) and skipped entirely for reduced-motion users.
export async function fireConfetti(big = false) {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const { default: confetti } = await import('canvas-confetti');
  confetti({ particleCount: big ? 160 : 140, spread: big ? 90 : 80, origin: { y: 0.65 }, disableForReducedMotion: true });
  if (!big) {
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true }), 200);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true }), 200);
  }
}
