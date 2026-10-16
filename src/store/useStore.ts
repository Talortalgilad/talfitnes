import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Item, Notification, Order, Transaction, UserId } from '../types';
import { createSeed, type AppData } from '../data/seed';
import { calcTotals } from '../lib/money';
import { useToast } from '../components/Toast';

// localStorage wrapper: never throws; reports a full quota with a toast.
const safeStorage = {
  getItem: (k: string) => {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  setItem: (k: string, v: string) => {
    try { localStorage.setItem(k, v); } catch { useToast.getState().show('האחסון במכשיר מלא, השינויים לא נשמרו', 'error'); }
  },
  removeItem: (k: string) => {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  },
};

interface State extends AppData {
  currentUserId: UserId;
  switchUser: (id: UserId) => void;
  toggleLike: (itemId: string) => void;
  topUp: () => void;
  buyItem: (itemId: string, address: string) => { ok: true; orderId: string } | { ok: false; error: string };
  markRead: (id: string) => void;
  markAllRead: () => void;
  resetDemo: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      currentUserId: 'noa',

      switchUser: (id) => set({ currentUserId: id }),

      toggleLike: (itemId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id !== itemId ? i : { ...i, likes: i.likes.includes(s.currentUserId) ? i.likes.filter((u) => u !== s.currentUserId) : [...i.likes, s.currentUserId] },
          ),
        })),

      topUp: () =>
        set((s) => {
          const u = s.users[s.currentUserId];
          const tx: Transaction = { id: uid(), userId: u.id, type: 'topup', amount: 500, text: 'טעינת ארנק (מדומה)', at: Date.now() };
          return { users: { ...s.users, [u.id]: { ...u, wallet: { ...u.wallet, available: u.wallet.available + 500 } } }, transactions: [tx, ...s.transactions] };
        }),

      buyItem: (itemId, address) => {
        const s = get();
        const item = s.items.find((i) => i.id === itemId);
        const buyer = s.users[s.currentUserId];
        if (!item) return { ok: false, error: 'הפריט לא נמצא' };
        if (item.status !== 'active') return { ok: false, error: 'הפריט כבר נמכר' };
        if (item.sellerId === buyer.id) return { ok: false, error: 'זה הפריט שלך' };
        const t = calcTotals(item.price);
        if (buyer.wallet.available < t.total) return { ok: false, error: 'אין מספיק יתרה בארנק' };

        const seller = s.users[item.sellerId];
        const now = Date.now();
        const order: Order = {
          id: `RW-${s.orderSeq}`, itemId, buyerId: buyer.id, sellerId: seller.id, ...t,
          status: 'paid_escrow', shippingAddress: address,
          timeline: [{ status: 'paid_escrow', at: now }],
        };
        const note: Notification = {
          id: uid(), userId: seller.id, orderId: order.id, read: false, at: now,
          text: `${buyer.name} קנתה את "${item.title}". הסכום מוחזק בנאמנות, אפשר לשלוח.`,
        };
        const tx: Transaction = { id: uid(), userId: buyer.id, type: 'purchase', amount: -t.total, text: `קנייה: ${item.title}`, orderId: order.id, at: now };

        set({
          users: {
            ...s.users,
            [buyer.id]: { ...buyer, wallet: { ...buyer.wallet, available: buyer.wallet.available - t.total } },
            [seller.id]: { ...seller, wallet: { ...seller.wallet, pending: seller.wallet.pending + t.itemPrice } },
          },
          items: s.items.map((i) => (i.id === itemId ? { ...i, status: 'sold' } : i)),
          orders: [order, ...s.orders],
          notifications: [note, ...s.notifications],
          transactions: [tx, ...s.transactions],
          orderSeq: s.orderSeq + 1,
        });
        return { ok: true, orderId: order.id };
      },

      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => (n.userId === s.currentUserId ? { ...n, read: true } : n)) })),

      resetDemo: () => set({ ...createSeed(), currentUserId: 'noa' }),
    }),
    {
      name: 'rewear-store-v1',
      storage: createJSONStorage(() => safeStorage),
      // Corrupt or partial persisted data falls back to the seed.
      merge: (persisted, current) => {
        const p = persisted as Partial<State> | undefined;
        const ok = p && p.users && p.users.noa && Array.isArray(p.items) && Array.isArray(p.orders) && Array.isArray(p.notifications) && Array.isArray(p.transactions) && p.currentUserId && p.users[p.currentUserId];
        return ok ? { ...current, ...p } : current;
      },
      partialize: (s) => ({ users: s.users, items: s.items, orders: s.orders, notifications: s.notifications, transactions: s.transactions, orderSeq: s.orderSeq, currentUserId: s.currentUserId }) as State,
    },
  ),
);

export type { Item };
export const useCurrentUser = () => useStore((s) => s.users[s.currentUserId]);
