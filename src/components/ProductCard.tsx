import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ArrowUpRight } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { Stars, avgRating } from './Stars';
import { waLink, singleOrderMessage } from '../utils/whatsapp';

const ACCENT: Record<string, string> = {
  'pc-optimization': 'bg-blue-50 text-blue-700 border-blue-100',
  'gaming-tools': 'bg-violet-50 text-violet-700 border-violet-100',
  'windows-panels': 'bg-amber-50 text-amber-700 border-amber-100',
  'websites': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'gaming-services': 'bg-rose-50 text-rose-700 border-rose-100',
};

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, setSelectedProduct, siteSettings, reviews } = useApp();
  const price = product.discountPriceBDT || product.priceBDT;
  const accent = ACCENT[product.category] || 'bg-stone-100 text-stone-500 border-stone-200';
  const initial = product.name.charAt(0).toUpperCase();
  const { avg, count } = avgRating(reviews.filter((r) => r.productId === product.id && r.status === 'approved').map((r) => r.rating));
  const img = product.imageUrls?.[0];

  return (
    <div className="group flex flex-col rounded-3xl bg-white border border-stone-200 overflow-hidden hover:shadow-[0_24px_60px_-24px_rgba(28,25,23,0.25)] hover:-translate-y-1 hover:border-stone-300 transition-all duration-300">
      {img && (
        <div className="h-44 overflow-hidden cursor-pointer bg-stone-100" onClick={() => setSelectedProduct(product)}>
          <img src={img} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-xl font-extrabold">
          {initial}
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${accent}`}>
          {product.categoryLabel}
        </span>
      </div>
      <h3 onClick={() => setSelectedProduct(product)} className="font-semibold text-stone-900 cursor-pointer leading-snug mb-1 group-hover:underline underline-offset-4">
        {product.name}
      </h3>
      {count > 0 ? (
        <span className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-stone-600">
          <Stars value={avg} size="w-3 h-3" /> {avg.toFixed(1)} <span className="font-normal text-stone-400">({count})</span>
        </span>
      ) : (
        <span className="block text-[11px] text-stone-400 mb-2">No reviews yet</span>
      )}
      <p className="text-sm text-stone-500 line-clamp-2 mb-5 leading-relaxed">{product.description}</p>
      <div className="mt-auto flex items-center justify-between pt-5 border-t border-stone-100">
        <div>
          <span className="text-lg font-extrabold text-stone-900 tracking-tight">৳{price.toLocaleString()}</span>
          {product.discountPriceBDT && (
            <span className="text-xs text-stone-400 line-through ml-1.5">৳{product.priceBDT.toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedProduct(product)} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-900 hover:text-stone-900 transition" title="Details">
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button onClick={() => addToCart(product)} className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-700 text-xs font-bold hover:border-stone-900 transition">Add</button>
          <a href={waLink(siteSettings.whatsappNumber, singleOrderMessage(product.name, price))} target="_blank" rel="noopener noreferrer" title="Order on WhatsApp"
            className="w-9 h-9 rounded-full bg-[#25d366] hover:bg-[#1eb85a] text-white flex items-center justify-center transition">
            <WhatsAppIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};
