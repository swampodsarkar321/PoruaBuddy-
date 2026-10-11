import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Send, Phone } from 'lucide-react';
import { WhatsAppIcon, MessengerIcon } from './icons';

const waLink = (num: string, text: string) =>
  `https://wa.me/${num.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;

const PLANS = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: '৳0',
    per: '/ 7 days',
    sub: 'Try it out — 1 Page included',
    features: ['1 connected Page', '20 knowledge entries', '50 AI replies', 'Basic inbox + analytics'],
    cta: 'Start trial on WhatsApp',
    msg: 'Hello Sairah Labs! I want to start the FREE 7-day AI chatbot trial for my Facebook Page.',
    active: false,
    highlight: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '৳800',
    per: '/ month',
    sub: 'One-time setup ৳2,000 · best for small shops',
    features: ['1 connected Page', '500 knowledge entries', '2,000 AI replies / month', 'Human handover + analytics', 'Fast WhatsApp setup'],
    cta: 'Order now on WhatsApp',
    msg: 'Hello Sairah Labs! I want to order the BUSINESS AI chatbot plan (৳800/month + ৳2,000 setup). My Page link is: ',
    active: true,
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '৳2,000',
    per: '/ month',
    sub: 'One-time setup ৳5,000 · multiple Pages & brands',
    features: ['3 connected Pages', '5,000 knowledge entries', '20,000 AI replies / month', 'Priority support', 'Monthly report'],
    cta: 'Talk to us on WhatsApp',
    msg: 'Hello Sairah Labs! I am interested in the PREMIUM AI chatbot plan (৳2,000/month). Please share details.',
    active: false,
    highlight: false,
  },
];

const CHECKLIST = [
  { t: 'AI Inbox', d: 'Every message answered in seconds, in Bangla and English.' },
  { t: 'COD orders captured', d: 'Name, phone and address collected automatically.' },
  { t: 'Human handover', d: 'Tricky cases route to your team with full context.' },
];

const INBOX_PREVIEW = [
  { n: 'Rahim Uddin', m: 'Delivery charge koto?', tag: 'AI replied', tagCls: 'bg-emerald-50 text-emerald-700 border-emerald-200', time: '2m', avatar: 'R' },
  { n: 'Sara Ahmed', m: 'Order ORD-261009 confirmed', tag: 'Order', tagCls: 'bg-blue-50 text-blue-700 border-blue-200', time: '18m', avatar: 'S' },
  { n: 'Tanvir Hasan', m: 'Refund issue — needs a human', tag: 'Handover', tagCls: 'bg-amber-50 text-amber-700 border-amber-200', time: '41m', avatar: 'T' },
];

export const ChatbotSection: React.FC = () => {
  const { submitInquiry, showToast, siteSettings } = useApp();

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { sender: 'bot', text: 'আসসালামু আলাইকুম! Sairah AI এসিস্ট্যান্টে স্বাগতম। ডেলিভারি চার্জ, প্রোডাক্ট প্রাইস বা কাস্টম ওয়েবসাইট — কী জানতে চান?', time: '10:00 AM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadPageUrl, setLeadPageUrl] = useState('');
  const [leadPlan, setLeadPlan] = useState('Business (৳800/mo)');
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const simulateBotReply = (userText: string) => {
    setIsTyping(true);
    const lower = userText.toLowerCase();
    setTimeout(() => {
      let reply = '';
      if (lower.includes('delivery') || lower.includes('ডেলিভারি') || lower.includes('charge')) {
        reply = 'ঢাকার ভেতরে ডেলিভারি চার্জ ৳৮০ (২৪–৪৮ ঘণ্টা), ঢাকার বাইরে ৳১৫০ (২–৩ দিন)। ক্যাশ অন ডেলিভারি আছে!';
      } else if (lower.includes('price') || lower.includes('দাম') || lower.includes('koto') || lower.includes('plan')) {
        reply = 'আমাদের প্ল্যান: Free Trial ৳০ (৭ দিন), Business ৳৮০০/মাস, Premium ৳২,০০০/মাস। কোনটা নিয়ে জানতে চান?';
      } else if (lower.includes('human') || lower.includes('agent') || lower.includes('support')) {
        reply = `অবশ্যই! WhatsApp-এ সরাসরি কথা বলুন: ${siteSettings.whatsappNumber}`;
      } else {
        reply = 'ধন্যবাদ! আমাদের AI বট আপনার ফেসবুক পেজে এভাবেই ২৪/৭ বাংলায় উত্তর দেবে। নিচে প্ল্যান দেখে WhatsApp-এ অর্ডার করুন!';
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: reply, time: now() }]);
      setIsTyping(false);
    }, 900);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text: inputMessage.trim(), time: now() }]);
    const text = inputMessage;
    setInputMessage('');
    simulateBotReply(text);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      showToast('Please provide your name and phone number', 'error');
      return;
    }
    setLeadSubmitting(true);
    try {
      await submitInquiry({
        name: leadName,
        email: 'chatbot-lead@sairahlabs.com',
        phone: leadPhone,
        serviceType: `AI Messenger Bot — ${leadPlan}`,
        message: `Facebook Page: ${leadPageUrl || 'Not provided'}. Interested in automated Messenger deployment.`,
        budget: leadPlan,
      });
      setLeadName(''); setLeadPhone(''); setLeadPageUrl('');
      showToast('Demo request received! We will connect on WhatsApp within 2 hours.', 'success');
    } catch {
      showToast('Failed to submit demo request', 'error');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-900 shadow-sm";

  return (
    <div className="bg-transparent">
      {/* Split hero */}
      <section className="grid lg:grid-cols-2">
        {/* Left — brand panel */}
        <div className="relative overflow-hidden bg-white px-6 sm:px-12 py-14 border-r border-stone-200">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-100/70 blur-3xl pointer-events-none" />
          <div className="relative max-w-lg">
            <div className="flex items-center gap-2.5 mb-8">
              <span className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
                <MessengerIcon className="w-4 h-4 text-white" />
              </span>
              <span>
                <span className="block font-bold text-sm text-stone-900">Sairah Labs</span>
                <span className="block text-[11px] text-stone-400">Messenger chatbot platform</span>
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.05] mb-4">
              Customer messaging,<br /><span className="text-stone-400">on autopilot.</span>
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-8">
              Connect your Facebook Page and let AI handle replies, orders and follow-ups — your team steps in only when it matters.
            </p>
            <ul className="space-y-5 mb-9">
              {CHECKLIST.map((c) => (
                <li key={c.t} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <span>
                    <span className="block font-bold text-sm text-stone-900">{c.t}</span>
                    <span className="block text-[13px] text-stone-500">{c.d}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Live inbox preview */}
            <div className="rounded-2xl bg-white border border-stone-200 shadow-[0_20px_50px_-25px_rgba(28,25,23,0.3)] overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/60">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-2">
                  <MessengerIcon className="w-3.5 h-3.5 text-stone-400" /> Live inbox
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AI on duty
                </span>
              </div>
              {INBOX_PREVIEW.map((r) => (
                <div key={r.n} className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 last:border-0">
                  <span className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{r.avatar}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-stone-900 truncate">{r.n}</span>
                    <span className="block text-xs text-stone-400 truncate">{r.m}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.tagCls}`}>{r.tag}</span>
                  <span className="text-[10px] text-stone-400">{r.time}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-8 border-t border-stone-200 pt-6">
              {[['24/7', 'COVERAGE'], ['~2s', 'MEDIAN REPLY'], ['বাং + EN', 'LANGUAGES']].map((s) => (
                <span key={s[1]}>
                  <span className="block text-xl font-extrabold text-stone-900">{s[0]}</span>
                  <span className="block text-[10px] tracking-[0.15em] text-stone-400 mt-1">{s[1]}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — live demo */}
        <div className="bg-white px-6 sm:px-12 py-14 flex flex-col justify-center border-b border-stone-200">
          <div className="max-w-md w-full mx-auto">
            <h3 className="text-2xl font-extrabold tracking-tight text-stone-900">Try the live demo</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">This is exactly how the bot replies on your Page — type below.</p>
            <div className="rounded-3xl border border-stone-200 overflow-hidden shadow-[0_24px_60px_-30px_rgba(28,25,23,0.3)]">
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
                  <MessengerIcon className="w-3.5 h-3.5 text-white" />
                </span>
                <span>
                  <span className="block text-[13px] font-bold text-stone-900">Sairah AI Agent</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online — replies instantly</span>
                </span>
              </div>
              <div className="p-4 h-72 overflow-y-auto space-y-3 bg-white">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${m.sender === 'user' ? 'bg-stone-900 text-white rounded-br-md' : 'bg-stone-100 text-stone-700 rounded-bl-md'}`}>
                      {m.text}
                      <span className="block text-[10px] opacity-50 mt-1">{m.time}</span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-1.5 items-center bg-stone-100 px-3.5 py-3 rounded-2xl w-fit">
                    {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />)}
                  </div>
                )}
              </div>
              <div className="px-3 pt-2.5 flex gap-2 overflow-x-auto scrollbar-none">
                {['ডেলিভারি চার্জ কত?', 'Plan price?', 'Human support'].map((q) => (
                  <button key={q} onClick={() => setInputMessage(q)} className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs text-stone-600 whitespace-nowrap transition">{q}</button>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-3 flex gap-2">
                <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 text-sm text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-stone-900/10" />
                <button type="submit" className="px-5 rounded-xl bg-stone-900 hover:bg-stone-700 text-white text-sm font-bold flex items-center gap-1.5 transition shrink-0">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>
            <p className="text-center text-xs text-stone-400 mt-5">
              Payment & details confirmed in WhatsApp inbox — nothing else needed.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">Simple pricing, in Taka</h2>
          <p className="text-sm text-stone-500 mt-2">Start free — upgrade when orders grow.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {PLANS.map((p) => (
            <div key={p.id} className={`relative rounded-3xl p-6 flex flex-col transition hover:-translate-y-1 ${p.highlight ? 'bg-stone-900 text-white border-2 border-stone-900 shadow-[0_24px_60px_-20px_rgba(28,25,23,0.5)]' : 'bg-white border border-stone-200 hover:border-stone-400 hover:shadow-lg'}`}>
              {p.active && (
                <span className="absolute top-4 right-4 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">Active</span>
              )}
              <h3 className={`font-bold ${p.highlight ? 'text-white' : 'text-stone-900'}`}>{p.name}</h3>
              <p className="mt-1.5 mb-1"><span className={`text-2xl font-extrabold tracking-tight ${p.highlight ? 'text-white' : 'text-stone-900'}`}>{p.price}</span><span className="text-sm text-stone-400"> {p.per}</span></p>
              <p className="text-xs text-stone-400 mb-5">{p.sub}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-[13px] ${p.highlight ? 'text-stone-200' : 'text-stone-600'}`}>
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <a href={waLink(siteSettings.whatsappNumber, p.msg)} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold transition active:scale-95 ${p.highlight ? 'bg-white text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-700'}`}>
                <WhatsAppIcon className="w-4 h-4" /> {p.cta}
              </a>
            </div>
          ))}
        </div>
        <div className="px-5 py-3.5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-400 mb-12">
          The bot never stops when quota runs out — it sends a fallback message instead. Upgrades apply instantly after verification.
        </div>

        {/* Setup form */}
        <div className="max-w-2xl mx-auto rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm">
          <h3 className="font-bold text-stone-900 text-lg mb-1">Get it set up for your Page</h3>
          <p className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
            Fill in — we reply on <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp within 2 hours.
          </p>
          <form onSubmit={handleLeadSubmit} className="space-y-3.5">
            <div className="grid sm:grid-cols-2 gap-3.5">
              <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Your name" className={inputCls} />
              <input value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="Phone / WhatsApp number" className={inputCls} />
            </div>
            <input value={leadPageUrl} onChange={(e) => setLeadPageUrl(e.target.value)} placeholder="Facebook Page link" className={inputCls} />
            <select value={leadPlan} onChange={(e) => setLeadPlan(e.target.value)} className={inputCls}>
              <option>Free Trial (৳0 / 7 days)</option>
              <option>Business (৳800/mo)</option>
              <option>Premium (৳2,000/mo)</option>
            </select>
            <button type="submit" disabled={leadSubmitting}
              className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 active:scale-[0.99] transition disabled:opacity-50">
              {leadSubmitting ? 'Sending...' : 'Request setup'}
            </button>
          </form>
          <p className="text-center text-xs text-stone-400 mt-4 flex items-center justify-center gap-1">
            Prefer chat? <Phone className="w-3 h-3" /> {siteSettings.whatsappNumber}
          </p>
        </div>
      </section>
    </div>
  );
};
