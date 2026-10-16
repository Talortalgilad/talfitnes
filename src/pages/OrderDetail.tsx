import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/money';
import { statusLabel, statusColor } from '../lib/status';
import EmptyState from '../components/EmptyState';

// Minimal summary for stage 3; the escrow timeline and actions arrive in stage 5.
export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const item = useStore((s) => s.items.find((i) => i.id === order?.itemId));
  if (!order) return <EmptyState emoji="🤷" text="ההזמנה לא נמצאה" />;
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} aria-label="חזרה" className="tap flex items-center justify-center"><ArrowRight size={22} /></button>
        <h1 className="text-xl font-black">הזמנה {order.id}</h1>
      </div>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-soft text-sm">
        <div className="font-bold">{item?.title}</div>
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
        <div className="flex justify-between"><span className="text-ink-soft">פריט</span>{fmt(order.itemPrice)}</div>
        <div className="flex justify-between"><span className="text-ink-soft">משלוח</span>{fmt(order.shippingFee)}</div>
        <div className="flex justify-between"><span className="text-ink-soft">הגנת קונה</span>{fmt(order.protectionFee)}</div>
        <div className="flex justify-between border-t pt-2 font-black"><span>סה״כ</span>{fmt(order.total)}</div>
        <div className="text-xs text-ink-soft">כתובת: {order.shippingAddress}</div>
      </div>
    </div>
  );
}
