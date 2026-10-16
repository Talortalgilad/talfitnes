import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES, type Category } from '../types';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';

type Sort = 'new' | 'asc' | 'desc';

export default function Home() {
  const items = useStore((s) => s.items);
  const [cat, setCat] = useState<Category | null>(null);
  const [sort, setSort] = useState<Sort>('new');

  const list = useMemo(() => {
    const f = items.filter((i) => !cat || i.category === cat);
    const cmp = { new: (a: typeof f[0], b: typeof f[0]) => b.createdAt - a.createdAt, asc: (a: typeof f[0], b: typeof f[0]) => a.price - b.price, desc: (a: typeof f[0], b: typeof f[0]) => b.price - a.price }[sort];
    return [...f].sort((a, b) => (a.status === b.status ? cmp(a, b) : a.status === 'sold' ? 1 : -1));
  }, [items, cat, sort]);

  return (
    <div className="space-y-4 pb-4">
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-primary p-4 text-white shadow-soft">
        <ShieldCheck size={28} className="shrink-0" aria-hidden />
        <p className="text-sm font-medium leading-snug">קונים ומוכרים בלי לחץ. הכסף משתחרר רק כשהבגד אצלך ✓</p>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="קטגוריות">
        {[null, ...CATEGORIES].map((c) => (
          <button key={c ?? 'all'} onClick={() => setCat(c)} role="tab" aria-selected={cat === c}
            className={`tap shrink-0 rounded-full px-4 text-sm font-medium ${cat === c ? 'bg-primary text-white' : 'bg-white text-ink shadow-sm'}`}>
            {c ?? 'הכול'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 text-sm">
        <span className="text-ink-soft">{list.length} פריטים</span>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="מיון" className="tap rounded-xl bg-white px-3 shadow-sm">
          <option value="new">חדש ביותר</option>
          <option value="asc">מחיר: מהנמוך לגבוה</option>
          <option value="desc">מחיר: מהגבוה לנמוך</option>
        </select>
      </div>

      {list.length ? <ItemGrid items={list} /> : <EmptyState emoji="👗" text="אין עדיין פריטים בקטגוריה הזו" />}
    </div>
  );
}
