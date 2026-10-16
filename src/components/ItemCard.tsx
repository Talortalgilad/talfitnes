import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Item } from '../types';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/money';
import SafeImage from './SafeImage';

export default function ItemCard({ item }: { item: Item }) {
  const seller = useStore((s) => s.users[item.sellerId]);
  const me = useStore((s) => s.currentUserId);
  const toggleLike = useStore((s) => s.toggleLike);
  const liked = item.likes.includes(me);
  const sold = item.status === 'sold';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft">
      <Link to={`/item/${item.id}`} className="block" aria-label={item.title}>
        <div className="relative">
          <SafeImage src={item.images[0]} category={item.category} alt={item.title} className={`aspect-[4/5] w-full ${sold ? 'opacity-50' : ''}`} />
          {item.relisted && !sold && <span className="absolute right-2 top-2 rounded-full bg-escrow px-2 py-0.5 text-[11px] font-bold text-white shadow">חזר למכירה</span>}
          {sold && <span className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">נמכר</span>}
        </div>
        <div className="space-y-0.5 p-3">
          <div className="text-base font-black">{fmt(item.price)}</div>
          <div className="truncate text-sm">{item.title}</div>
          <div className="text-xs text-ink-soft">{item.brand} · מידה {item.size}</div>
          <div className="flex items-center gap-1 pt-1 text-xs text-ink-soft">
            <span>{seller.name}</span>
            <Star size={12} className="fill-escrow text-escrow" aria-hidden />
            <span>{seller.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
      <button
        onClick={() => toggleLike(item.id)}
        aria-label={liked ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
        className="tap absolute left-1.5 top-1.5 flex items-center justify-center rounded-full bg-white/90 shadow"
      >
        <Heart size={18} className={liked ? 'fill-bad text-bad' : 'text-ink-soft'} />
      </button>
    </div>
  );
}
