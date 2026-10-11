import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Monitor, FileText, Clock, Info, ShoppingBag, BadgeCheck, Send } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { Stars, avgRating } from './Stars';
import { waLink, singleOrderMessage } from '../utils/whatsapp';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, siteSettings, reviews, submitProductReview, showToast } = useApp();
  const [rName, setRName] = useState('');
  const [rRating, setRRating] = useState(5);
  const [rText, setRText] = useState('');
  const [rSending, setRSending] = useState(false);

  if (!selectedProduct) return null;

  const isDiscounted = selectedProduct.discountPriceBDT && selectedProduct.discountPriceBDT < selectedProduct.priceBDT;
  const currentPrice = isDiscounted ? selectedProduct.discountPriceBDT! : selectedProduct.priceBDT;

  const handleClose = () => setSelectedProduct(null);
  const approved = reviews.filter((r) => r.productId === selectedProduct.id && r.status === 'approved');
  const { avg, count } = avgRating(approved.map((r) => r.rating));

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim() || !rText.trim()) { showToast('Please add your name and review', 'error'); return; }
    setRSending(true);
    try {
      await submitProductReview({ productId: selectedProduct.id, productName: selectedProduct.name, name: rName.trim(), rating: rRating, text: rText.trim() });
      setRName(''); setRText(''); setRRating(5);
    } catch {}
    setRSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-8 bg-white rounded-[2rem] shadow-2xl overflow-hidden text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative bg-stone-900 text-white px-6 sm:px-8 pt-10 pb-8 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-stone-200">
                {selectedProduct.categoryLabel}
              </span>
              {selectedProduct.badge && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                  {selectedProduct.badge}
                </span>
              )}
              <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-stone-300">
                {selectedProduct.version}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {selectedProduct.name}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Price and Action Bar */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-400">Price in BDT</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {isDiscounted && (
                  <span className="text-base text-stone-400 line-through">
                    ৳{selectedProduct.priceBDT.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  handleClose();
                }}
                className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-bold flex items-center gap-1.5 hover:border-stone-900 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to cart</span>
              </button>
              <a
                href={waLink(siteSettings.whatsappNumber, singleOrderMessage(selectedProduct.name, currentPrice))}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#25d366] hover:bg-[#1eb85a] text-white text-sm font-bold flex items-center gap-1.5 transition"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Overview
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              {selectedProduct.description}
            </p>
            {selectedProduct.fullDetails && (
              <p className="text-[13px] text-stone-500 mt-2.5 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                {selectedProduct.fullDetails}
              </p>
            )}
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              What's included
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedProduct.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-[13px] text-stone-700"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <Monitor className="w-3.5 h-3.5" />
                <span className="font-semibold">Compatibility</span>
              </div>
              <p className="text-xs text-stone-900 font-medium">{selectedProduct.compatibility}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-semibold">License</span>
              </div>
              <p className="text-xs text-stone-900 font-medium">{selectedProduct.licenseInfo}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-semibold">Delivery</span>
              </div>
              <p className="text-xs text-stone-900 font-medium capitalize">
                {selectedProduct.deliveryType.replace('-', ' ')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-stone-600 flex gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>Tap <strong>Order on WhatsApp</strong> — product name & price auto-filled hobe, just press send. Amra confirm kore payment details dibo.</p>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Customer reviews {count > 0 && <span className="text-stone-900">({count})</span>}
              </h4>
              {count > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <Stars value={avg} /> {avg.toFixed(1)}
                </span>
              )}
            </div>

            {approved.length > 0 ? (
              <div className="space-y-2.5 mb-5">
                {approved.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="flex items-center gap-1.5 text-[13px] font-bold text-stone-900">
                        <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-extrabold">{r.name.charAt(0).toUpperCase()}</span>
                        {r.name}
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                      <Stars value={r.rating} size="w-3 h-3" />
                    </div>
                    <p className="text-[13px] text-stone-600 leading-relaxed">{r.text}</p>
                    <p className="text-[11px] text-stone-400 mt-1.5">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Verified buyer</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-stone-400 mb-5">No reviews yet — be the first to review this product.</p>
            )}

            <form onSubmit={submitReview} className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-sm">
              <p className="text-sm font-bold text-stone-900">Write a review</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Your rating:</span>
                <Stars value={rRating} size="w-5 h-5" interactive onPick={setRRating} />
              </div>
              <input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Your name *" className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-stone-900 placeholder-stone-400" />
              <textarea value={rText} onChange={(e) => setRText(e.target.value)} rows={3} placeholder="How was this product? *" className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-stone-900 resize-none placeholder-stone-400" />
              <button type="submit" disabled={rSending} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50">
                <Send className="w-3.5 h-3.5" /> {rSending ? 'Submitting...' : 'Submit review'}
              </button>
              <p className="text-[11px] text-stone-400">Reviews appear after admin approval.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
