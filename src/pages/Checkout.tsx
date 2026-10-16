import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Loader2, Lock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { calcTotals, fmt } from '../lib/money';
import SafeImage from '../components/SafeImage';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

export default function Checkout() {
  const { id } = useParams();
  const nav = useNavigate();
  const item = useStore((s) => s.items.find((i) => i.id === id));
  const me = useStore((s) => s.users[s.currentUserId]);
  const topUp = useStore((s) => s.topUp);
  const show = useToast((s) => s.show);
  const [address, setAddress] = useState(me.address);
  const [phase, setPhase] = useState<'form' | 'paying' | 'done'>('form');
  const [orderId, setOrderId] = useState('');
  const [err, setErr] = useState('');

  // Switching accounts mid-checkout: the seller can't buy their own item (back to the item page);
  // any other user gets their own saved address.
  useEffect(() => {
    if (phase !== 'form') return;
    if (item && item.sellerId === me.id) { nav(`/item/${item.id}`, { replace: true }); return; }
    setAddress(me.address);
    setErr('');
  }, [me.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'done') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-escrow-soft"><Lock size={36} className="text-escrow" aria-hidden /></div>
        <h1 className="text-2xl font-black">התשלום הועבר לנאמנות 🔒</h1>
        <p className="text-sm text-ink-soft">הכסף מוחזק אצלנו ויועבר למוכר רק אחרי שתאשר שהפריט הגיע ותקין.</p>
        <button onClick={() => nav(`/orders/${orderId}`, { replace: true })} className="tap w-full rounded-2xl bg-primary py-3 font-bold text-white hover:bg-primary-hover">למעקב ההזמנה</button>
      </motion.div>
    );
  }

  if (!item) return <EmptyState emoji="🤷" text="הפריט לא נמצא" />;

  const t = calcTotals(item.price);
  const own = item.sellerId === me.id;
  const unavailable = item.status !== 'active';
  const short = me.wallet.available < t.total;
  const addrOk = address.trim().length >= 6;
  const blocked = own || unavailable;

  const pay = () => {
    if (!addrOk) { setErr('נא למלא כתובת משלוח מלאה (רחוב ומספר)'); return; }
    if (short) return;
    setErr('');
    setPhase('paying');
    setTimeout(() => {
      const r = useStore.getState().buyItem(item.id, address.trim());
      if (r.ok) { setOrderId(r.orderId); setPhase('done'); }
      else { setPhase('form'); show(r.error, 'error'); }
    }, 1200);
  };

  const row = (l: string, v: string, bold = false) => (
    <div className={`flex justify-between ${bold ? 'border-t pt-2 text-lg font-black' : 'text-sm'}`}><span className={bold ? '' : 'text-ink-soft'}>{l}</span><span>{v}</span></div>
  );

  return (
    <div className="space-y-4 p-4 pb-8">
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} aria-label="חזרה" className="tap flex items-center justify-center"><ArrowRight size={22} /></button>
        <h1 className="text-xl font-black">קופה</h1>
      </div>

      <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
        <SafeImage src={item.images[0]} category={item.category} alt={item.title} className="h-20 w-20 shrink-0 rounded-xl" />
        <div><div className="font-bold">{item.title}</div><div className="text-xs text-ink-soft">{item.brand} · מידה {item.size}</div><div className="mt-1 font-black">{fmt(item.price)}</div></div>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-bold">כתובת משלוח</span>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="tap w-full rounded-xl bg-white px-3 shadow-sm" aria-invalid={!!err} />
        {err && <span className="text-xs text-bad">{err}</span>}
      </label>

      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-soft">
        {row('פריט', fmt(t.itemPrice))}
        {row('משלוח', fmt(t.shippingFee))}
        {row('הגנת קונה (5%)', fmt(t.protectionFee))}
        {row('סה״כ', fmt(t.total), true)}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
        <Wallet className="text-primary" aria-hidden />
        <div className="flex-1"><div className="text-sm font-bold">ארנק ReWear</div><div className="text-xs text-ink-soft">יתרה {fmt(me.wallet.available)}</div></div>
      </div>

      {own && <p className="rounded-xl bg-gray-100 p-3 text-center text-sm">זה הפריט שלך</p>}
      {unavailable && !own && <p className="rounded-xl bg-gray-100 p-3 text-center text-sm">הפריט כבר נמכר</p>}
      {short && !blocked && (
        <div className="space-y-2 rounded-2xl border border-bad/30 bg-red-50 p-3 text-center">
          <p className="text-sm text-bad">אין מספיק יתרה בארנק. חסרים {fmt(t.total - me.wallet.available)}.</p>
          <button onClick={() => { topUp(); show('נטענו 500 ₪ לארנק'); }} className="tap rounded-xl bg-white px-4 text-sm font-bold text-primary shadow-sm">טעינת ארנק (+500 ₪ מדומה)</button>
        </div>
      )}

      <button onClick={pay} disabled={blocked || short || phase === 'paying'} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-base font-bold text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500">
        {phase === 'paying' ? <><Loader2 className="animate-spin" size={20} aria-hidden />מעבד תשלום…</> : `תשלום · ${fmt(t.total)}`}
      </button>
    </div>
  );
}
