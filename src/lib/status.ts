import type { OrderStatus } from '../types';

export const statusLabel: Record<OrderStatus, string> = {
  paid_escrow: 'בנאמנות 🔒', shipped: 'נשלח 📦', delivered: 'הגיע 🏠', completed: 'שוחרר 💸', disputed: 'במחלוקת ⚠️', refunded: 'הוחזר',
};
export const statusColor: Record<OrderStatus, string> = {
  paid_escrow: 'bg-escrow-soft text-escrow', shipped: 'bg-blue-50 text-blue-700', delivered: 'bg-primary-soft text-primary-hover',
  completed: 'bg-green-50 text-ok', disputed: 'bg-red-50 text-bad', refunded: 'bg-gray-100 text-ink-soft',
};
