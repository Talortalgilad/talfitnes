import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import Placeholder from './pages/Placeholder';
import Sell from './pages/Sell';
import Home from './pages/Home';
import Search from './pages/Search';
import ItemPage from './pages/Item';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

export default function App() {
  const { pathname } = useLocation();
  const hideNav = pathname.startsWith('/item/') || pathname.startsWith('/checkout/');
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-bg pb-24 shadow-soft md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-3xl">
      <Header />
      <main>
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
          <Route path="*" element={<Placeholder title="העמוד לא נמצא" emoji="🤷" />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
      <Toast />
    </div>
  );
}
