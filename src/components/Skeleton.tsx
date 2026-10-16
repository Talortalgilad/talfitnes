import { useEffect, useState } from 'react';

// True for the first `ms` after mount, so lists feel like they load instead of popping in.
export function useSkeleton(ms = 300) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

const bar = 'rounded-full bg-gray-200 motion-safe:animate-pulse';

export function ItemGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4" aria-busy="true" aria-label="טוען פריטים">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="aspect-[4/5] bg-gray-200 motion-safe:animate-pulse" />
          <div className="space-y-2 p-3"><div className={`${bar} h-4 w-1/3`} /><div className={`${bar} h-3 w-4/5`} /><div className={`${bar} h-3 w-2/3`} /></div>
        </div>
      ))}
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="טוען הזמנות">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
          <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-200 motion-safe:animate-pulse" />
          <div className="flex-1 space-y-2 pt-1"><div className={`${bar} h-4 w-3/5`} /><div className={`${bar} h-3 w-1/4`} /><div className={`${bar} h-4 w-2/5`} /></div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return <div className="space-y-3 p-4" aria-busy="true"><div className={`${bar} h-6 w-1/2`} /><div className="h-40 rounded-2xl bg-gray-200 motion-safe:animate-pulse" /><div className="h-24 rounded-2xl bg-gray-200 motion-safe:animate-pulse" /></div>;
}
