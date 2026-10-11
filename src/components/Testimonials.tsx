import React from 'react';
import { useApp } from '../context/AppContext';
import { Star, BadgeCheck } from 'lucide-react';
import { Reveal } from './Reveal';

const AVATAR_BG = ['bg-emerald-700', 'bg-stone-800', 'bg-teal-700', 'bg-cyan-700', 'bg-amber-700'];

export const Testimonials: React.FC = () => {
  const { testimonials } = useApp();
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-white border-y border-stone-200/80">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <Reveal>
          <div className="text-center mb-10">
            <div className="flex justify-center gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Real shops, real results</h2>
            <p className="text-sm text-stone-500 mt-2">Verified customers of Sairah Labs Bangladesh</p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={Math.min(i * 80, 240)}>
              <figure className="h-full flex flex-col rounded-3xl bg-stone-50 border border-stone-200 p-6 hover:border-stone-900 hover:bg-white hover:shadow-lg transition">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                <blockquote className="text-[15px] text-stone-700 leading-relaxed mb-5 flex-1">“{t.quote}”</blockquote>
                <figcaption className="flex items-center gap-3 pt-4 border-t border-stone-200/80">
                  <span className={`w-10 h-10 rounded-full ${AVATAR_BG[i % AVATAR_BG.length]} text-white flex items-center justify-center text-sm font-extrabold shrink-0`}>
                    {t.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-bold text-stone-900">
                      {t.name}
                      <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </span>
                    <span className="block text-xs text-stone-400 truncate">{t.role}</span>
                    <span className="block text-[11px] text-stone-400">
                      {new Date(t.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} • Verified order
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
