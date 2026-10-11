import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { waLink } from '../utils/whatsapp';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, cartCount, setIsCartOpen, siteSettings } = useApp();
  const [open, setOpen] = useState(false);
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'custom-dev', label: 'Services' },
    { id: 'portfolio', label: 'Work' },
    { id: 'products', label: 'Shop' },
    { id: 'chatbot', label: 'AI Chatbot' },
    { id: 'contact', label: 'Contact' },
  ];
  const go = (id: string) => { setActiveTab(id); setOpen(false); window.scrollTo({ top: 0 }); };

  return (
    <header className="sticky top-0 z-40 bg-[#fafaf9]/85 backdrop-blur-xl border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <button onClick={() => go('home')} className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-left leading-tight">
              <span className="block font-extrabold tracking-tight text-stone-900 text-[17px]">SRS Digital Labs</span>
              <span className="block text-[11px] font-medium text-stone-400 tracking-wide">Digital Agency • Bangladesh</span>
            </span>
          </button>
        <nav className="hidden md:flex items-center gap-1 bg-stone-200/50 rounded-full p-1">
          {items.map(i => (
            <button key={i.id} onClick={() => go(i.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeTab === i.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}>
              {i.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
            <a href={waLink(siteSettings.whatsappNumber, 'Hello SRS Digital Labs! I need a website. Please share a free quote.')} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition">
              Get free quote
            </a>
          <button onClick={() => setIsCartOpen(true)} className="relative w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-stone-900 hover:text-stone-900 transition">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
          </button>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-stone-600">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-[#fafaf9] px-5 py-3 grid grid-cols-2 gap-1">
          {items.map(i => (
            <button key={i.id} onClick={() => go(i.id)} className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium ${activeTab === i.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>{i.label}</button>
          ))}
        </div>
      )}
    </header>
  );
};
