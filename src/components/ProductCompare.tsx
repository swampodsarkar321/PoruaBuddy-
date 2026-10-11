import React from 'react';
import { useApp } from '../context/AppContext';
import { X, GitCompareArrows, Star, Check } from 'lucide-react';
import { Stars, avgRating } from './Stars';

export const ProductCompare: React.FC = () => {
  const { products, compareList, setCompareList, reviews, setSelectedProduct, siteSettings } = useApp();
  const [open, setOpen] = React.useState(false);

  const published = products.filter((p) => p.isPublished);

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const items = compareList.map((id) => published.find((p) => p.id === id)).filter(Boolean);

  return (
    <>
      {published.length >= 2 && (
        <div className="fixed bottom-24 sm:bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          {items.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-stone-900 text-white text-sm font-bold shadow-xl hover:bg-stone-700 transition"
            >
              <GitCompareArrows className="w-4 h-4" />
              Compare ({items.length}/2)
            </button>
          )}
        </div>
      )}

      {open && items.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-[1.75rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="font-extrabold text-lg text-stone-900">Compare products</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 divide-x divide-stone-100">
              {items.map((p) => {
                if (!p) return null;
                const { avg, count } = avgRating(reviews.filter((r) => r.productId === p.id && r.status === 'approved').map((r) => r.rating));
                return (
                  <div key={p.id} className="p-5 flex flex-col">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-xl font-extrabold mb-3">
                      {p.name.charAt(0)}
                    </div>
                    <h4 className="font-bold text-stone-900 leading-snug mb-1">{p.name}</h4>
                    <p className="text-[11px] text-stone-400 mb-3">{p.categoryLabel}</p>
                    <p className="text-2xl font-extrabold text-stone-900 mb-3">৳{(p.discountPriceBDT || p.priceBDT).toLocaleString()}</p>
                    {count > 0 && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 mb-3">
                        <Stars value={avg} size="w-3 h-3" /> {avg.toFixed(1)} ({count} reviews)
                      </span>
                    )}
                    <p className="text-[13px] text-stone-500 leading-relaxed mb-4">{p.description}</p>
                    <div className="mt-auto space-y-2">
                      {(p.features || []).slice(0, 4).map((f) => (
                        <div key={f} className="flex items-start gap-1.5 text-[12px] text-stone-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                      <button onClick={() => { setSelectedProduct(p); setOpen(false); }} className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700">
                        Details
                      </button>
                      <a href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello Sairah Labs! I want to order: ${p.name}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl bg-[#25d366] text-white text-xs font-bold text-center hover:bg-[#1eb85a]">
                        Order
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
