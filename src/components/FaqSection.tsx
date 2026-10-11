import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal } from './Reveal';
import { useApp } from '../context/AppContext';

export const FAQS = [
  {
    q: 'How much does website design cost in Bangladesh?',
    a: 'Business websites start from ৳3,500 and e-commerce stores from ৳5,500 at Sairah Labs. Every package includes mobile-first design, WhatsApp ordering, basic SEO and free revisions — no hidden charges.',
  },
  {
    q: 'How long does it take to build a website in Dhaka?',
    a: 'Business websites take 4 days and online stores take 7 days — from design preview to live deployment with your domain.',
  },
  {
    q: 'How can I take orders online without bKash merchant setup?',
    a: 'Our stores use WhatsApp ordering: customers tap order, product details auto-fill in chat, and you confirm payment in inbox. No gateway paperwork needed to start selling.',
  },
  {
    q: 'What is an AI Messenger chatbot and how does it help my shop?',
    a: 'It auto-replies to your Facebook Page inbox in Bangla and English — price, stock and delivery questions answered in ~2 seconds, 24/7. Tricky messages route to you with full context. Plans start from ৳800/month.',
  },
  {
    q: 'Will my website rank on Google?',
    a: 'Every site ships with SEO basics: proper titles, meta descriptions, fast loading, mobile-first layout and Google Search Console setup. Rankings grow with content and reviews over 2–3 months.',
  },
  {
    q: 'Do I get the source code of my website?',
    a: 'Yes — 100%. Complete source code, deployment setup and training are included in every package, plus free support after launch.',
  },
];

export const FaqSection: React.FC = () => {
  const { t } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-transparent">
      <div className="max-w-3xl mx-auto px-5 py-20">
        <Reveal>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">{t('sec.faq.k')}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">{t('sec.faq.t')}</h2>
          </div>
        </Reveal>
        <div className="space-y-2.5">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i * 60, 240)}>
              <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-[15px] font-semibold text-stone-900">
                  {f.q}
                  <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && <p className="px-5 pb-5 text-sm text-stone-500 leading-relaxed">{f.a}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
