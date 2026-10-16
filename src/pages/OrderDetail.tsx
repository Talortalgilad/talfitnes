import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Camera, Clock, Star } from 'lucide-react';
import { fireConfetti } from '../lib/confetti';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/money';
import { statusLabel, statusColor } from '../lib/status';
import { compressImage } from '../lib/image';
import { formatCountdown, useNow } from '../lib/useNow';
import EmptyState from '../components/EmptyState';
import EscrowTimeline from '../components/EscrowTimeline';
import MoneyFlow from '../components/MoneyFlow';
import Sheet from '../components/Sheet';
import SafeImage from '../components/SafeImage';
import { useToast } from '../components/Toast';

const REASONS = ['לא תואם לתיאור', 'פגום', 'מידה שגויה', 'לא הגיע'];

const primary = 'tap w-full rounded-2xl bg-primary py-3 font-bold text-white hover:bg-primary-hover';
// Dashed outline = simulated third party (courier / ReWear team / clock), not a real user action.
const demo = 'tap w-full rounded-2xl border-2 border-dashed border-ink-soft/50 bg-transparent py-3 text-sm font-bold text-ink-soft hover:bg-gray-50';
const info = 'rounded-2xl bg-gray-50 p-3 text-center text-sm text-ink-soft';

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const now = useNow();
  const show = useToast((s) => s.show);
  const me = useStore((s) => s.currentUserId);
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const item = useStore((s) => s.items.find((i) => i.id === order?.itemId));
  const users = useStore((s) => s.users);
  const { markShipped, markDelivered, releasePayment, openDispute, resolveRefund, rateSeller } = useStore.getState();

  const [sheet, setSheet] = useState<null | 'release' | 'dispute' | 'rate'>(null);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [dErr, setDErr] = useState('');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  if (!order) return <EmptyState emoji="🤷" title="ההזמנה לא נמצאה" text="אולי היא שייכת למשתמש אחר. אפשר להחליף משתמש או לחזור להזמנות." cta={{ label: 'להזמנות', to: '/orders' }} />;

  const buyer = users[order.buyerId];
  const seller = users[order.sellerId];
  const isBuyer = me === order.buyerId;
  const isSeller = me === order.sellerId;
  const run = (r: { ok: true } | { ok: false; error: string }, okMsg?: string) => {
    if (!r.ok) show(r.error, 'error');
    else if (okMsg) show(okMsg);
    return r.ok;
  };
  const celebrate = () => { void fireConfetti(); };

  const release = (auto: boolean) => {
    if (run(releasePayment(order.id, auto), `${fmt(order.itemPrice)} שוחררו ל${seller.name}`)) celebrate();
  };

  const submitDispute = () => {
    if (!reason) return setDErr('נא לבחור סיבה');
    if (details.trim().length < 5) return setDErr('נא לפרט במשפט קצר מה הבעיה');
    if (run(openDispute(order.id, { reason, details: details.trim(), photo }), 'הדיווח נשלח. התשלום הוקפא עד לבירור')) {
      setSheet(null); setDErr('');
    }
  };

  const submitRating = () => {
    if (!stars) return show('נא לבחור דירוג', 'error');
    if (run(rateSeller(order.id, stars, comment.trim()), 'תודה על הדירוג! ⭐')) setSheet(null);
  };

  const remaining = order.autoReleaseAt ? order.autoReleaseAt - now : 0;

  let actions: React.ReactNode = null;
  if (!isBuyer && !isSeller) {
    actions = <p className={info}>ההזמנה הזו בין {buyer.name} ל{seller.name}. אפשר להחליף משתמש כדי לטפל בה.</p>;
  } else {
    switch (order.status) {
      case 'paid_escrow':
        actions = isSeller
          ? <button className={primary} onClick={() => run(markShipped(order.id), 'סומן כנשלח 📦')}>סימנתי כנשלח</button>
          : <p className={info}>ממתין שהמוכר ישלח</p>;
        break;
      case 'shipped':
        actions = isSeller
          ? <p className={info}>בדרך לקונה 🚚</p>
          : <button className={demo} onClick={() => run(markDelivered(order.id), 'החבילה הגיעה 🏠')}>⚡ דמו: סמן שהחבילה הגיעה</button>;
        break;
      case 'delivered':
        actions = isSeller
          ? <p className={info}>ממתין לאישור הקונה</p>
          : (
            <div className="space-y-2">
              <button className={primary} onClick={() => setSheet('release')}>הכול תקין, שחרר תשלום</button>
              <button className="tap w-full rounded-2xl border border-bad/40 py-3 font-bold text-bad" onClick={() => setSheet('dispute')}>יש בעיה</button>
            </div>
          );
        break;
      case 'completed':
        actions = isSeller
          ? <p className="rounded-2xl bg-green-50 p-3 text-center font-bold text-ok-dark">💸 {fmt(order.itemPrice)} נכנסו לארנק</p>
          : order.rated
            ? <p className={info}>דירגת את {seller.name}: {'★'.repeat(order.rating?.stars ?? 0)}{'☆'.repeat(5 - (order.rating?.stars ?? 0))}</p>
            : <button className={primary} onClick={() => setSheet('rate')}>דרג את המוכר</button>;
        break;
      case 'disputed':
        actions = isSeller
          ? <p className="rounded-2xl bg-red-50 p-3 text-center text-sm font-bold text-bad">התשלום מוקפא עד לבירור</p>
          : <button className={demo} onClick={() => run(resolveRefund(order.id), `${fmt(order.total)} הוחזרו לארנק`)}>⚡ צוות ReWear: אשר החזר</button>;
        break;
      case 'refunded':
        actions = isSeller
          ? <p className={info}>ההזמנה בוטלה</p>
          : <p className="rounded-2xl bg-blue-50 p-3 text-center font-bold text-blue-700">{fmt(order.total)} הוחזרו לארנק</p>;
        break;
    }
  }

  return (
    <div className="space-y-4 p-4 pb-8">
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} aria-label="חזרה" className="tap flex items-center justify-center"><ArrowRight size={22} /></button>
        <h1 className="flex-1 text-xl font-black">הזמנה {order.id}</h1>
        <span data-testid="status" className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
      </div>

      {item && (
        <Link to={`/item/${item.id}`} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
          <SafeImage src={item.images[0]} category={item.category} alt={item.title} w={200} className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="min-w-0"><div className="truncate font-bold">{item.title}</div><div className="text-xs text-ink-soft">{buyer.name} ← {seller.name}</div><div className="font-black">{fmt(order.total)}</div></div>
        </Link>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="mb-3 font-black">איפה הכסף עכשיו? 💰</h2>
        <MoneyFlow order={order} buyerName={buyer.name} sellerName={seller.name} />
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="mb-3 font-black">ציר נאמנות</h2>
        <EscrowTimeline order={order} />
      </section>

      {order.status === 'delivered' && order.autoReleaseAt && (
        <section className="rounded-2xl border border-escrow/30 bg-escrow-soft p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-escrow-dark"><Clock size={16} aria-hidden />שחרור אוטומטי בעוד</div>
          <div data-testid="countdown" className="my-1 text-3xl font-black tabular-nums text-escrow-dark" dir="ltr">{formatCountdown(remaining)}</div>
          <p className="mb-3 text-xs text-ink-soft">אם לא תהיה פעולה, התשלום ישוחרר למוכר אוטומטית אחרי 48 שעות מההגעה.</p>
          <button className={demo} onClick={() => { release(true); }}>⚡ דלג קדימה בזמן</button>
        </section>
      )}

      {order.dispute && (
        <section className="space-y-1 rounded-2xl border border-bad/30 bg-red-50 p-4 text-sm">
          <div className="font-black text-bad">פרטי המחלוקת</div>
          <div><span className="text-ink-soft">סיבה: </span>{order.dispute.reason}</div>
          <div><span className="text-ink-soft">פירוט: </span>{order.dispute.details}</div>
          {order.dispute.photo && <img src={order.dispute.photo} alt="תמונה מהקונה" className="mt-2 h-28 rounded-xl object-cover" />}
        </section>
      )}

      <section className="space-y-2">{actions}</section>

      <section className="space-y-1.5 rounded-2xl bg-white p-4 text-sm shadow-soft">
        <div className="flex justify-between"><span className="text-ink-soft">פריט</span>{fmt(order.itemPrice)}</div>
        <div className="flex justify-between"><span className="text-ink-soft">משלוח</span>{fmt(order.shippingFee)}</div>
        <div className="flex justify-between"><span className="text-ink-soft">הגנת קונה</span>{fmt(order.protectionFee)}</div>
        <div className="flex justify-between border-t pt-2 font-black"><span>סה״כ</span>{fmt(order.total)}</div>
        <div className="pt-1 text-xs text-ink-soft">כתובת: {order.shippingAddress}</div>
        {order.trackingNumber && <div className="text-xs text-ink-soft">מספר מעקב: <span dir="ltr">{order.trackingNumber}</span></div>}
      </section>

      <Sheet open={sheet === 'release'} onClose={() => setSheet(null)} title="שחרור תשלום">
        <p className="mb-4 text-sm text-ink-soft">לאשר שהפריט הגיע ותקין? {fmt(order.itemPrice)} ישוחררו ל{seller.name}. <b>לא ניתן לבטל.</b></p>
        <div className="space-y-2">
          <button className={primary} onClick={() => { setSheet(null); release(false); }}>כן, שחרר תשלום</button>
          <button className="tap w-full rounded-2xl bg-gray-100 py-3 font-bold" onClick={() => setSheet(null)}>עוד לא</button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'dispute'} onClose={() => setSheet(null)} title="יש בעיה עם הפריט">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="סיבה">
            {REASONS.map((r) => (
              <button key={r} role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className={`tap rounded-xl border-2 px-2 text-sm font-medium ${reason === r ? 'border-bad bg-red-50 text-bad' : 'border-gray-200'}`}>{r}</button>
            ))}
          </div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="מה הבעיה? נא לפרט במשפט או שניים" aria-label="פירוט" className="w-full rounded-xl bg-gray-50 p-3 text-sm outline-none ring-1 ring-gray-200 focus:ring-primary" />
          <label className="tap flex cursor-pointer items-center gap-2 rounded-xl bg-gray-50 px-3 text-sm text-ink-soft">
            <Camera size={18} aria-hidden />{photo ? 'התמונה צורפה ✓' : 'צירוף תמונה (לא חובה)'}
            <input type="file" accept="image/*" hidden data-testid="dispute-photo" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setPhoto(await compressImage(f)); } catch { show('לא הצלחנו לקרוא את התמונה', 'error'); } } }} />
          </label>
          {dErr && <p role="alert" className="text-xs text-bad">{dErr}</p>}
          <button className="tap w-full rounded-2xl bg-bad py-3 font-bold text-white" onClick={submitDispute}>שלח דיווח והקפא תשלום</button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'rate'} onClose={() => setSheet(null)} title={`דרג את ${seller.name}`}>
        <div className="space-y-3">
          <div className="flex justify-center gap-1" role="radiogroup" aria-label="דירוג">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} כוכבים`} onClick={() => setStars(n)} className="tap flex items-center justify-center">
                <Star size={34} className={n <= stars ? 'fill-escrow text-escrow-dark' : 'text-gray-300'} />
              </button>
            ))}
          </div>
          <input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={140} placeholder="תגובה קצרה (לא חובה)" aria-label="תגובה" className="tap w-full rounded-xl bg-gray-50 px-3 text-sm outline-none ring-1 ring-gray-200 focus:ring-primary" />
          <button className={primary} onClick={submitRating}>שלח דירוג</button>
        </div>
      </Sheet>
    </div>
  );
}
