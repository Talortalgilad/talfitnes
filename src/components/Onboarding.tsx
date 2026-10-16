import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

const Box = ({ icon, label, active }: { icon: string; label: string; active?: boolean }) => (
  <div className={`flex w-20 flex-col items-center rounded-2xl border-2 p-3 ${active ? 'border-escrow bg-escrow-soft' : 'border-gray-200 bg-white'}`}>
    <span className="text-3xl" aria-hidden>{icon}</span><span className="mt-1 text-xs font-bold">{label}</span>
  </div>
);

const slides = [
  {
    art: <div className="text-7xl" aria-hidden>♻️👗</div>,
    title: 'ברוכים הבאים ל-ReWear',
    text: 'קונים ומוכרים בגדי יד שנייה במקום אחד. מעלים פריט בדקה, ומוצאים בגדים שווים במחיר טוב.',
  },
  {
    art: (
      <div className="flex items-center gap-1" aria-hidden>
        <Box icon="🛍️" label="קונה" /><ChevronLeft className="text-gray-300" /><Box icon="🔒" label="נאמנות" active /><ChevronLeft className="text-gray-300" /><Box icon="🏷️" label="מוכר" />
      </div>
    ),
    title: 'תשלום בנאמנות',
    text: 'כשקונים, הכסף לא עובר ישר למוכר. הוא מוחזק אצלנו בנאמנות, בטוח, עד שהפריט מגיע.',
  },
  {
    art: <div className="text-7xl" aria-hidden>📦✅💸</div>,
    title: 'הכסף משתחרר רק כשהבגד אצלך',
    text: 'אחרי שהחבילה הגיעה ואישרת שהכול תקין, הכסף משתחרר למוכר. יש בעיה? מקפיאים את התשלום ומקבלים החזר. אפשר לעבור על הכול במדריך הדמו.',
  },
];

export default function Onboarding() {
  const setSeen = useStore((s) => s.setOnboardingSeen);
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const s = slides[i];

  return (
    <div className="fixed inset-0 z-[70] flex justify-center bg-[#EEF1EC]" role="dialog" aria-modal="true" aria-label="היכרות עם ReWear">
      <div className="relative flex h-full w-full max-w-[480px] flex-col bg-bg px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <div className="flex justify-start">
          {!last && <button onClick={() => setSeen(true)} className="tap px-2 text-sm font-medium text-ink-soft">דלג</button>}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-44 items-center justify-center">{s.art}</div>
              <h1 className="text-2xl font-black text-primary">{s.title}</h1>
              <p className="max-w-[320px] text-base leading-relaxed text-ink-soft">{s.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mb-5 flex justify-center gap-2" aria-hidden>
          {slides.map((_, n) => <span key={n} className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-primary' : 'w-2 bg-gray-300'}`} />)}
        </div>
        <button onClick={() => (last ? setSeen(true) : setI(i + 1))} className="tap w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white hover:bg-primary-hover">
          {last ? 'בואו נתחיל' : 'הבא'}
        </button>
      </div>
    </div>
  );
}
