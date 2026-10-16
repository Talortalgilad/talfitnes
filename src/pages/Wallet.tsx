import { useEffect, useMemo } from 'react';
import { useStore, useCurrentUser } from '../store/useStore';
import { fmt } from '../lib/money';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

export default function Wallet() {
  const me = useCurrentUser();
  const allTx = useStore((s) => s.transactions);
  const txs = useMemo(() => allTx.filter((t) => t.userId === me.id), [allTx, me.id]);
  const topUp = useStore((s) => s.topUp);
  const show = useToast((s) => s.show);
  const walletViewed = useStore((s) => s.guideWalletViewed);
  const step4 = useStore((s) => s.guide.done[3]);
  useEffect(() => { walletViewed(); }, [me.id, step4, walletViewed]);
  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl bg-primary p-5 text-white shadow-soft">
        <div className="text-sm opacity-80">יתרה זמינה</div>
        <div data-testid="available" className="text-4xl font-black">{fmt(me.wallet.available)}</div>
        <div className="mt-3 text-sm opacity-90">בדרך אליך: <span data-testid="pending" className="font-bold">{fmt(me.wallet.pending)}</span></div>
      </div>
      <button onClick={() => { topUp(); show('נטענו 500 ₪ לארנק'); }} className="tap w-full rounded-2xl bg-white py-3 font-bold text-primary shadow-soft">טעינה מדומה +500 ₪</button>
      <h2 className="font-bold">תנועות</h2>
      {txs.length === 0 && <EmptyState emoji="🧾" title="עוד אין תנועות" text="קניות, הכנסות והחזרים יופיעו כאן." cta={{ label: 'לגלות פריטים', to: '/' }} />}
      <ul className="space-y-2">
        {txs.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm shadow-sm">
            <span>{t.text}<span className="block text-xs text-ink-soft">{new Date(t.at).toLocaleString('he-IL')}</span></span>
            <span className={`font-bold ${t.amount < 0 ? 'text-bad' : 'text-ok-dark'}`} dir="ltr">{t.amount < 0 ? '-' : '+'}{fmt(Math.abs(t.amount))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
