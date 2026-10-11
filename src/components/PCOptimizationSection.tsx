import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Cpu, AlertTriangle, ShieldCheck, Zap, MonitorCheck } from 'lucide-react';
import { WhatsAppIcon } from './icons';

export const PCOptimizationSection: React.FC = () => {
  const { products, siteSettings } = useApp();

  const pcProducts = products.filter(
    (p) => p.category === 'pc-optimization' || p.category === 'windows-panels'
  );

  return (
    <div className="bg-transparent">
      <section className="py-14 max-w-6xl mx-auto px-5 space-y-10">
        {/* Header */}
        <div className="relative rounded-[2rem] bg-stone-900 text-white p-8 sm:p-12 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="max-w-2xl relative">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold mb-4">
              <Cpu className="w-3.5 h-3.5" /> No risky hacks • Real frametime stability
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              PC optimization that respects your hardware.
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Remove bloatware, lower input latency and fix micro-stutters — tuned personally by Swampod for gamers, streamers and editors in Bangladesh.
            </p>
            <a
              href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Swampod,%20I%20want%20to%20book%20a%20PC%20Optimization%20session`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-bold text-sm hover:bg-stone-200 transition"
            >
              <WhatsAppIcon className="w-4 h-4" /> Book remote session
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: MonitorCheck, t: '1. Diagnose', d: 'LatencyMon DPC check, thermal & startup audit on your actual machine.' },
            { icon: Zap, t: '2. Tune', d: 'Safe debloat, driver cleanup, power-plan and game-config tuning.' },
            { icon: ShieldCheck, t: '3. Verify', d: 'Before/after benchmarks + 7-day follow-up support included.' },
          ].map((s) => (
            <div key={s.t} className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
              <s.icon className="w-5 h-5 text-emerald-700 mb-3" />
              <h4 className="font-bold text-stone-900 text-sm mb-1">{s.t}</h4>
              <p className="text-[13px] text-stone-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Honest notice */}
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[13px] text-stone-600 leading-relaxed">
            <strong className="text-stone-900 block mb-1">Honest notice — no fake FPS promises.</strong>
            Results depend on your CPU, GPU, RAM and cooling. We guarantee bloat removal, lower input latency and smoother 1% lows — never an arbitrary "+60 FPS".
          </p>
        </div>

        {/* Products */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-stone-900">Guides, services & desktop panels</h3>
          <p className="text-sm text-stone-500 mt-1 mb-6">Self-guided manuals or live remote tuning.</p>
          {pcProducts.length === 0 ? (
            <div className="py-14 px-6 rounded-3xl bg-white border border-dashed border-stone-300 text-center text-sm text-stone-400">
              PC packages coming soon — <a className="text-stone-900 font-semibold underline underline-offset-4" href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">ask on WhatsApp</a> for a custom tune-up.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pcProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
