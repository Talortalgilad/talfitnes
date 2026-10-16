export default function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <div className="text-4xl" aria-hidden>{emoji}</div>
      <p className="text-sm text-ink-soft">{text}</p>
    </div>
  );
}
