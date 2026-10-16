import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Order } from '../types';

type StepState = 'done' | 'current' | 'future' | 'danger' | 'refund';

const BASE = [
  { emoji: '💳', label: 'שולם' },
  { emoji: '🔒', label: 'בנאמנות' },
  { emoji: '📦', label: 'נשלח' },
  { emoji: '🏠', label: 'הגיע' },
  { emoji: '💸', label: 'שוחרר למוכר' },
];

function states(status: Order['status']): StepState[] {
  switch (status) {
    case 'paid_escrow': return ['done', 'current', 'future', 'future', 'future'];
    case 'shipped': return ['done', 'done', 'current', 'future', 'future'];
    case 'delivered': return ['done', 'done', 'done', 'current', 'future'];
    case 'completed': return ['done', 'done', 'done', 'done', 'done'];
    case 'disputed': return ['done', 'done', 'done', 'done', 'danger'];
    case 'refunded': return ['done', 'done', 'done', 'done', 'refund'];
  }
}

const currentText: Partial<Record<Order['status'], string>> = {
  paid_escrow: 'הכסף מוחזק בנאמנות, ממתינים שהמוכר ישלח',
  shipped: 'החבילה בדרך לקונה',
  delivered: 'ממתין לאישור הקונה',
};

const fmtTime = (at?: number) => {
  if (!at) return '';
  const d = new Date(at);
  const today = new Date().toDateString() === d.toDateString();
  const t = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  return today ? `היום ${t}` : `${d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })} ${t}`;
};

export default function EscrowTimeline({ order }: { order: Order }) {
  const reduce = useReducedMotion();
  const st = states(order.status);
  const at = (s: Order['status'][]) => [...order.timeline].reverse().find((e) => s.includes(e.status))?.at;
  const times = [at(['paid_escrow']), at(['paid_escrow']), at(['shipped']), at(['delivered']), at(['completed', 'disputed', 'refunded'])];
  const labels = BASE.map((b, i) => {
    if (i !== 4) return b;
    if (order.status === 'disputed') return { emoji: '⚠️', label: 'הכסף מוקפא' };
    if (order.status === 'refunded') return { emoji: '↩️', label: 'הוחזר לקונה' };
    return b;
  });

  return (
    <ol className="space-y-0" aria-label="ציר נאמנות">
      {labels.map((step, i) => {
        const s = st[i];
        const next = st[i + 1];
        const lineFilled = next !== undefined && next !== 'future';
        const dot =
          s === 'done' ? 'bg-ok text-white' :
          s === 'current' ? 'bg-escrow text-white' :
          s === 'danger' ? 'bg-bad text-white' :
          s === 'refund' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400';
        const ring = s === 'current' ? 'bg-escrow' : s === 'danger' ? 'bg-bad' : '';
        const lineColor = next === 'danger' ? 'bg-bad' : next === 'refund' ? 'bg-blue-500' : 'bg-ok';
        return (
          <li key={i} className="flex gap-3" aria-current={s === 'current' ? 'step' : undefined}>
            <div className="flex flex-col items-center self-stretch">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                {ring && !reduce && <motion.span className={`absolute inset-0 rounded-full ${ring}`} animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} />}
                <motion.span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full text-base ${dot}`}
                  initial={{ scale: 0.6 }} animate={!reduce && (s === 'current' || s === 'danger') ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={!reduce && (s === 'current' || s === 'danger') ? { duration: 1.6, repeat: Infinity } : { type: 'spring', delay: i * 0.12 }}
                >
                  {s === 'done' ? <Check size={18} strokeWidth={3} aria-hidden /> : <span aria-hidden>{step.emoji}</span>}
                </motion.span>
              </div>
              {i < BASE.length - 1 && (
                <div className="relative my-1 min-h-6 w-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <motion.div className={`absolute inset-x-0 top-0 h-full origin-top ${lineColor}`} initial={{ scaleY: 0 }} animate={{ scaleY: lineFilled ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: 'easeOut' }} />
                </div>
              )}
            </div>
            <div className="pb-5 pt-1">
              <div className={`font-bold ${s === 'future' ? 'text-gray-400' : s === 'danger' ? 'text-bad' : ''}`}>{step.label}</div>
              {s !== 'future' && times[i] && <div className="text-xs text-ink-soft">{fmtTime(times[i])}</div>}
              {s === 'current' && currentText[order.status] && <div className="mt-0.5 text-xs font-medium text-escrow-dark">{currentText[order.status]}</div>}
              {s === 'danger' && <div className="mt-0.5 text-xs font-medium text-bad">התשלום מוקפא עד לבירור</div>}
              {i === 2 && order.trackingNumber && s !== 'future' && <div className="text-xs text-ink-soft" dir="ltr">{order.trackingNumber}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
