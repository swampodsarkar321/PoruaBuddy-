import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';

const ITEMS = [
  { t: 'Fashion e-commerce store', c: 'E-commerce • WhatsApp orders', d: 'Full cart, WhatsApp confirmation and order tracking — conversion up 2.3x after launch.', s: '+2.3x sales', dark: true },
  { t: 'Gaming top-up platform', c: 'Gaming • Player-ID orders', d: 'UID checkout with WhatsApp alerts. Handles 500+ daily orders on campaign days.', s: '500+ orders/day', dark: true },
  { t: 'AI Messenger automation', c: 'AI • Bangla + English', d: 'Auto-replies for price, stock & delivery queries with human handover.', s: '80% auto-handled', dark: false },
];

export const PortfolioSection: React.FC = () => {
  const { setActiveTab } = useApp();
  return (
    <section className="bg-transparent">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">Selected work</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10">Results, not just screenshots</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {ITEMS.map((w) => (
            <div key={w.t} onClick={() => setActiveTab('contact')}
              className={`rounded-3xl p-7 cursor-pointer transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(28,25,23,0.3)] ${w.dark ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-900'}`}>
              <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 ${w.dark ? 'bg-white/10 text-stone-300' : 'bg-stone-100 text-stone-500'}`}>{w.c}</span>
              <h3 className="font-bold text-lg leading-snug mb-2">{w.t}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${w.dark ? 'text-stone-400' : 'text-stone-500'}`}>{w.d}</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-extrabold ${w.dark ? 'text-emerald-300' : 'text-emerald-700'}`}>{w.s}</span>
                <ArrowUpRight className={`w-4 h-4 ${w.dark ? 'text-stone-500' : 'text-stone-400'}`} />
              </div>
            </div>
          ))}
        </div>
        </Reveal>
      </div>
    </section>
  );
};
