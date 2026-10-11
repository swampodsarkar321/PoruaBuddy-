import React from 'react';
import { useApp } from '../context/AppContext';
import { MessagesSquare, PenTool, Rocket, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { waLink } from '../utils/whatsapp';

const STEPS = [
  { icon: MessagesSquare, n: '01', t: 'Tell us your goal', d: 'Message on WhatsApp — shop, portfolio or bot. Free quote within hours.' },
  { icon: PenTool, n: '02', t: 'We design & build', d: 'Preview in 48 hours. Unlimited clarity, fixed price, no surprises.' },
  { icon: Rocket, n: '03', t: 'Launch & grow', d: 'Deployed with domain, payments and training. Free support after launch.' },
];

export const ProcessSection: React.FC = () => {
  const { siteSettings } = useApp();
  return (
    <section className="bg-white border-y border-stone-200/80">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">From message to launch in days</h2>
          </div>
          <a href={waLink(siteSettings.whatsappNumber, 'Hello SRS Digital Labs! I need a website. Please share a free quote.')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-stone-900 underline underline-offset-4 shrink-0">
            Get free quote <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-3xl bg-stone-50 border border-stone-200 p-7 hover:border-stone-900 hover:bg-white hover:shadow-lg transition">
              <span className="absolute top-6 right-7 text-4xl font-extrabold text-stone-200 select-none">{s.n}</span>
              <s.icon className="w-6 h-6 text-stone-900 mb-4" />
              <h3 className="font-bold text-stone-900 mb-1.5">{s.t}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        </Reveal>
      </div>
    </section>
  );
};
