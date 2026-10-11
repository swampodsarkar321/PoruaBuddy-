import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { waLink } from '../utils/whatsapp';
import { WhatsAppIcon, FacebookIcon, MessengerIcon } from './icons';

export const Footer: React.FC = () => {
  const { setActiveTab, siteSettings } = useApp();
  const wa = `https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`;
  return (
    <footer className="bg-white border-t border-stone-200">
      <div className="max-w-6xl mx-auto px-5 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <Logo size="md" />
            <span>
              <span className="block font-extrabold tracking-tight text-stone-900 text-[17px] leading-tight">SRS Digital Labs Bangladesh</span>
              <span className="block text-[11px] font-medium text-stone-400 tracking-wide">Digital Agency • Websites • Stores • AI Bots</span>
            </span>
          </div>
          <p className="text-sm text-stone-500 max-w-xs mb-5">Websites, stores & AI chatbots for Bangladeshi brands. Order easily on WhatsApp.</p>
          <div className="flex items-center gap-2">
            <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp"
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-[#25d366] hover:text-white text-stone-500 flex items-center justify-center transition">
              <WhatsAppIcon className="w-4 h-4" />
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" title="Messenger"
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-500 flex items-center justify-center transition">
              <MessengerIcon className="w-4 h-4" />
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" title="Facebook"
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-[#1877f2] hover:text-white text-stone-500 flex items-center justify-center transition">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href={waLink(siteSettings.whatsappNumber, 'Hello SRS Digital Labs! I need a website. Please share a free quote.')} target="_blank" rel="noopener noreferrer" className="ml-2 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition">
              Get free quote <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-stone-900 mb-3">Studio</p>
          <div className="space-y-2.5 text-stone-500">
            <button onClick={() => setActiveTab('custom-dev')} className="block hover:text-stone-900">Services</button>
            <button onClick={() => setActiveTab('portfolio')} className="block hover:text-stone-900">Work</button>
            <button onClick={() => setActiveTab('products')} className="block hover:text-stone-900">Shop</button>
            <button onClick={() => setActiveTab('pc-optimization')} className="block hover:text-stone-900">PC Optimization</button>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-stone-900 mb-3">Support</p>
          <div className="space-y-2.5 text-stone-500">
            <button onClick={() => setActiveTab('chatbot')} className="block hover:text-stone-900">AI Chatbot</button>
            <button onClick={() => setActiveTab('blog')} className="block hover:text-stone-900">Blog</button>
            <button onClick={() => setActiveTab('contact')} className="block hover:text-stone-900">Contact</button>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-100 py-5 text-center text-xs text-stone-400">© {new Date().getFullYear()} SRS Digital Labs Bangladesh • Crafted by Swampod</div>
    </footer>
  );
};
