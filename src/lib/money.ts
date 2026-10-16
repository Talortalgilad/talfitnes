export const SHIPPING_FEE = 25;
export const PROTECTION_RATE = 0.05;

export const fmt = (n: number) => `₪${n.toLocaleString('he-IL')}`;

export function calcTotals(itemPrice: number) {
  const shippingFee = SHIPPING_FEE;
  const protectionFee = Math.round(itemPrice * PROTECTION_RATE);
  return { itemPrice, shippingFee, protectionFee, total: itemPrice + shippingFee + protectionFee };
}
