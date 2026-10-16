import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Item, Notification, Order, OrderStatus, Transaction, UserId } from '../types';
import { AUTO_RELEASE_MS } from '../lib/status';
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

export interface GuideState {
  listedItemId: string | null; // the item Dani listed in step 1
  orderId: string | null;      // the order Noa created in step 2
  done: boolean[];             // 5 steps, derived from real store actions
  celebrated: boolean;
}
export const defaultGuide = (): GuideState => ({ listedItemId: null, orderId: null, done: [false, false, false, false, false], celebrated: false });
const mark = (g: GuideState, i: number, extra: Partial<GuideState> = {}): GuideState => ({ ...g, ...extra, done: g.done.map((d, n) => (n === i ? true : d)) });

type Res = { ok: true } | { ok: false; error: string };

interface State extends AppData {
  currentUserId: UserId;
  guide: GuideState;
  onboardingSeen: boolean;
  setOnboardingSeen: (v: boolean) => void;
  guideWalletViewed: () => void;
  celebrateGuide: () => void;
  switchUser: (id: UserId) => void;
  toggleLike: (itemId: string) => void;
  topUp: () => void;
  listItem: (data: Omit<Item, 'id' | 'sellerId' | 'status' | 'createdAt' | 'likes'>) => string;
  buyItem: (itemId: string, address: string) => { ok: true; orderId: string } | { ok: false; error: string };
  markShipped: (orderId: string) => Res;
  markDelivered: (orderId: string) => Res;
  releasePayment: (orderId: string, auto?: boolean) => Res;
  openDispute: (orderId: string, d: { reason: string; details: string; photo?: string }) => Res;
  resolveRefund: (orderId: string) => Res;
  rateSeller: (orderId: string, stars: number, comment: string) => Res;
  markRead: (id: string) => void;
  markAllRead: () => void;
  resetDemo: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
// Noa buying the item Dani listed in the guide (or re-buying it after a refund) binds the guide to that order.
const buyerIsGuide = (s: AppData & { guide: GuideState }, buyerId: UserId, itemId: string) => {
  if (buyerId !== 'noa' || s.guide.listedItemId !== itemId) return false;
  const prev = s.orders.find((o) => o.id === s.guide.orderId);
  return !prev || prev.status === 'refunded';
};
const fail = (error: string): Res => ({ ok: false, error });

const advance = (o: Order, status: OrderStatus, now: number, note?: string, extra: Partial<Order> = {}): Order => ({
  ...o, ...extra, status, timeline: [...o.timeline, { status, at: now, note }],
});
const note = (userId: UserId, text: string, orderId: string, at: number): Notification => ({ id: uid(), userId, text, orderId, read: false, at });

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      currentUserId: 'noa',
      guide: defaultGuide(),
      onboardingSeen: false,
      setOnboardingSeen: (v) => set({ onboardingSeen: v }),
      celebrateGuide: () => set((s) => ({ guide: { ...s.guide, celebrated: true } })),
      // Step 5: Dani opens his wallet after the payment was released (the only step that is a "view").
      guideWalletViewed: () => {
        const s = get();
        if (s.currentUserId === 'dani' && s.guide.done[3] && !s.guide.done[4]) set({ guide: mark(s.guide, 4) });
      },

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

      listItem: (data) => {
        const s = get();
        const item: Item = { ...data, id: `item-${uid()}`, sellerId: s.currentUserId, status: 'active', createdAt: Date.now(), likes: [] };
        const guide = s.currentUserId === 'dani' && !s.guide.listedItemId ? mark(s.guide, 0, { listedItemId: item.id }) : s.guide;
        set({ items: [item, ...s.items], guide });
        return item.id;
      },

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
          items: s.items.map((i) => (i.id === itemId ? { ...i, status: 'sold', relisted: false } : i)),
          guide: buyerIsGuide(s, buyer.id, itemId) ? { ...mark(s.guide, 1, { orderId: order.id }), done: [s.guide.done[0], true, false, false, false] } : s.guide,
          orders: [order, ...s.orders],
          notifications: [note, ...s.notifications],
          transactions: [tx, ...s.transactions],
          orderSeq: s.orderSeq + 1,
        });
        return { ok: true, orderId: order.id };
      },

      markShipped: (orderId) => {
        const s = get();
        const o = s.orders.find((x) => x.id === orderId);
        if (!o) return fail('ההזמנה לא נמצאה');
        if (o.status !== 'paid_escrow') return fail('אי אפשר לסמן כנשלח במצב הנוכחי');
        if (o.sellerId !== s.currentUserId) return fail('רק המוכר יכול לסמן כנשלח');
        const now = Date.now();
        const tracking = `RW${Math.floor(10_000_000 + Math.random() * 90_000_000)}`;
        const title = s.items.find((i) => i.id === o.itemId)?.title ?? 'הפריט';
        set({
          orders: s.orders.map((x) => (x.id === orderId ? advance(x, 'shipped', now, tracking, { trackingNumber: tracking }) : x)),
          guide: s.guide.orderId === orderId ? mark(s.guide, 2) : s.guide,
          notifications: [note(o.buyerId, `"${title}" נשלח אליך! מספר מעקב ${tracking}`, o.id, now), ...s.notifications],
        });
        return { ok: true };
      },

      markDelivered: (orderId) => {
        const s = get();
        const o = s.orders.find((x) => x.id === orderId);
        if (!o) return fail('ההזמנה לא נמצאה');
        if (o.status !== 'shipped') return fail('אי אפשר לסמן כהגיע במצב הנוכחי');
        const now = Date.now();
        const title = s.items.find((i) => i.id === o.itemId)?.title ?? 'הפריט';
        set({
          orders: s.orders.map((x) => (x.id === orderId ? advance(x, 'delivered', now, undefined, { autoReleaseAt: now + AUTO_RELEASE_MS }) : x)),
          notifications: [
            note(o.buyerId, `"${title}" הגיע. אשר שהכול תקין כדי לשחרר את התשלום, או דווח על בעיה.`, o.id, now),
            note(o.sellerId, `"${title}" הגיע לקונה. התשלום ישוחרר אחרי אישור הקונה.`, o.id, now),
            ...s.notifications,
          ],
        });
        return { ok: true };
      },

      releasePayment: (orderId, auto = false) => {
        const s = get();
        const o = s.orders.find((x) => x.id === orderId);
        if (!o) return fail('ההזמנה לא נמצאה');
        if (o.status !== 'delivered') return fail('אי אפשר לשחרר תשלום במצב הנוכחי');
        if (!auto && o.buyerId !== s.currentUserId) return fail('רק הקונה יכול לשחרר תשלום');
        const now = Date.now();
        const seller = s.users[o.sellerId];
        const title = s.items.find((i) => i.id === o.itemId)?.title ?? 'הפריט';
        const tx: Transaction = { id: uid(), userId: seller.id, type: 'income', amount: o.itemPrice, text: `הכנסה: ${title}`, orderId: o.id, at: now };
        const notes = [note(seller.id, `💸 ₪${o.itemPrice.toLocaleString('he-IL')} שוחררו לארנק שלך עבור "${title}"${auto ? ' (שחרור אוטומטי)' : ''}`, o.id, now)];
        if (auto) notes.push(note(o.buyerId, `התשלום עבור "${title}" שוחרר אוטומטית למוכר אחרי 48 שעות.`, o.id, now));
        set({
          users: { ...s.users, [seller.id]: { ...seller, wallet: { available: seller.wallet.available + o.itemPrice, pending: seller.wallet.pending - o.itemPrice } } },
          orders: s.orders.map((x) => (x.id === orderId ? advance(x, 'completed', now, auto ? 'שחרור אוטומטי' : undefined, { autoReleaseAt: undefined }) : x)),
          guide: s.guide.orderId === orderId ? mark(s.guide, 3) : s.guide,
          transactions: [tx, ...s.transactions],
          notifications: [...notes, ...s.notifications],
        });
        return { ok: true };
      },

      openDispute: (orderId, d) => {
        const s = get();
        const o = s.orders.find((x) => x.id === orderId);
        if (!o) return fail('ההזמנה לא נמצאה');
        if (o.status !== 'delivered') return fail('אי אפשר לפתוח מחלוקת במצב הנוכחי');
        if (o.buyerId !== s.currentUserId) return fail('רק הקונה יכול לדווח על בעיה');
        const now = Date.now();
        const title = s.items.find((i) => i.id === o.itemId)?.title ?? 'הפריט';
        set({
          orders: s.orders.map((x) => (x.id === orderId ? advance(x, 'disputed', now, d.reason, { dispute: d, autoReleaseAt: undefined }) : x)),
          notifications: [note(o.sellerId, `הקונה דיווח על בעיה ב"${title}" (${d.reason}). התשלום מוקפא עד לבירור.`, o.id, now), ...s.notifications],
        });
        return { ok: true };
      },

      resolveRefund: (orderId) => {
        const s = get();
        const o = s.orders.find((x) => x.id === orderId);
        if (!o) return fail('ההזמנה לא נמצאה');
        if (o.status !== 'disputed') return fail('אין מחלוקת פתוחה להזמנה');
        const now = Date.now();
        const buyer = s.users[o.buyerId];
        const seller = s.users[o.sellerId];
        const title = s.items.find((i) => i.id === o.itemId)?.title ?? 'הפריט';
        const tx: Transaction = { id: uid(), userId: buyer.id, type: 'refund', amount: o.total, text: `החזר: ${title}`, orderId: o.id, at: now };
        set({
          users: {
            ...s.users,
            [buyer.id]: { ...buyer, wallet: { ...buyer.wallet, available: buyer.wallet.available + o.total } },
            [seller.id]: { ...seller, wallet: { ...seller.wallet, pending: seller.wallet.pending - o.itemPrice } },
          },
          orders: s.orders.map((x) => (x.id === orderId ? advance(x, 'refunded', now, 'צוות ReWear אישר החזר') : x)),
          items: s.items.map((i) => (i.id === o.itemId ? { ...i, status: 'active', relisted: true } : i)),
          transactions: [tx, ...s.transactions],
          notifications: [
            note(buyer.id, `₪${o.total.toLocaleString('he-IL')} הוחזרו לארנק שלך עבור "${title}".`, o.id, now),
            note(seller.id, `המחלוקת על "${title}" נפתרה לטובת הקונה וההזמנה בוטלה. הפריט חזר למכירה.`, o.id, now),
            ...s.notifications,
          ],
        });
        return { ok: true };
      },

      rateSeller: (orderId, stars, comment) => {
        const s = get();
        const o = s.orders.find((x) => x.id === orderId);
        if (!o) return fail('ההזמנה לא נמצאה');
        if (o.status !== 'completed') return fail('אפשר לדרג רק אחרי שחרור התשלום');
        if (o.rated) return fail('כבר דירגת את המוכר בהזמנה הזו');
        if (o.buyerId !== s.currentUserId) return fail('רק הקונה יכול לדרג');
        if (!(stars >= 1 && stars <= 5)) return fail('נא לבחור דירוג בין 1 ל-5');
        const now = Date.now();
        const seller = s.users[o.sellerId];
        const count = seller.ratingCount + 1;
        const avg = (seller.rating * seller.ratingCount + stars) / count;
        set({
          users: { ...s.users, [seller.id]: { ...seller, rating: avg, ratingCount: count } },
          orders: s.orders.map((x) => (x.id === orderId ? { ...x, rated: true, rating: { stars, comment } } : x)),
          notifications: [note(seller.id, `${s.users[o.buyerId].name} דירגה אותך ${stars}★${comment ? `: "${comment}"` : ''}`, o.id, now), ...s.notifications],
        });
        return { ok: true };
      },

      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => (n.userId === s.currentUserId ? { ...n, read: true } : n)) })),

      resetDemo: () => set({ ...createSeed(), currentUserId: 'noa', guide: defaultGuide(), onboardingSeen: false }),
    }),
    {
      name: 'rewear-store-v1',
      storage: createJSONStorage(() => safeStorage),
      // Corrupt or partial persisted data falls back to the seed.
      merge: (persisted, current) => {
        const p = persisted as Partial<State> | undefined;
        const ok = p && p.users && p.users.noa && p.users.noa.address && Array.isArray(p.items) && Array.isArray(p.orders) && Array.isArray(p.notifications) && Array.isArray(p.transactions) && p.currentUserId && p.users[p.currentUserId];
        return ok ? { ...current, ...p } : current;
      },
      partialize: (s) => ({ users: s.users, items: s.items, orders: s.orders, notifications: s.notifications, transactions: s.transactions, orderSeq: s.orderSeq, currentUserId: s.currentUserId, guide: s.guide, onboardingSeen: s.onboardingSeen }) as State,
    },
  ),
);

export type { Item };
export const useCurrentUser = () => useStore((s) => s.users[s.currentUserId]);
