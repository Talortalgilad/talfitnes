import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Placeholder from './pages/Placeholder';

const screens: [string, string, string][] = [
  ['/', 'בית', '🏠'],
  ['/search', 'חיפוש', '🔍'],
  ['/sell', 'מכירה', '➕'],
  ['/orders', 'הזמנות', '📦'],
  ['/profile', 'פרופיל', '👤'],
  ['/wallet', 'ארנק', '👛'],
  ['/notifications', 'התראות', '🔔'],
];

export default function App() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-bg pb-24 shadow-soft md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-3xl">
      <Header />
      <main>
        <Routes>
          {screens.map(([path, title, emoji]) => (
            <Route key={path} path={path} element={<Placeholder title={title} emoji={emoji} />} />
          ))}
          <Route path="*" element={<Placeholder title="העמוד לא נמצא" emoji="🤷" />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
