import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '../types';
import { fmt } from '../lib/money';

type Holder = 'buyer' | 'escrow' | 'seller';

const holderOf = (s: Order['status']): Holder =>
  s === 'completed' ? 'seller' : s === 'refunded' ? 'buyer' : 'escrow';

const caption: Record<Order['status'], string> = {
  paid_escrow: 'הכסף עבר מהקונה לנאמנות ומוחזק שם',
  shipped: 'הכסף נשאר בנאמנות עד שהחבילה תגיע',
  delivered: 'הכסף ממתין בנאמנות לאישור הקונה',
  completed: 'הכסף שוחרר למוכר 💸',
  disputed: 'הכסף מוקפא עד לבירור המחלוקת',
  refunded: 'הכסף הוחזר במלואו לקונה',
};

export default function MoneyFlow({ order, buyerName, sellerName }: { order: Order; buyerName: string; sellerName: string }) {
  const holder = holderOf(order.status);
  const frozen = order.status === 'disputed';
  const amount = order.status === 'refunded' ? order.total : order.itemPrice;

  const boxes: { key: Holder; icon: string; title: string; sub: string }[] = [
    { key: 'buyer', icon: '🛍️', title: 'קונה', sub: buyerName },
    { key: 'escrow', icon: frozen ? '❄️' : '🔒', title: 'נאמנות', sub: frozen ? 'מוקפא' : 'ReWear' },
    { key: 'seller', icon: '🏷️', title: 'מוכר', sub: sellerName },
  ];

  return (
    <div>
      <div className="flex items-stretch gap-1" role="group" aria-label="איפה הכסף עכשיו">
        {boxes.map((b, i) => {
          const active = holder === b.key;
          const tone = b.key === 'escrow' ? (frozen ? 'border-bad bg-red-50' : 'border-escrow bg-escrow-soft') : b.key === 'seller' ? 'border-ok bg-green-50' : 'border-blue-400 bg-blue-50';
          return (
            <div key={b.key} className="flex flex-1 items-center gap-1">
              <motion.div
                animate={active ? { scale: 1 } : { scale: 0.96 }}
                className={`flex min-h-[132px] flex-1 flex-col items-center rounded-2xl border-2 p-2 text-center ${active ? tone : 'border-dashed border-gray-200 bg-gray-50'}`}
                data-testid={`box-${b.key}`}
              >
                <div className="text-2xl" aria-hidden>{b.icon}</div>
                <div className="text-xs font-bold">{b.title}</div>
                <div className={`text-[11px] ${frozen && b.key === 'escrow' ? 'font-bold text-bad' : 'text-ink-soft'}`}>{b.sub}</div>
                <div className="mt-auto flex min-h-8 items-end">
                  {active ? (
                    <motion.div
                      layoutId={`coin-${order.id}`} transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                      className={`rounded-full px-2.5 py-1 text-sm font-black text-white shadow ${frozen ? 'bg-bad' : b.key === 'seller' ? 'bg-ok-dark' : b.key === 'escrow' ? 'bg-escrow-dark' : 'bg-blue-500'}`}
                      data-testid="coin"
                    >
                      {fmt(amount)}
                    </motion.div>
                  ) : <span className="text-sm text-gray-300">—</span>}
                </div>
              </motion.div>
              {i < 2 && <ChevronLeft size={16} className="shrink-0 text-gray-300" aria-hidden />}
            </div>
          );
        })}
      </div>
      <p className={`mt-3 text-center text-sm font-medium ${frozen ? 'text-bad' : 'text-ink-soft'}`}>{caption[order.status]}</p>
      {order.status !== 'refunded' && <p className="mt-1 text-center text-xs text-ink-soft">בנוסף שולמו {fmt(order.shippingFee)} דמי משלוח ו-{fmt(order.protectionFee)} הגנת קונה</p>}
    </div>
  );
}
