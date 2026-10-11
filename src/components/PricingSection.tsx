import React from 'react';
import { Check, Clock } from 'lucide-react';
import { Reveal } from './Reveal';
import { waLink } from '../utils/whatsapp';
import { useApp } from '../context/AppContext';

const PLANS = [
  {
    name: 'Business Website',
    price: '৳3,500',
    per: 'starting',
    days: '4 days',
    desc: 'Perfect for shops, clinics, restaurants & personal brands in Bangladesh.',
    features: ['5–8 pages, mobile-first design', 'WhatsApp order button + contact form', 'Google Maps + basic SEO setup', 'Facebook Pixel integration', '3 free revisions'],
    tag: 'Most popular',
  },
  {
    name: 'E-commerce Store',
    price: '৳5,500',
    per: 'starting',
    days: '7 days',
    desc: 'Full online shop with WhatsApp ordering for clothing, cosmetics & gadgets.',
    features: ['Unlimited products + categories', 'Cart + WhatsApp checkout', 'Order tracking for customers', 'Admin dashboard included', '4 free revisions'],
    tag: null,
  },
  {
    name: 'AI Chatbot Setup',
    price: '৳800',
    per: '/month',
    days: '2 days',
    desc: 'Bangla + English auto-reply bot for your Facebook Page.',
    features: ['500 knowledge entries', '2,000 AI replies / month', 'Human handover included', 'Order & price automation', 'One-time setup ৳2,000'],
    tag: 'New',
  },
];

export const PricingSection: React.FC = () => {
  const { siteSettings, t } = useApp();
  return (
    <section className="bg-white border-y border-stone-200/80">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">{t('sec.pricing.k')}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">{t('sec.pricing.t')}</h2>
            <p className="text-sm text-stone-500 mt-2">{t('sec.pricing.sub')}</p>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div className={`relative rounded-3xl p-7 h-full flex flex-col transition hover:-translate-y-1 ${p.tag === 'Most popular' ? 'bg-stone-900 text-white shadow-[0_24px_60px_-20px_rgba(28,25,23,0.5)]' : 'bg-stone-50 border border-stone-200 hover:border-stone-400 hover:shadow-lg'}`}>
                {p.tag && (
                  <span className={`absolute top-5 right-5 text-[11px] font-bold px-2.5 py-1 rounded-full ${p.tag === 'Most popular' ? 'bg-emerald-500 text-white' : 'bg-stone-900 text-white'}`}>{p.tag}</span>
                )}
                <h3 className={`font-bold text-lg ${p.tag === 'Most popular' ? 'text-white' : 'text-stone-900'}`}>{p.name}</h3>
                <p className="mt-1.5 mb-1">
                  <span className={`text-3xl font-extrabold tracking-tight ${p.tag === 'Most popular' ? 'text-white' : 'text-stone-900'}`}>{p.price}</span>
                  <span className="text-sm text-stone-400"> {p.per}</span>
                </p>
                <p className={`text-xs mb-5 flex items-center gap-1 ${p.tag === 'Most popular' ? 'text-stone-400' : 'text-stone-400'}`}><Clock className="w-3 h-3" /> Delivery in {p.days} • {p.desc}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-[13px] ${p.tag === 'Most popular' ? 'text-stone-200' : 'text-stone-600'}`}>
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={waLink(siteSettings.whatsappNumber, `Hello Sairah Labs! I want the ${p.name} package (${p.price}). Please share details.`)}
                  target="_blank" rel="noopener noreferrer"
                  className={`block text-center px-4 py-3 rounded-xl text-sm font-bold transition active:scale-[0.99] ${p.tag === 'Most popular' ? 'bg-white text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-700'}`}
                >
                  Order {p.name}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
