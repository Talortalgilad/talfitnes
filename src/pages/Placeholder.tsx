export default function Placeholder({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="text-5xl" aria-hidden>{emoji}</div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-ink-soft">המסך הזה ייבנה בשלבים הבאים</p>
    </div>
  );
}
