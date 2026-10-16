import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useToast } from './Toast';
import { fmt } from '../lib/money';
import type { User } from '../types';

export const Avatar = ({ user, size = 32 }: { user: User; size?: number }) => (
  <span className="flex items-center justify-center rounded-full text-white" style={{ width: size, height: size, background: user.color, fontSize: size * 0.55 }} aria-hidden>
    {user.avatar}
  </span>
);

export default function UserSwitcher() {
  const [open, setOpen] = useState(false);
  const users = useStore((s) => s.users);
  const currentId = useStore((s) => s.currentUserId);
  const switchUser = useStore((s) => s.switchUser);
  const show = useToast((s) => s.show);
  const me = users[currentId];

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="החלפת משתמש" aria-expanded={open} className="tap flex items-center gap-1.5 rounded-full bg-primary-soft py-1 pe-2 ps-1">
        <Avatar user={me} />
        <span className="text-sm font-medium">{me.name}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5">
              {Object.values(users).map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      if (u.id !== currentId) { switchUser(u.id); show(`עברת לחשבון של ${u.name} 👋`); }
                    }}
                    className="tap flex w-full items-center gap-3 px-3 py-2.5 text-start hover:bg-primary-soft"
                  >
                    <Avatar user={u} size={36} />
                    <span className="flex-1">
                      <span className="block text-sm font-bold">{u.name} · {u.role}</span>
                      <span className="block text-xs text-ink-soft">יתרה {fmt(u.wallet.available)}</span>
                    </span>
                    {u.id === currentId && <Check size={16} className="text-primary" aria-hidden />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
