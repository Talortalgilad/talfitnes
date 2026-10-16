import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastState {
  msg: string | null;
  kind: 'ok' | 'error';
  show: (msg: string, kind?: 'ok' | 'error') => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>((set) => ({
  msg: null,
  kind: 'ok',
  show: (msg, kind = 'ok') => {
    clearTimeout(timer);
    set({ msg, kind });
    timer = setTimeout(() => set({ msg: null }), 2600);
  },
}));

export default function Toast() {
  const { msg, kind } = useToast();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-soft ${kind === 'error' ? 'bg-bad' : 'bg-ink'}`}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
