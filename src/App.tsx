import { Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useStore } from './store/useStore';
import DemoGuide from './components/DemoGuide';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import NotFound from './pages/NotFound';
import PageTransition from './components/PageTransition';
import { PageSkeleton } from './components/Skeleton';
import Home from './pages/Home';
import Search from './pages/Search';
import ItemPage from './pages/Item';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// Heavier / less common screens load on demand to keep the first paint fast.
const Sell = lazy(() => import('./pages/Sell'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));

export default function App() {
  const { pathname } = useLocation();
  // Auto-release: a delivered order whose 48h window has passed is released to the seller.
  useEffect(() => {
    const t = setInterval(() => {
      const st = useStore.getState();
      const due = st.orders.find((o) => o.status === 'delivered' && o.autoReleaseAt && o.autoReleaseAt <= Date.now());
      if (due) st.releasePayment(due.id, true);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const onboardingSeen = useStore((s) => s.onboardingSeen);
  const hideNav = pathname.startsWith('/item/') || pathname.startsWith('/checkout/');
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-bg pb-32 shadow-soft md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-3xl">
      <Header />
      <main>
        <PageTransition>
        <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </PageTransition>
      </main>
      {!hideNav && <BottomNav />}
      {onboardingSeen ? <DemoGuide /> : <Onboarding />}
      <Toast />
    </div>
  );
}
