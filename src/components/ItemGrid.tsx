import type { Item } from '../types';
import ItemCard from './ItemCard';

export default function ItemGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {items.map((i) => <ItemCard key={i.id} item={i} />)}
    </div>
  );
}
