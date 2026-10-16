import type { OrderStatus } from '../types';

export const statusLabel: Record<OrderStatus, string> = {
  paid_escrow: 'בנאמנות 🔒', shipped: 'נשלח 📦', delivered: 'הגיע 🏠', completed: 'שוחרר 💸', disputed: 'במחלוקת ⚠️', refunded: 'הוחזר',
};
export const statusColor: Record<OrderStatus, string> = {
  paid_escrow: 'bg-escrow-soft text-escrow-dark', shipped: 'bg-blue-50 text-blue-700', delivered: 'bg-primary-soft text-primary-hover',
  completed: 'bg-green-50 text-ok-dark', disputed: 'bg-red-50 text-bad', refunded: 'bg-gray-100 text-ink-soft',
};

import type { Order, UserId } from '../types';

export const AUTO_RELEASE_MS = 48 * 3600_000;

// Does this order need an action from the given user right now? (drives "ממתין לך" and the nav badge)
export function needsAction(o: Order, userId: UserId): boolean {
  if (o.sellerId === userId && o.status === 'paid_escrow') return true;
  if (o.buyerId === userId && o.status === 'delivered') return true;
  if (o.buyerId === userId && o.status === 'completed' && !o.rated) return true;
  return false;
}
