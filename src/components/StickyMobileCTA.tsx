import React from 'react';
import { useApp } from '../context/AppContext';
import { WhatsAppIcon } from './icons';

export const StickyMobileCTA: React.FC = () => {
  const { siteSettings, products, setSelectedProduct } = useApp();
  const first = products.find((p) => p.isPublished);
  const waText = first
    ? `Hello Sairah Labs! I want to order: ${first.name}`
    : 'Hello Sairah Labs! I want to place an order.';

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 px-4 py-2.5 flex items-center gap-3 shadow-[0_-8px_30px_-12px_rgba(28,25,23,0.2)]">
      <button
        onClick={() => first && setSelectedProduct(first)}
        className="flex-1 py-3 rounded-full bg-stone-900 text-white text-[13px] font-bold flex items-center justify-center gap-1.5"
      >
        Order now
      </button>
      <a
        href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-3 rounded-full bg-[#25d366] text-white text-[13px] font-bold flex items-center justify-center gap-1.5"
      >
        <WhatsAppIcon className="w-4 h-4" />
        WhatsApp
      </a>
    </div>
  );
};
