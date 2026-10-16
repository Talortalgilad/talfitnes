export type UserId = 'noa' | 'dani' | 'maya';
export type Badge = 'verified' | 'fast_shipper' | 'top_seller';
export type Category = 'חולצות' | 'מכנסיים' | 'שמלות' | 'מעילים' | 'נעליים' | 'אקססוריז';
export type Condition = 'חדש עם תווית' | 'כמו חדש' | 'טוב מאוד' | 'טוב';

export interface User {
  id: UserId;
  name: string;
  avatar: string;
  color: string;
  role: string;
  city: string;
  rating: number;
  ratingCount: number;
  badges: Badge[];
  wallet: { available: number; pending: number };
}

export interface Item {
  id: string;
  sellerId: UserId;
  title: string;
  description: string;
  category: Category;
  size: string;
  brand: string;
  condition: Condition;
  price: number;
  images: string[];
  status: 'active' | 'sold';
  createdAt: number;
  likes: UserId[];
}

export type OrderStatus = 'paid_escrow' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'refunded';

export interface Order {
  id: string;
  itemId: string;
  buyerId: UserId;
  sellerId: UserId;
  itemPrice: number;
  shippingFee: number;
  protectionFee: number;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  shippingAddress: string;
  timeline: { status: OrderStatus; at: number; note?: string }[];
  autoReleaseAt?: number;
  dispute?: { reason: string; details: string; photo?: string };
  rated?: boolean;
}

export interface Notification {
  id: string;
  userId: UserId;
  text: string;
  orderId?: string;
  read: boolean;
  at: number;
}

export interface Transaction {
  id: string;
  userId: UserId;
  type: 'purchase' | 'income' | 'refund' | 'topup';
  amount: number; // signed, relative to the user's available balance
  text: string;
  orderId?: string;
  at: number;
}

export const CATEGORIES: Category[] = ['חולצות', 'מכנסיים', 'שמלות', 'מעילים', 'נעליים', 'אקססוריז'];
export const CONDITIONS: Condition[] = ['חדש עם תווית', 'כמו חדש', 'טוב מאוד', 'טוב'];
