import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/money';
import SafeImage from '../components/SafeImage';
import EmptyState from '../components/EmptyState';
import { OrderListSkeleton, useSkeleton } from '../components/Skeleton';
import { statusLabel, statusColor, needsAction } from '../lib/status';

export default function Orders() {
  const me = useStore((s) => s.currentUserId);
  const orders = useStore((s) => s.orders);
  const items = useStore((s) => s.items);
  const loading = useSkeleton();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const mine = (k: 'buy' | 'sell') => orders.filter((o) => (k === 'buy' ? o.buyerId === me : o.sellerId === me));
  const pendingCount = (k: 'buy' | 'sell') => mine(k).filter((o) => needsAction(o, me)).length;
  const list = orders.filter((o) => (tab === 'buy' ? o.buyerId === me : o.sellerId === me));

  return (
    <div className="space-y-3 p-4">
      <div className="flex rounded-xl bg-white p-1 shadow-sm" role="tablist">
        {([['buy', 'קניתי'], ['sell', 'מכרתי']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`tap flex-1 rounded-lg text-sm font-bold ${tab === k ? 'bg-primary text-white' : 'text-ink-soft'}`}>{l}{pendingCount(k) > 0 && <span className="ms-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-escrow-dark px-1 text-[11px] text-white">{pendingCount(k)}</span>}</button>
        ))}
      </div>
      {loading && <OrderListSkeleton />}
      {!loading && list.length === 0 && (tab === 'buy'
        ? <EmptyState emoji="👗" title="עוד אין הזמנות" text="עוד לא קנית כלום. אפשר להתחיל לחפש משהו שמתאים." cta={{ label: 'לגלות פריטים', to: '/' }} />
        : <EmptyState emoji="📦" title="עוד לא מכרת כלום" text="אפשר להעלות את הפריט הראשון בדקה אחת." cta={{ label: 'העלה פריט', to: '/sell' }} />)}
      {!loading && list.map((o) => {
        const item = items.find((i) => i.id === o.itemId);
        return (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
            {item && <SafeImage src={item.images[0]} category={item.category} alt={item.title} w={200} className="h-16 w-16 shrink-0 rounded-xl" />}
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{item?.title}</div>
              <div className="text-xs text-ink-soft">{o.id}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-black">{fmt(o.total)}</span>
                <span className="flex items-center gap-1">
                  {needsAction(o, me) && <span className="rounded-full bg-escrow-dark px-2 py-0.5 text-xs font-bold text-white">ממתין לך</span>}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
