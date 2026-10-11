import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';

export const PortfolioSection: React.FC = () => {
  const { portfolio, setActiveTab } = useApp();
  if (portfolio.length === 0) return null;

  return (
    <section className="bg-transparent">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">Selected work</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10">Results, not just screenshots</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {portfolio.map((w, i) => (
            <Reveal key={w.id} delay={Math.min(i * 80, 240)}>
              <div onClick={() => setActiveTab('contact')}
                className={`rounded-3xl p-7 cursor-pointer h-full transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(28,25,23,0.3)] ${i % 3 === 0 ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-900'}`}>
                <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 ${i % 3 === 0 ? 'bg-white/10 text-stone-300' : 'bg-stone-100 text-stone-500'}`}>{w.category}</span>
                <h3 className="font-bold text-lg leading-snug mb-2">{w.title}</h3>
                <p className={`text-sm leading-relaxed mb-5 ${i % 3 === 0 ? 'text-stone-400' : 'text-stone-500'}`}>{w.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-extrabold ${i % 3 === 0 ? 'text-emerald-300' : 'text-emerald-700'}`}>{w.stat}</span>
                  <ArrowUpRight className={`w-4 h-4 ${i % 3 === 0 ? 'text-stone-500' : 'text-stone-400'}`} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
