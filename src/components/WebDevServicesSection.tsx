import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, ShoppingBag, Gamepad2, LayoutDashboard, ArrowRight, Check, Clock } from 'lucide-react';
import { Reveal } from './Reveal';
import { waLink } from '../utils/whatsapp';

const SERVICES = [
  { icon: Globe, t: 'Business websites', d: 'Corporate sites & landing pages with SEO, analytics and WhatsApp lead capture.', p: '৳3,500', days: '4 days', tag: 'Most popular', dark: true },
  { icon: ShoppingBag, t: 'E-commerce stores', d: 'Cart, WhatsApp ordering, order tracking and admin dashboard.', p: '৳5,500', days: '7 days', tag: null, dark: false },
  { icon: Gamepad2, t: 'Gaming top-up stores', d: 'Player-ID checkout, diamond pricing tables and WhatsApp order alerts.', p: '৳4,500', days: '5 days', tag: null, dark: false },
  { icon: LayoutDashboard, t: 'Dashboards & CRM', d: 'Role-based admin panels, sales analytics and order verification queues.', p: '৳6,000', days: '7 days', tag: 'Pro', dark: false },
];

export const WebDevServicesSection: React.FC = () => {
  const { siteSettings, t } = useApp();
  return (
    <section className="bg-white border-y border-stone-200/80">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">{t('sec.services.k')}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">{t('sec.services.t')}</h2>
          </div>
          <a href={waLink(siteSettings.whatsappNumber, 'Hello Sairah Labs! I need a website. Please share a free quote.')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-stone-900 underline underline-offset-4 shrink-0">
            {t('sec.services.link')} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES.map(s => (
            <div key={s.t} className={`relative rounded-3xl p-7 overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(28,25,23,0.3)] ${s.dark ? 'bg-stone-900 text-white' : 'bg-stone-50 border border-stone-200 text-stone-900'}`}>
              {s.tag && <span className={`absolute top-5 right-5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.dark ? 'bg-white text-stone-900' : 'bg-stone-900 text-white'}`}>{s.tag}</span>}
              <s.icon className={`w-6 h-6 mb-4 ${s.dark ? 'text-emerald-300' : 'text-stone-900'}`} />
              <h3 className="font-bold text-lg mb-1.5">{s.t}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${s.dark ? 'text-stone-400' : 'text-stone-500'}`}>{s.d}</p>
              <div className="flex items-center justify-between">
                <span className="font-extrabold">from {s.p}</span>
                <span className={`flex items-center gap-1 text-xs ${s.dark ? 'text-stone-400' : 'text-stone-500'}`}><Clock className="w-3.5 h-3.5" />{s.days}</span>
              </div>
              <div className={`flex items-center gap-1.5 mt-4 pt-4 border-t text-xs ${s.dark ? 'border-white/10 text-stone-300' : 'border-stone-200 text-stone-600'}`}>
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Source code + deployment included
              </div>
            </div>
          ))}
        </div>
        </Reveal>
      </div>
    </section>
  );
};
