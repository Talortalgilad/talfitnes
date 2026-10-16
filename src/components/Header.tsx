import { Bell, Recycle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import UserSwitcher from './UserSwitcher';

export default function Header() {
  const unread = useStore((s) => s.notifications.filter((n) => n.userId === s.currentUserId && !n.read).length);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <Link to="/" className="tap flex items-center gap-1.5 text-xl font-black text-primary" aria-label="ReWear - דף הבית">
        <Recycle size={24} aria-hidden />
        ReWear
      </Link>
      <div className="flex items-center gap-1">
        <Link to="/notifications" className="tap relative flex items-center justify-center" aria-label={`התראות${unread ? `, ${unread} חדשות` : ''}`}>
          <Bell size={22} aria-hidden />
          {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold text-white">{unread}</span>}
        </Link>
        <UserSwitcher />
      </div>
    </header>
  );
}
