import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Copy,
  Check,
  SearchCheck,
  MessageCircle,
  Clock,
  ShieldAlert,
  X
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const {
    orderSuccess,
    setOrderSuccess,
    setIsOrderTrackerOpen,
    setTrackingOrderId,
    siteSettings,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!orderSuccess) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderSuccess.id);
    setCopied(true);
    showToast('Order ID copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTrackOrder = () => {
    setTrackingOrderId(orderSuccess.id);
    setOrderSuccess(null);
    setIsOrderTrackerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-lg my-8 bg-[#090d16] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOrderSuccess(null)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Badge */}
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-yellow-950/80 text-yellow-300 border border-yellow-700/80">
          Status: Payment Under Review
        </span>

        <h3 className="text-2xl font-black text-white mt-3 mb-1">
          Order Submitted Successfully!
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
          Thank you, <strong>{orderSuccess.customerName}</strong>. Your payment details have been recorded
          and queued for manual verification by SRS Digital Labs.
        </p>

        {/* Order Reference Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Your Unique Order Reference:</span>
            <span className="font-mono text-cyan-400">Save this code</span>
          </div>
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700/80">
            <span className="font-mono font-bold text-sm sm:text-base text-white tracking-wide">
              {orderSuccess.id}
            </span>
            <button
              onClick={copyOrderId}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Payment Method:</span>
              <span className="font-semibold text-white">{orderSuccess.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">TrxID Submitted:</span>
              <span className="font-mono font-bold text-cyan-300">{orderSuccess.transactionId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Paid:</span>
              <span className="font-mono font-bold text-white">৳{orderSuccess.totalAmountBDT.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Items:</span>
              <span className="font-medium text-white">{orderSuccess.items.length} Product(s)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTrackOrder}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <SearchCheck className="w-4 h-4" />
            <span>Track Order &amp; Access Digital Files</span>
          </button>

          <a
            href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20SRS%20Studio,%20I%20just%20placed%20order%20${encodeURIComponent(orderSuccess.id)}%20with%20TrxID%20${encodeURIComponent(orderSuccess.transactionId)}.%20Please%20verify.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notify Admin on WhatsApp for Quick Verification</span>
          </a>
        </div>
      </div>
    </div>
  );
};
