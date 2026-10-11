import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Copy, Check } from 'lucide-react';

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export const OfferBar: React.FC = () => {
  const { siteSettings, showToast } = useApp();
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!siteSettings.offerText?.trim()) return null;

  const end = siteSettings.offerEndsAt ? new Date(siteSettings.offerEndsAt).getTime() : 0;
  const left = end > 0 ? Math.max(0, end - now) : -1;
  const expired = end > 0 && left <= 0;
  if (expired) return null;

  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  const copy = async () => {
    if (!siteSettings.couponCode) return;
    try {
      await navigator.clipboard.writeText(siteSettings.couponCode);
      setCopied(true);
      showToast(`Coupon ${siteSettings.couponCode} copied!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(`Coupon: ${siteSettings.couponCode}`, 'info');
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white text-center text-[13px] font-medium px-4 py-2.5 flex items-center justify-center gap-2.5 flex-wrap">
      <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
      <span>{siteSettings.offerText}</span>
      {end > 0 && (
        <span className="font-mono font-bold bg-black/25 rounded-lg px-2.5 py-0.5 tracking-wider">
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
      )}
      {siteSettings.couponCode && (
        <button onClick={copy} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-dashed border-white/50 rounded-lg px-2.5 py-0.5 font-mono font-bold transition">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {siteSettings.couponCode}
        </button>
      )}
    </div>
  );
};
