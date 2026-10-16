import type { Category, Item, Notification, Order, Transaction, User } from '../types';
import { calcTotals } from '../lib/money';

export interface AppData {
  users: Record<User['id'], User>;
  items: Item[];
  orders: Order[];
  notifications: Notification[];
  transactions: Transaction[];
  orderSeq: number;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&q=70`;
const HOUR = 3600_000;

export function createSeed(): AppData {
  const now = Date.now();
  const users: AppData['users'] = {
    noa: { id: 'noa', address: 'הרצל 12, תל אביב', name: 'נועה', avatar: '🧑‍🎤', color: '#5B8A72', role: 'קונה', city: 'תל אביב', rating: 4.9, ratingCount: 21, badges: [], wallet: { available: 800, pending: 0 } },
    dani: { id: 'dani', address: 'מוריה 45, חיפה', name: 'דני', avatar: '🧔', color: '#2563EB', role: 'מוכר', city: 'חיפה', rating: 4.7, ratingCount: 38, badges: ['verified', 'fast_shipper'], wallet: { available: 150, pending: 120 } },
    maya: { id: 'maya', address: 'עמק רפאים 8, ירושלים', name: 'מאיה', avatar: '👩‍🦰', color: '#DB2777', role: 'מוכרת', city: 'ירושלים', rating: 5.0, ratingCount: 64, badges: ['top_seller'], wallet: { available: 300, pending: 0 } },
  };

  const mk = (
    n: number, sellerId: Item['sellerId'], title: string, category: Category, size: string, brand: string,
    condition: Item['condition'], price: number, photo: string, description: string, status: Item['status'] = 'active',
  ): Item => ({
    id: `item-${n}`, sellerId, title, description, category, size, brand, condition, price,
    images: [img(photo)], status, createdAt: now - n * 5 * HOUR, likes: [],
  });

  const items: Item[] = [
    mk(1, 'dani', 'ג׳קט ג׳ינס קלאסי', 'מעילים', 'M', "Levi's", 'טוב מאוד', 220, '1551028719-00167b16eac5', 'ג׳קט ג׳ינס כחול בגזרה קלאסית, לבוש כמה פעמים בלבד. בלי כתמים ובלי קרעים.'),
    mk(2, 'maya', 'שמלת מידי פרחונית', 'שמלות', 'S', 'Zara', 'כמו חדש', 140, '1595777457583-95e059d581b8', 'שמלה קלילה לקיץ, בד נעים ונופל. לבשתי פעם אחת לאירוע.'),
    mk(3, 'dani', 'נעלי ריצה Air Max', 'נעליים', '43', 'Nike', 'טוב', 280, '1542291026-7eec264c27ff', 'נעלי ריצה במצב טוב, סוליה שמורה. מתאימות גם ליומיום.'),
    mk(4, 'maya', 'חולצת כותנה לבנה', 'חולצות', 'M', 'H&M', 'חדש עם תווית', 45, '1521572163474-6864f9cf17ab', 'חולצת בייסיק לבנה, חדשה עם תווית. לא התאימה לי במידה.'),
    mk(5, 'dani', 'מכנסי ג׳ינס Slim', 'מכנסיים', '32', 'Castro', 'טוב מאוד', 95, '1542272604-787c3835535d', 'ג׳ינס כחול כהה בגזרת סלים, גמישים ונוחים.'),
    mk(6, 'maya', 'מעיל פוך קצר', 'מעילים', 'L', 'Mango', 'כמו חדש', 320, '1591047139829-d91aecb6caea', 'מעיל חם וקליל לחורף, לבוש עונה אחת. רוכסן תקין לחלוטין.'),
    mk(7, 'dani', 'קפוצ׳ון אפור', 'חולצות', 'L', 'Adidas', 'טוב', 70, '1556821840-3a63f95609a7', 'קפוצ׳ון נוח וחם, מעט סימני שימוש בשרוולים.'),
    mk(8, 'maya', 'שמלת ערב שחורה', 'שמלות', 'M', 'Renuar', 'טוב מאוד', 180, '1496747611176-843222e1e57c', 'שמלה אלגנטית לערב, גזרה מחמיאה. נקייה ומוכנה ללבישה.'),
    mk(9, 'dani', 'סניקרס לבנות', 'נעליים', '40', 'Fox', 'כמו חדש', 150, '1525966222134-fcfa99b8ae77', 'סניקרס לבנות קלאסיות, לבשתי פעמיים.'),
    mk(10, 'maya', 'תיק צד מעור', 'אקססוריז', 'ONE', 'Zara', 'טוב מאוד', 110, '1584917865442-de89df76afd3', 'תיק צד קטן מעור סינתטי איכותי, כולל רצועה מתכווננת.'),
    mk(11, 'dani', 'חולצת פסים ארוכה', 'חולצות', 'S', 'Fox', 'טוב', 40, '1576566588028-4147f3842f27', 'חולצת פסים בשרוול ארוך, מתאימה לכל עונה.'),
    mk(12, 'maya', 'מכנסי קרגו ירוקים', 'מכנסיים', 'M', 'H&M', 'כמו חדש', 85, '1473966968600-fa801b869a1a', 'מכנסי קרגו בצבע זית, כיסים רבים ובד חזק.'),
    mk(13, 'dani', 'צעיף צמר אפור', 'אקססוריז', 'ONE', 'Castro', 'טוב מאוד', 55, '1520903920243-00d872a2d1c9', 'צעיף צמר רך וחם, באורך נדיב.'),
    mk(14, 'dani', 'חולצת טי אוברסייז', 'חולצות', 'L', 'Nike', 'כמו חדש', 120, '1503341504253-dff4815485f1', 'חולצת טי אוברסייז רחבה ונעימה, במצב כמו חדש.', 'sold'),
  ];

  const sold = items[13];
  const t = calcTotals(sold.price);
  const order: Order = {
    id: 'RW-10234', itemId: sold.id, buyerId: 'noa', sellerId: 'dani',
    ...t, status: 'delivered', trackingNumber: 'RW48201937', shippingAddress: 'דיזנגוף 100, תל אביב',
    timeline: [
      { status: 'paid_escrow', at: now - 52 * HOUR },
      { status: 'shipped', at: now - 40 * HOUR, note: 'RW48201937' },
      { status: 'delivered', at: now - 2 * HOUR },
    ],
    autoReleaseAt: now + 46 * HOUR,
  };

  const notifications: Notification[] = [
    { id: 'n1', userId: 'noa', text: 'החבילה של "חולצת טי אוברסייז" הגיעה. אפשר לאשר שהכול תקין ולשחרר את התשלום.', orderId: order.id, read: false, at: now - 2 * HOUR },
    { id: 'n2', userId: 'dani', text: 'החבילה הגיעה לנועה. התשלום ישוחרר אחרי אישור הקונה.', orderId: order.id, read: false, at: now - 2 * HOUR },
    { id: 'n3', userId: 'maya', text: 'ברוכים הבאים ל-ReWear! אפשר להתחיל להעלות פריטים למכירה.', read: false, at: now - 30 * HOUR },
  ];

  const transactions: Transaction[] = [
    { id: 't1', userId: 'noa', type: 'purchase', amount: -order.total, text: `קנייה: ${sold.title}`, orderId: order.id, at: now - 52 * HOUR },
  ];

  return { users, items, orders: [order], notifications, transactions, orderSeq: 10235 };
}
