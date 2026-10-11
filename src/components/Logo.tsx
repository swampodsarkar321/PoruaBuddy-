import React from 'react';
import { SquareTerminal } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const box =
    size === 'sm'
      ? 'w-10 h-10 rounded-xl'
      : size === 'lg'
        ? 'w-14 h-14 rounded-2xl'
        : 'w-12 h-12 rounded-2xl';
  const icon = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const text = size === 'sm' ? 'text-[9px]' : 'text-[11px]';

  return (
    <span className={`${box} bg-gradient-to-b from-[#1b2138] to-[#10142a] flex flex-col items-center justify-center gap-[2px] shrink-0 shadow-[0_8px_20px_-8px_rgba(16,20,42,0.6)] ring-1 ring-white/10`}>
      <SquareTerminal className={`${icon} text-amber-400`} strokeWidth={2.4} />
      <span className={`${text} font-extrabold tracking-[0.18em] text-amber-400 leading-none`}>SRS</span>
    </span>
  );
};
