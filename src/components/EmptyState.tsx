import { Link } from 'react-router-dom';

interface Cta { label: string; to?: string; onClick?: () => void }

export default function EmptyState({ emoji, text, title, cta }: { emoji: string; text: string; title?: string; cta?: Cta }) {
  const cls = 'tap mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover';
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-4xl" aria-hidden>{emoji}</div>
      {title && <h2 className="mt-1 text-lg font-black">{title}</h2>}
      <p className="max-w-[280px] text-sm text-ink-soft">{text}</p>
      {cta && (cta.to ? <Link to={cta.to} className={cls}>{cta.label}</Link> : <button onClick={cta.onClick} className={cls}>{cta.label}</button>)}
    </div>
  );
}
