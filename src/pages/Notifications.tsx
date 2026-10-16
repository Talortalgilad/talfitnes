import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';

export default function Notifications() {
  const nav = useNavigate();
  const all = useStore((s) => s.notifications);
  const me = useStore((s) => s.currentUserId);
  const list = useMemo(() => all.filter((n) => n.userId === me), [all, me]);
  const markRead = useStore((s) => s.markRead);
  const markAll = useStore((s) => s.markAllRead);
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-black">התראות</h1>{list.some((n) => !n.read) && <button onClick={markAll} className="tap text-sm font-medium text-primary">סמן הכול כנקרא</button>}</div>
      {list.length === 0 && <EmptyState emoji="🔔" title="הכול שקט" text="אין התראות חדשות. נעדכן כאן על כל תזוזה בהזמנות שלך." cta={{ label: 'לגלות פריטים', to: '/' }} />}
      {list.map((n) => (
        <button key={n.id} onClick={() => { markRead(n.id); if (n.orderId) nav(`/orders/${n.orderId}`); }} className={`tap block w-full rounded-2xl p-3 text-start text-sm shadow-sm ${n.read ? 'bg-white' : 'bg-primary-soft'}`}>
          {n.text}<span className="mt-1 block text-xs text-ink-soft">{new Date(n.at).toLocaleString('he-IL')}</span>
        </button>
      ))}
    </div>
  );
}
