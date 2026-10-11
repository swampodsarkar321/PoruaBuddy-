import React from 'react';
import { Star } from 'lucide-react';

export const Stars: React.FC<{ value: number; size?: string; interactive?: boolean; onPick?: (n: number) => void }> = ({
  value,
  size = 'w-3.5 h-3.5',
  interactive = false,
  onPick,
}) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!interactive}
        onClick={() => onPick?.(n)}
        className={interactive ? 'cursor-pointer hover:scale-125 transition' : 'cursor-default'}
        aria-label={`${n} star`}
      >
        <Star className={`${size} ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
      </button>
    ))}
  </span>
);

export const avgRating = (ratings: number[]): { avg: number; count: number } => {
  if (ratings.length === 0) return { avg: 0, count: 0 };
  return { avg: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length };
};
