import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Wallet as WalletIcon } from 'lucide-react';
import { useStore, useCurrentUser } from '../store/useStore';
import { Avatar } from '../components/UserSwitcher';
import ItemGrid from '../components/ItemGrid';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { fmt } from '../lib/money';

export default function Profile() {
  const nav = useNavigate();
  const me = useCurrentUser();
  const all = useStore((s) => s.items);
  const items = useMemo(() => all.filter((i) => i.sellerId === me.id), [all, me.id]);
  const reset = useStore((s) => s.resetDemo);
  const setSeen = useStore((s) => s.setOnboardingSeen);
  const show = useToast((s) => s.show);
  const active = items.filter((i) => i.status === 'active');
  const sold = items.filter((i) => i.status === 'sold');
  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col items-center gap-1 p-4 pt-6">
        <Avatar user={me} size={72} />
        <h1 className="text-xl font-black">{me.name}</h1>
        <div className="text-sm text-ink-soft">{me.city}</div>
        <div className="flex items-center gap-1 text-sm font-bold"><Star size={14} className="fill-escrow text-escrow-dark" aria-hidden />{me.rating.toFixed(1)} ({me.ratingCount})</div>
      </div>
      <Link to="/wallet" className="tap mx-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft">
        <span className="flex items-center gap-2 font-bold"><WalletIcon size={20} className="text-primary" aria-hidden />הארנק שלי</span>
        <span className="font-black">{fmt(me.wallet.available)}</span>
      </Link>
      <h2 className="px-4 font-bold">הפריטים שלי למכירה ({active.length})</h2>
      {active.length ? <ItemGrid items={active} /> : <EmptyState emoji="🏷️" title="אין פריטים למכירה" text="עוד לא העלית פריטים. אפשר להתחיל עכשיו." cta={{ label: 'העלה פריט', to: '/sell' }} />}
      {sold.length > 0 && <><h2 className="px-4 font-bold">נמכרו ({sold.length})</h2><ItemGrid items={sold} /></>}
      <div className="space-y-2 px-4">
        <button onClick={() => setSeen(false)} className="tap w-full rounded-2xl bg-white py-3 text-sm font-bold text-primary shadow-soft">הצג שוב את ההסבר על ReWear</button>
        <button onClick={() => { if (window.confirm('לאפס את הדמו ולטעון מחדש את נתוני ההתחלה?')) { reset(); nav('/'); show('הדמו אופס'); } }} className="tap w-full rounded-2xl border border-bad/40 py-3 text-sm font-bold text-bad">איפוס דמו</button>
      </div>
    </div>
  );
}
