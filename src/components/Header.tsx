import { Bell, Recycle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <Link to="/" className="flex items-center gap-1.5 text-xl font-black text-primary" aria-label="ReWear - דף הבית">
        <Recycle size={24} aria-hidden />
        ReWear
      </Link>
      <div className="flex items-center gap-2">
        <button className="tap flex items-center gap-2 rounded-full bg-primary-soft px-2 py-1" aria-label="החלפת משתמש">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">נ</span>
          <span className="text-sm font-medium">נועה</span>
        </button>
        <Link to="/notifications" className="tap relative flex items-center justify-center" aria-label="התראות">
          <Bell size={22} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
