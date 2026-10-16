import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Compass, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useStore } from '../store/useStore';
import type { UserId } from '../types';
import Sheet from './Sheet';

interface Step { title: string; user: UserId; go: (g: { listedItemId: string | null; orderId: string | null }) => string }

const STEPS: Step[] = [
  { title: 'עבור לדני והעלה בגד למכירה', user: 'dani', go: () => '/sell' },
  { title: 'עבור לנועה וקנה אותו', user: 'noa', go: (g) => (g.orderId ? `/orders/${g.orderId}` : g.listedItemId ? `/item/${g.listedItemId}` : '/') },
  { title: 'עבור לדני וסמן כנשלח', user: 'dani', go: (g) => (g.orderId ? `/orders/${g.orderId}` : '/orders') },
  { title: 'עבור לנועה, סמן שהגיע ושחרר תשלום', user: 'noa', go: (g) => (g.orderId ? `/orders/${g.orderId}` : '/orders') },
  { title: 'ראה את הכסף בארנק של דני 💸', user: 'dani', go: () => '/wallet' },
];

export default function DemoGuide() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const guide = useStore((s) => s.guide);
  const switchUser = useStore((s) => s.switchUser);
  const celebrate = useStore((s) => s.celebrateGuide);
  const resetDemo = useStore((s) => s.resetDemo);
  const count = guide.done.filter(Boolean).length;
  const allDone = count === STEPS.length;
  const firstUndone = guide.done.indexOf(false);

  useEffect(() => {
    if (allDone && !guide.celebrated) {
      setOpen(false);
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    }
  }, [allDone, guide.celebrated]);

  // Sits above the bottom nav; on the item page it also clears the fixed buy bar.
  const bottom = pathname.startsWith('/item/') ? 88 : pathname.startsWith('/checkout/') ? 16 : 80;

  const take = (i: number) => {
    const step = STEPS[i];
    switchUser(step.user);
    setOpen(false);
    nav(step.go(useStore.getState().guide));
  };

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 z-[35] flex w-full max-w-[480px] -translate-x-1/2 justify-end px-4" style={{ bottom }}>
        <button
          onClick={() => setOpen(true)}
          aria-label={`מדריך דמו, ${count} מתוך ${STEPS.length} שלבים הושלמו`}
          data-testid="guide-fab"
          className="pointer-events-auto flex h-10 items-center gap-1.5 rounded-full bg-ink px-3 text-xs font-bold text-white shadow-soft"
        >
          <Compass size={16} aria-hidden />מדריך דמו
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${allDone ? 'bg-ok' : 'bg-white/20'}`}>{count}/{STEPS.length}</span>
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="מדריך דמו 🧭">
        <p className="mb-3 text-sm text-ink-soft">עוברים על כל זרימת הקנייה בנאמנות ב-5 צעדים. כל שלב מסומן אוטומטית כשהפעולה מתבצעת.</p>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={count}>
          <motion.div className="h-full bg-primary" initial={false} animate={{ width: `${(count / STEPS.length) * 100}%` }} />
        </div>
        <ol className="space-y-2">
          {STEPS.map((s, i) => {
            const done = guide.done[i];
            const locked = !done && i !== firstUndone;
            return (
              <li key={i} data-testid={`guide-step-${i + 1}`} data-done={done} className={`flex items-center gap-3 rounded-2xl p-3 ${done ? 'bg-green-50' : 'bg-gray-50'}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-ok text-white' : 'bg-white text-ink-soft ring-1 ring-gray-200'}`}>
                  {done ? <Check size={16} strokeWidth={3} aria-label="הושלם" /> : i + 1}
                </span>
                <span className={`flex-1 text-sm font-medium ${done ? 'text-ink-soft line-through' : ''}`}>{s.title}</span>
                <button
                  onClick={() => take(i)}
                  disabled={locked}
                  aria-label={locked ? 'קודם יש להשלים את השלבים הקודמים' : `קח אותי לשם: ${s.title}`}
                  className="tap flex shrink-0 items-center gap-1 rounded-xl bg-primary px-3 text-xs font-bold text-white disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {locked && <Lock size={12} aria-hidden />}קח אותי לשם
                </button>
              </li>
            );
          })}
        </ol>
      </Sheet>

      {allDone && !guide.celebrated && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 px-6" role="dialog" aria-modal="true" aria-label="סיום המסלול">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-[380px] rounded-3xl bg-white p-6 text-center shadow-soft">
            <div className="text-5xl" aria-hidden>🎉</div>
            <h2 className="mt-2 text-2xl font-black">השלמת את כל המסלול!</h2>
            <p className="mt-2 text-sm text-ink-soft">העלית פריט, קנית אותו בנאמנות, שלחת, אישרת קבלה ושחררת תשלום. הכסף הגיע למוכר רק אחרי שהבגד הגיע ✓</p>
            <div className="mt-5 space-y-2">
              <button onClick={() => { celebrate(); nav('/'); }} className="tap w-full rounded-2xl bg-primary py-3 font-bold text-white">המשך לגלוש באפליקציה</button>
              <button onClick={() => { resetDemo(); nav('/'); }} className="tap w-full rounded-2xl border-2 border-dashed border-ink-soft/50 py-3 text-sm font-bold text-ink-soft">איפוס דמו והתחלה מחדש</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
