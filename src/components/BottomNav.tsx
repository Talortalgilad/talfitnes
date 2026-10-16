import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { needsAction } from '../lib/status';
import { Home, Search, Plus, Package, User } from 'lucide-react';

const tabs = [
  { to: '/', label: 'בית', Icon: Home, end: true },
  { to: '/search', label: 'חיפוש', Icon: Search },
  { to: '/sell', label: 'מכירה', Icon: Plus, main: true },
  { to: '/orders', label: 'הזמנות', Icon: Package },
  { to: '/profile', label: 'פרופיל', Icon: User },
];

export default function BottomNav() {
  const pending = useStore((s) => s.orders.filter((o) => needsAction(o, s.currentUserId)).length);
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full -translate-x-1/2 max-w-[480px] border-t border-gray-100 bg-white" aria-label="ניווט ראשי">
      <ul className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {tabs.map(({ to, label, Icon, end, main }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                main
                  ? 'tap -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-soft hover:bg-primary-hover'
                  : `tap relative flex flex-col items-center justify-center gap-0.5 px-2 text-[11px] ${isActive ? 'font-bold text-primary' : 'text-ink-soft'}`
              }
            >
              <Icon size={main ? 28 : 22} aria-hidden />
              {to === '/orders' && pending > 0 && <span data-testid="nav-badge" className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-escrow-dark px-1 text-[10px] font-bold text-white">{pending}</span>}
              {!main && label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
