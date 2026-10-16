import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Lightbulb, Loader2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES, CONDITIONS, type Category, type Condition } from '../types';
import { compressImage } from '../lib/image';
import { fmt, suggestPrice } from '../lib/money';
import { useToast } from '../components/Toast';
import SafeImage from '../components/SafeImage';

const LETTER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
const SIZES: Record<Category, string[]> = {
  'חולצות': LETTER, 'שמלות': LETTER, 'מעילים': LETTER,
  'מכנסיים': range(28, 38), 'נעליים': range(35, 46), 'אקססוריז': ['ONE'],
};
const BRANDS = ['Zara', 'H&M', 'Castro', 'Fox', "Levi's", 'Nike', 'Adidas', 'Mango', 'Renuar'];
const MAX_IMAGES = 4;

const input = 'tap w-full rounded-xl bg-white px-3 shadow-sm outline-none ring-1 ring-transparent focus:ring-primary';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {error && <span role="alert" className="block text-xs text-bad">{error}</span>}
    </label>
  );
}

export default function Sell() {
  const nav = useNavigate();
  const listItem = useStore((s) => s.listItem);
  const show = useToast((s) => s.show);
  const fileRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('חולצות');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState<Condition>('טוב מאוד');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tried, setTried] = useState(false);

  const suggested = suggestPrice(category, condition, brand);
  const priceNum = Number(price);

  const errors = {
    images: images.length === 0 ? 'יש להעלות לפחות תמונה אחת' : '',
    title: title.trim().length < 3 ? 'כותרת של לפחות 3 תווים' : '',
    size: !size ? 'נא לבחור מידה' : '',
    brand: !brand.trim() ? 'נא למלא מותג' : '',
    price: !Number.isInteger(priceNum) || priceNum < 10 || priceNum > 5000 ? 'מחיר שלם בין ₪10 ל-₪5,000' : '',
    description: description.trim().length < 10 ? 'תיאור של לפחות 10 תווים' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (k: keyof typeof errors) => (tried ? errors[k] : '');

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_IMAGES - images.length;
    if (files.length > room) show(`אפשר להעלות עד ${MAX_IMAGES} תמונות`, 'error');
    setBusy(true);
    try {
      const out = await Promise.all([...files].slice(0, room).map(compressImage));
      setImages((prev) => [...prev, ...out]);
    } catch {
      show('לא הצלחנו לקרוא את התמונה. אפשר לנסות קובץ אחר.', 'error');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (hasErrors) { show('יש לתקן את השדות המסומנים', 'error'); return; }
    const id = listItem({ title: title.trim(), description: description.trim(), category, size, brand: brand.trim(), condition, price: priceNum, images });
    show('הפריט פורסם! 🎉');
    nav(`/item/${id}`);
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-4 pb-8" noValidate>
      <h1 className="text-xl font-black">מכירת פריט</h1>

      <div>
        <div className="mb-1 text-sm font-bold">תמונות ({images.length}/{MAX_IMAGES})</div>
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, n) => (
            <div key={n} className="relative aspect-square overflow-hidden rounded-xl">
              <img src={src} alt={`תמונה ${n + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== n))} aria-label={`הסר תמונה ${n + 1}`} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"><X size={14} /></button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} aria-label="הוספת תמונה" className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-primary-soft text-xs text-primary">
              {busy ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} />}
              {busy ? 'מכווץ…' : 'הוסף'}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} data-testid="file" />
        {err('images') && <span role="alert" className="mt-1 block text-xs text-bad">{err('images')}</span>}
      </div>

      <Field label="כותרת" error={err('title')}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="למשל: ג׳קט ג׳ינס קלאסי" className={input} /></Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="קטגוריה">
          <select value={category} onChange={(e) => { setCategory(e.target.value as Category); setSize(''); }} className={input}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label="מידה" error={err('size')}>
          <select value={size} onChange={(e) => setSize(e.target.value)} className={input}><option value="">בחר</option>{SIZES[category].map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="מותג" error={err('brand')}>
          <input list="brands" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Zara, Nike…" className={input} />
          <datalist id="brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
        </Field>
        <Field label="מצב">
          <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className={input}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
      </div>

      <Field label="מחיר (₪)" error={err('price')}>
        <input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={input} />
      </Field>
      <button type="button" onClick={() => setPrice(String(suggested))} className="tap flex w-full items-center justify-center gap-2 rounded-xl bg-escrow-soft px-3 text-sm font-medium text-escrow-dark">
        <Lightbulb size={16} aria-hidden />מחיר מומלץ: {fmt(suggested)} · השתמש בו
      </button>

      <Field label="תיאור" error={err('description')}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="מצב, גזרה, פגמים אם יש…" className={`${input} py-2`} />
      </Field>

      <div>
        <div className="mb-1 text-sm font-bold">תצוגה מקדימה</div>
        <div className="w-44 overflow-hidden rounded-2xl bg-white shadow-soft" data-testid="preview">
          <SafeImage src={images[0]} category={category} alt="תצוגה מקדימה" className="aspect-[4/5] w-full" />
          <div className="space-y-0.5 p-3">
            <div className="text-base font-black">{priceNum > 0 ? fmt(priceNum) : '₪—'}</div>
            <div className="truncate text-sm">{title || 'כותרת הפריט'}</div>
            <div className="text-xs text-ink-soft">{brand || 'מותג'} · מידה {size || '—'}</div>
          </div>
        </div>
      </div>

      <button type="submit" disabled={busy} className="tap w-full rounded-2xl bg-primary py-3 text-base font-bold text-white hover:bg-primary-hover disabled:opacity-60">פרסם למכירה</button>
    </form>
  );
}
