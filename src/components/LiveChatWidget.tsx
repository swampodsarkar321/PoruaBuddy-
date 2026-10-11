import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { sendLiveChatRTDB, updateLiveChatRTDB, rtdbLiveChatRef, onValue } from '../firebase/rtdb';
import { LiveChatMessage } from '../types';

const genId = () => `lc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const LiveChatWidget: React.FC = () => {
  const { siteSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('sl_chat_session');
      if (saved) return saved;
      const id = genId();
      localStorage.setItem('sl_chat_session', id);
      return id;
    } catch {
      return genId();
    }
  });
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    updateLiveChatRTDB('', { read: true }).catch(() => {});
    // Mark incoming as read when open
    messages.filter((m) => m.sender === 'user' && !m.read).forEach((m) => {
      updateLiveChatRTDB(m.id, { read: true }).catch(() => {});
    });
  }, [open]);

  useEffect(() => {
    const off = onValue(rtdbLiveChatRef(), (snap: { val: () => unknown }) => {
      const val = snap.val();
      if (!val || typeof val !== 'object') return;
      const list = Object.entries(val as Record<string, LiveChatMessage>)
        .map(([id, m]) => ({ ...m, id }))
        .filter((m) => m.sessionId === sessionId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      setMessages(list);
    }, () => {});
    return () => off();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setTyping(true);
    sendLiveChatRTDB({
      id: genId(),
      sessionId,
      sender: 'user',
      text,
      read: false,
      createdAt: new Date().toISOString(),
    }).catch(() => {});
    setTimeout(() => setTyping(false), 600);
  };

  const unread = messages.filter((m) => m.sender === 'admin' && !m.read).length;

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} title="Live chat"
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-[0_16px_40px_-12px_rgba(28,25,23,0.5)] hover:scale-105 transition">
          <Send className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#fafaf9]">
              {unread}
            </span>
          )}
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col" style={{ height: 'min(480px, calc(100vh - 6rem))' }}>
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-stone-900 text-white">
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-4 h-4" />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-bold leading-tight">Live Chat</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Replies in minutes</span>
            </span>
            <button onClick={() => setOpen(false)} className="p-1.5 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-stone-50/60">
            {messages.length === 0 && (
              <div className="text-center py-8 px-4">
                <p className="text-sm font-bold text-stone-900 mb-1">Start a conversation</p>
                <p className="text-xs text-stone-500">Message koron — amra minutes e reply dibo.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${m.sender === 'user' ? 'bg-stone-900 text-white rounded-br-md' : 'bg-white border border-stone-200 text-stone-700 rounded-bl-md shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-1 items-center bg-white border border-stone-200 px-3 py-2.5 rounded-2xl w-fit">
                {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-2.5 border-t border-stone-100">
            <form onSubmit={send} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-100 text-[13px] outline-none focus:ring-2 focus:ring-stone-900/10" />
              <button type="submit" className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-stone-400 mt-1.5">
              Offline? <a href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold underline underline-offset-2">WhatsApp</a> e jan
            </p>
          </div>
        </div>
      )}
    </>
  );
};
