export const SHIPPING_FEE = 25;
export const PROTECTION_RATE = 0.05;

export const fmt = (n: number) => `₪${n.toLocaleString('he-IL')}`;

const BASE: Record<string, number> = { 'חולצות': 60, 'מכנסיים': 90, 'שמלות': 140, 'מעילים': 220, 'נעליים': 170, 'אקססוריז': 70 };
const COND: Record<string, number> = { 'חדש עם תווית': 0.85, 'כמו חדש': 0.7, 'טוב מאוד': 0.55, 'טוב': 0.4 };
const PREMIUM = ["levi's", 'nike', 'adidas', 'zara', 'mango'];

// Simple rule-based suggestion (no AI): category base x condition x brand tier, rounded to 5.
export function suggestPrice(category: string, condition: string, brand: string): number {
  const base = BASE[category] ?? 80;
  const brandMul = PREMIUM.includes(brand.trim().toLowerCase()) ? 1.2 : 1;
  return Math.max(20, Math.round((base * (COND[condition] ?? 0.5) * brandMul * 2) / 5) * 5);
}

export function calcTotals(itemPrice: number) {
  const shippingFee = SHIPPING_FEE;
  const protectionFee = Math.round(itemPrice * PROTECTION_RATE);
  return { itemPrice, shippingFee, protectionFee, total: itemPrice + shippingFee + protectionFee };
}
