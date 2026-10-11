import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Star, Check, Globe, ShoppingBag, Bot, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { Reveal } from './Reveal';

const LOGOS = ['ClothStore Dhaka', 'GameTop BD', 'Nusrat Boutique', 'TechFix', 'FoodHub', 'EduCare'];

const MARQUEE = ['Business Websites', 'E-commerce Stores', 'AI Chatbots', 'Top-up Stores', 'Admin Dashboards', 'PC Optimization', 'Landing Pages', 'Messenger Bots'];

export const Hero: React.FC = () => {
  const { setActiveTab, siteSettings, t } = useApp();
  const waQuote = `https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Sairah Labs! I need a website. Please share a free quote.')}`;
  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[480px] rounded-full bg-gradient-to-r from-emerald-200/70 via-teal-100/60 to-emerald-200/50 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'linear-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(90deg, #e7e5e4 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)' }} />
      </div>
      <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-12 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-600 mb-7 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {t('hero.badge')}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-[-0.045em] text-stone-900 leading-[1.0] mb-6">
            {t('hero.titleA')}<br />
            <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">{t('hero.titleB')}</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="text-stone-500 text-lg max-w-xl mx-auto mb-9 leading-relaxed">
            {t('hero.sub')}
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
            <a href={waQuote} target="_blank" rel="noopener noreferrer"
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center gap-2 transition shadow-[0_16px_40px_-12px_rgba(5,150,105,0.6)]">
              <WhatsAppIcon className="w-4 h-4" />
              {t('hero.cta1')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <button onClick={() => setActiveTab('portfolio')}
              className="px-8 py-4 rounded-full bg-white/80 backdrop-blur border border-stone-200 text-sm font-semibold text-stone-700 hover:border-stone-900 hover:text-stone-900 transition shadow-sm">
              {t('hero.cta2')}
            </button>
          </div>
        </Reveal>
        <Reveal delay={280}>
          <div className="flex items-center justify-center gap-3 text-sm text-stone-500 mb-12">
            <div className="flex -space-x-2">
              {['R', 'T', 'N', 'S'].map((l, i) => (
                <span key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white ${['bg-emerald-600', 'bg-stone-900', 'bg-teal-600', 'bg-cyan-600'][i]}`}>{l}</span>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
              <span><strong className="text-stone-900">5.0</strong> {t('hero.rating')} • <strong className="text-stone-900">{t('hero.proof')}</strong> {t('hero.after')}</span>
            </div>
          </div>
        </Reveal>

        {/* Mock browser */}
        <Reveal delay={120}>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -top-5 -right-4 sm:-right-8 z-10 animate-floaty">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 shadow-xl text-xs font-bold text-stone-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live in 4–7 days
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/90 backdrop-blur overflow-hidden text-left shadow-[0_30px_80px_-30px_rgba(28,25,23,0.3)]">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-stone-100 bg-stone-50">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-300" /><span className="w-2.5 h-2.5 rounded-full bg-amber-300" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-[11px] text-stone-500 bg-white border border-stone-200 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> yourstore.com — built by Sairah Labs
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 p-4">
                {[
                  { icon: Globe, t: 'Business site', d: 'Landing + WhatsApp CTA', p: '৳3,500+' },
                  { icon: ShoppingBag, t: 'Online store', d: 'WhatsApp ordering + tracking', p: '৳5,500+' },
                  { icon: Bot, t: 'AI chatbot', d: 'Bangla auto-reply 24/7', p: '৳4,000+' },
                ].map(c => (
                  <div key={c.t} className="group rounded-xl bg-stone-50 border border-stone-200/80 p-4 hover:border-emerald-500 hover:bg-emerald-50/50 hover:-translate-y-0.5 transition cursor-pointer" onClick={() => setActiveTab('custom-dev')}>
                    <c.icon className="w-5 h-5 text-emerald-600 mb-2.5" />
                    <p className="font-semibold text-sm text-stone-900">{c.t}</p>
                    <p className="text-xs text-stone-500 mt-0.5 mb-2">{c.d}</p>
                    <p className="text-xs font-bold text-emerald-700">{c.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-stone-400">
          {LOGOS.map(l => <span key={l} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" />{l}</span>)}
        </div>
      </div>

      {/* Marquee */}
      <div className="relative border-y border-stone-200/80 bg-white/60 backdrop-blur py-3.5 overflow-hidden">
        <div className="flex w-max animate-marquee gap-0">
          {[0, 1].map((n) => (
            <div key={n} className="flex shrink-0">
              {MARQUEE.map((m) => (
                <span key={`${n}-${m}`} className="flex items-center gap-2 px-6 text-[13px] font-semibold text-stone-500 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> {m}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
