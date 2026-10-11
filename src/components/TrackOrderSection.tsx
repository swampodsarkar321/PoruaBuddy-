import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Package, Check, Circle, Loader2 } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { waLink } from '../utils/whatsapp';
import { Order } from '../types';

const STAGES = ['Pending', 'Paid', 'In Progress', 'Ready for Delivery', 'Completed'] as const;

const stageIndex = (s: string) => {
  const i = STAGES.indexOf(s as (typeof STAGES)[number]);
  if (i >= 0) return i;
  if (s === 'Awaiting Payment' || s === 'Payment Under Review') return 0;
  if (s === 'Rejected' || s === 'Cancelled') return -1;
  return 0;
};

export const TrackOrderSection: React.FC = () => {
  const { findOrderById, siteSettings, showToast } = useApp();
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) { showToast('Please enter your Order ID', 'error'); return; }
    setBusy(true);
    try {
      const found = await findOrderById(input.trim());
      setOrder(found);
      setSearched(true);
      if (!found) showToast('No order found — check the ID or ask on WhatsApp', 'info');
    } finally {
      setBusy(false);
    }
  };

  const idx = order ? stageIndex(order.paymentStatus) : -2;
  const failed = idx === -1;

  return (
    <div className="bg-transparent">
      <section className="max-w-2xl mx-auto px-5 py-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">Track order</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Where is my order?</h2>
          <p className="text-sm text-stone-500 mt-2">Enter the Order ID you got on WhatsApp after ordering.</p>
        </div>

        <form onSubmit={search} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. SL-ABC123-4567"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-sm font-mono outline-none focus:border-stone-900 shadow-sm" />
          </div>
          <button type="submit" disabled={busy} className="px-6 py-3.5 rounded-2xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 disabled:opacity-50 flex items-center gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Track
          </button>
        </form>

        {searched && !order && (
          <div className="rounded-3xl bg-white border border-dashed border-stone-300 p-8 text-center">
            <Package className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="font-bold text-stone-900 text-sm mb-1">Order not found</p>
            <p className="text-xs text-stone-500 mb-4">Double-check the ID from your WhatsApp chat.</p>
            <a href={waLink(siteSettings.whatsappNumber, `Hello Sairah Labs! I can't find my order (ID: ${input}). Please help.`)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#25d366] text-white text-xs font-bold hover:bg-[#1eb85a]">
              <WhatsAppIcon className="w-3.5 h-3.5" /> Ask on WhatsApp
            </a>
          </div>
        )}

        {order && !failed && (
          <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <p className="font-mono font-bold text-stone-900">{order.id}</p>
                <p className="text-xs text-stone-500 mt-0.5">{order.items?.map((i) => `${i.productName} x${i.quantity}`).join(', ')} • ৳{order.totalAmountBDT.toLocaleString()}</p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{order.paymentStatus}</span>
            </div>
            <div className="space-y-0">
              {STAGES.map((s, i) => {
                const done = i < idx;
                const current = i === idx;
                return (
                  <div key={s} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-600 text-white' : current ? 'bg-stone-900 text-white ring-4 ring-stone-900/10' : 'bg-stone-100 text-stone-400'}`}>
                        {done ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
                      </span>
                      {i < STAGES.length - 1 && <span className={`w-0.5 h-7 ${i < idx ? 'bg-emerald-500' : 'bg-stone-200'}`} />}
                    </div>
                    <p className={`text-sm pb-6 ${i <= idx ? 'font-bold text-stone-900' : 'text-stone-400'}`}>{s}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {order && failed && (
          <div className="rounded-3xl bg-rose-50 border border-rose-200 p-8 text-center">
            <p className="font-bold text-rose-700 text-sm mb-1">Order {order.paymentStatus}</p>
            <p className="text-xs text-stone-500 mb-4">Please contact us on WhatsApp to resolve this.</p>
            <a href={waLink(siteSettings.whatsappNumber, `Hello Sairah Labs! My order ${order.id} shows ${order.paymentStatus}. Please help.`)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold">
              <WhatsAppIcon className="w-3.5 h-3.5" /> Contact support
            </a>
          </div>
        )}
      </section>
    </div>
  );
};
