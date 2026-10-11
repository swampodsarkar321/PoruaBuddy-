import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send } from 'lucide-react';
import { WhatsAppIcon } from './icons';

export const ChatWidget: React.FC = () => {
  const { siteSettings, setActiveTab } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: 'bot' | 'user'; text: string }>>([
    { from: 'bot', text: 'আসসালামু আলাইকুম! 👋 কী জানতে চান? (দাম, ডেলিভারি, ওয়েবসাইট)' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const reply = (text: string) => {
    setTyping(true);
    const l = text.toLowerCase();
    setTimeout(() => {
      let r = 'ধন্যবাদ! Full demo + plan দেখতে AI Chatbot page e jan 👇';
      if (l.includes('দাম') || l.includes('price') || l.includes('koto') || l.includes('cost')) r = 'Business site ৳3,500+, online store ৳5,500+, chatbot ৳800/mas. Free quote lagbe?';
      else if (l.includes('delivery') || l.includes('ডেলিভারি')) r = 'Dhaka te ৳80 (24-48h), baire ৳150 (2-3 din). COD available!';
      else if (l.includes('website') || l.includes('web')) r = '4 dine business site, 7 dine online store. Quote er jonno WhatsApp korun!';
      else if (l.includes('human') || l.includes('manus')) r = `WhatsApp korun: ${siteSettings.whatsappNumber} — manus reply dibe!`;
      setMessages((p) => [...p, { from: 'bot', text: r }]);
      setTyping(false);
    }, 800);
  };

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((p) => [...p, { from: 'user', text }]);
    setInput('');
    reply(text);
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} title="Chat on WhatsApp"
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-[0_16px_40px_-12px_rgba(37,211,102,0.5)] hover:scale-105 transition">
          <WhatsAppIcon className="w-7 h-7" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#fafaf9]" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[330px] max-w-[calc(100vw-3rem)] rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-stone-900 text-white">
          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <WhatsAppIcon className="w-4 h-4" />
          </span>
            <span className="flex-1">
            <span className="block text-[13px] font-bold leading-tight">Sairah WhatsApp</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online now</span>
            </span>
            <button onClick={() => setOpen(false)} className="p-1.5 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-3.5 h-64 overflow-y-auto space-y-2.5 bg-stone-50/60">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${m.from === 'user' ? 'bg-stone-900 text-white rounded-br-md' : 'bg-white border border-stone-200 text-stone-700 rounded-bl-md shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-1 items-center bg-white border border-stone-200 px-3 py-2.5 rounded-2xl w-fit">
                {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />)}
              </div>
            )}
          </div>
          <div className="p-2.5 border-t border-stone-100">
            <form onSubmit={send} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Likhun..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-100 text-[13px] outline-none focus:ring-2 focus:ring-stone-900/10" />
              <button type="submit" className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <button onClick={() => { setOpen(false); setActiveTab('chatbot'); }} className="w-full text-center text-[11px] font-semibold text-emerald-700 hover:text-emerald-600 mt-2">
              Full demo + plans dekhun →
            </button>
          </div>
        </div>
      )}
    </>
  );
};
