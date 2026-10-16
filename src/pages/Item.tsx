import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/money';
import SafeImage from '../components/SafeImage';
import { Avatar } from '../components/UserSwitcher';
import EmptyState from '../components/EmptyState';
import type { Badge } from '../types';

const badgeText: Record<Badge, string> = { verified: 'מאומת ✓', fast_shipper: 'שולח מהר ⚡', top_seller: 'מוכר/ת מובילה 🏆' };

export default function ItemPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const item = useStore((s) => s.items.find((i) => i.id === id));
  const seller = useStore((s) => (item ? s.users[item.sellerId] : undefined));
  const me = useStore((s) => s.currentUserId);
  const [idx, setIdx] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (!item || !seller) return <EmptyState emoji="🤷" text="הפריט לא נמצא" />;

  const own = item.sellerId === me;
  const sold = item.status === 'sold';

  return (
    <div className="pb-28">
      <div className="relative">
        <div ref={track} onScroll={(e) => { const el = e.currentTarget; setIdx(Math.round(Math.abs(el.scrollLeft) / el.clientWidth)); }} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {item.images.map((src, n) => (
            <SafeImage key={n} src={src} category={item.category} alt={`${item.title} ${n + 1}`} className="aspect-square w-full shrink-0 snap-center" />
          ))}
        </div>
        <button onClick={() => nav(-1)} aria-label="חזרה" className="tap absolute right-3 top-3 flex items-center justify-center rounded-full bg-white/90 shadow"><ArrowRight size={20} /></button>
        {item.images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden>
            {item.images.map((_, n) => <span key={n} className={`h-1.5 rounded-full ${n === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />)}
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="text-3xl font-black">{fmt(item.price)}</div>
          <h1 className="mt-1 text-lg font-bold">{item.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {[item.brand, `מידה ${item.size}`, item.condition, item.category].map((t) => <span key={t} className="rounded-full bg-primary-soft px-3 py-1 text-primary-hover">{t}</span>)}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">{item.description}</p>

        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
          <Avatar user={seller} size={48} />
          <div className="flex-1">
            <div className="font-bold">{seller.name}</div>
            <div className="text-xs text-ink-soft">{seller.city}</div>
            <div className="mt-1 flex flex-wrap gap-1">{seller.badges.map((b) => <span key={b} className="rounded-full bg-escrow-soft px-2 py-0.5 text-[11px] text-escrow">{badgeText[b]}</span>)}</div>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold"><Star size={16} className="fill-escrow text-escrow" aria-hidden />{seller.rating.toFixed(1)}<span className="text-xs font-normal text-ink-soft">({seller.ratingCount})</span></div>
        </div>

        <div className="flex gap-3 rounded-2xl border border-escrow/30 bg-escrow-soft p-4">
          <ShieldCheck size={26} className="shrink-0 text-escrow" aria-hidden />
          <div>
            <div className="font-bold">הגנת קונה ReWear 🛡️</div>
            <p className="mt-1 text-sm leading-snug text-ink-soft">הכסף שלך מוחזק בנאמנות ומשתחרר למוכר רק אחרי שאישרת שהפריט הגיע ותקין.</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-gray-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          disabled={own || sold}
          onClick={() => nav(`/checkout/${item.id}`)}
          className="tap w-full rounded-2xl bg-primary py-3 text-base font-bold text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500"
        >
          {own ? 'זה הפריט שלך' : sold ? 'הפריט נמכר' : `קנייה מאובטחת · ${fmt(item.price)}`}
        </button>
      </div>
    </div>
  );
}
