import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Send, ChevronDown, MapPin } from 'lucide-react';
import { WhatsAppIcon } from './icons';

const FAQS = [
  { q: 'How do I pay for my order?', a: 'Simple — place your order on WhatsApp and our team confirms everything in chat, including payment. No forms, no hassle.' },
  { q: 'How long does a website take?', a: 'Business sites 4 days, e-commerce stores 7 days — design to deployment with source code included.' },
  { q: 'How does the AI chatbot work?', a: 'Connects to the official Meta Messenger Platform. Understands Bangla + English, answers price/stock/delivery queries, hands over to humans when needed.' },
  { q: 'Do I get source code?', a: 'Yes — every package includes complete source code, deployment setup and free revision rounds.' },
];

export const ContactSection: React.FC = () => {
  const { submitInquiry, showToast, siteSettings } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Custom website');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      showToast('Please provide your name and message', 'error');
      return;
    }
    setSending(true);
    try {
      await submitInquiry({ name, email: 'contact@srsstudio.com', phone, serviceType: subject, message, budget: subject });
      setName(''); setPhone(''); setMessage('');
      showToast('Message received! We reply on WhatsApp within 2 hours.', 'success');
    } catch {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const inputCls = "px-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-900 shadow-sm";

  return (
    <div className="bg-transparent">
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">Contact</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Let's build something great</h2>
          <p className="text-sm text-stone-500 mt-2">Free quote within a few hours — no commitment.</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <a href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:border-emerald-500 transition">
              <span className="w-11 h-11 rounded-2xl bg-[#25d366] text-white flex items-center justify-center shrink-0"><WhatsAppIcon className="w-5 h-5" /></span>
              <span><span className="block font-bold text-stone-900 text-sm">WhatsApp (fastest)</span><span className="block text-xs text-stone-500 mt-0.5">{siteSettings.whatsappNumber}</span></span>
            </a>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-stone-600" /></span>
              <span className="flex-1"><span className="block font-bold text-stone-900 text-sm">Easy ordering</span><span className="block text-xs text-stone-500 mt-0.5">Everything confirmed in WhatsApp inbox — no apps needed</span></span>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-stone-600" /></span>
              <span><span className="block font-bold text-stone-900 text-sm">Based in Bangladesh</span><span className="block text-xs text-stone-500 mt-0.5">Serving clients nationwide, remotely</span></span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="lg:col-span-3 rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-3.5 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-3.5">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" className={inputCls} />
            </div>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={`w-full ${inputCls}`}>
              <option>Custom website</option>
              <option>E-commerce store</option>
              <option>AI Messenger chatbot</option>
              <option>PC optimization</option>
              <option>Other</option>
            </select>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell us about your project..."
              className={`w-full resize-none ${inputCls}`} />
            <button type="submit" disabled={sending}
              className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>

        <div className="max-w-3xl mx-auto mt-14">
          <h3 className="text-xl font-bold text-stone-900 text-center mb-6">Common questions</h3>
          <div className="space-y-2.5">
            {FAQS.map((f, i) => (
              <div key={f.q} className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-stone-900">
                  {f.q}
                  <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 text-sm text-stone-500 leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
