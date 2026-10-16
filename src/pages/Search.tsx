import { useMemo, useState } from 'react';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES, CONDITIONS } from '../types';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';

const field = 'tap w-full rounded-xl bg-white px-3 text-sm shadow-sm';

export default function Search() {
  const items = useStore((s) => s.items);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('');
  const [size, setSize] = useState('');
  const [cond, setCond] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const sizes = useMemo(() => [...new Set(items.map((i) => i.size))].sort(), [items]);
  const activeFilters = [cat, size, cond, min, max].filter(Boolean).length;

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) =>
      (!t || i.title.toLowerCase().includes(t) || i.brand.toLowerCase().includes(t)) &&
      (!cat || i.category === cat) && (!size || i.size === size) && (!cond || i.condition === cond) &&
      (!min || i.price >= Number(min)) && (!max || i.price <= Number(max)),
    ).sort((a, b) => (a.status === b.status ? b.createdAt - a.createdAt : a.status === 'sold' ? 1 : -1));
  }, [items, q, cat, size, cond, min, max]);

  const clear = () => { setQ(''); setCat(''); setSize(''); setCond(''); setMin(''); setMax(''); };

  return (
    <div className="space-y-3 pb-4">
      <div className="flex gap-2 px-4 pt-4">
        <label className="relative flex-1">
          <SearchIcon size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם או מותג" aria-label="חיפוש" className={`${field} ps-10`} />
        </label>
        <button onClick={() => setOpen((o) => !o)} aria-label="סינון" aria-expanded={open} className={`tap relative flex items-center justify-center rounded-xl px-3 shadow-sm ${open ? 'bg-primary text-white' : 'bg-white'}`}>
          <SlidersHorizontal size={18} aria-hidden />
          {activeFilters > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-escrow-dark text-[10px] font-bold text-white">{activeFilters}</span>}
        </button>
      </div>

      {open && (
        <div className="mx-4 grid grid-cols-2 gap-2 rounded-2xl bg-primary-soft p-3">
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="קטגוריה" className={field}>
            <option value="">כל הקטגוריות</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={size} onChange={(e) => setSize(e.target.value)} aria-label="מידה" className={field}>
            <option value="">כל המידות</option>
            {sizes.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={cond} onChange={(e) => setCond(e.target.value)} aria-label="מצב" className={`${field} col-span-2`}>
            <option value="">כל המצבים</option>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" inputMode="numeric" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder="מחיר מינימום" aria-label="מחיר מינימום" className={field} />
          <input type="number" inputMode="numeric" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder="מחיר מקסימום" aria-label="מחיר מקסימום" className={field} />
        </div>
      )}

      {results.length ? (
        <ItemGrid items={results} />
      ) : (
        <div>
          <EmptyState emoji="🔍" title="לא נמצאו תוצאות" text="לא מצאנו פריטים שמתאימים לחיפוש. אפשר לשנות או לנקות את הסינון." />
          <div className="flex justify-center"><button onClick={clear} className="tap flex items-center gap-1 rounded-full bg-primary px-4 text-sm font-medium text-white"><X size={14} aria-hidden />נקה חיפוש</button></div>
        </div>
      )}
    </div>
  );
}
