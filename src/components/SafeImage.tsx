import { useState } from 'react';
import { Footprints, Layers, Shirt, Sparkles, Watch, Wind } from 'lucide-react';
import type { Category } from '../types';

const icons = { 'חולצות': Shirt, 'מכנסיים': Layers, 'שמלות': Sparkles, 'מעילים': Wind, 'נעליים': Footprints, 'אקססוריז': Watch };

// Image with a soft gradient + category icon fallback (never a broken-image icon).
export default function SafeImage({ src, category, alt, className = '' }: { src?: string; category: Category; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const Icon = icons[category];
  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-gradient-to-br from-primary-soft via-[#F3EFE6] to-escrow-soft ${className}`}>
        <Icon size={40} className="text-primary/60" aria-hidden />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
