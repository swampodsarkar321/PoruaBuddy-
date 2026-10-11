import React, { useState } from 'react';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

const POSTS = [
  {
    id: 'website-cost-bangladesh',
    title: 'Website Design Cost in Bangladesh (2026): Full Price Guide',
    meta: '6 min read • Pricing guide',
    excerpt: 'Business site ৳3,500–৳8,000, e-commerce ৳5,500–৳15,000. What affects price, what to avoid, and how to get the best value.',
    body: [
      'A business website in Bangladesh costs ৳3,500–৳8,000 depending on pages, design quality and features. A simple 5-page company site sits at the lower end; custom designs with booking or multilingual support cost more.',
      'An e-commerce store costs ৳5,500–৳15,000. The range depends on product count, payment method (WhatsApp ordering vs gateway), order tracking and admin dashboard.',
      'What raises the price: custom UI design (vs template), copywriting in Bangla, logo/branding, photography, and integrations like Facebook Pixel or analytics.',
      'What to avoid: anyone asking full advance with no preview, no source-code handover, and "৳500 website" offers — those are usually nulled themes with security holes.',
      'Our advice: start with a fixed-price package (preview in 48 hours, pay in milestones), and always take source code and deployment access in your own accounts.',
    ],
  },
  {
    id: 'ai-chatbot-orders',
    title: 'How Dhaka Shops Get 2x Orders with an AI Messenger Bot',
    meta: '4 min read • AI chatbot',
    excerpt: 'Auto-reply in Bangla 24/7, COD order capture, human handover — the exact setup small shops use to stop losing night-time customers.',
    body: [
      'Most Facebook shops in Dhaka lose 30–40% of inquiries: messages arrive at night, replies come next morning, customer already bought elsewhere.',
      'An AI Messenger bot fixes this by replying in ~2 seconds in Bangla and English — price, stock, delivery charge and order confirmation, 24/7.',
      'The winning setup has 3 parts: (1) knowledge base of your products/prices, (2) COD order capture — name, phone, address collected in chat, (3) human handover when the bot is unsure.',
      'Cost in Bangladesh: free trial for 7 days, then ~৳800/month for a small shop. Setup takes 2 days including page connection and testing.',
      'Measure it: reply time, % of chats handled without humans, and orders from 10pm–8am. If night orders grow, the bot paid for itself.',
    ],
  },
  {
    id: 'whatsapp-order-website',
    title: 'WhatsApp Ordering Website: Sell Online Without a Payment Gateway',
    meta: '5 min read • E-commerce',
    excerpt: 'Why small BD stores skip bKash merchant setup and take orders straight into WhatsApp inbox — and how to set it up.',
    body: [
      'Payment gateway approval in Bangladesh needs trade license, bank account and weeks of paperwork. Most small sellers never start because of this.',
      'WhatsApp ordering removes the blocker: customer taps "Order", product name, quantity and price auto-fill in a chat message, they press send. You confirm and collect payment however suits you.',
      'What you need: a mobile-first store, one tap-to-order button per product, a cart that builds the WhatsApp message, and order tracking so customers can check status.',
      'Limits to know: manual confirmation per order (fine under ~50 orders/day), and you must reply reasonably fast — pairing with an AI chatbot covers nights.',
      'Total setup cost: an e-commerce store with WhatsApp checkout starts from ৳5,500 and goes live in 7 days.',
    ],
  },
];

export const BlogSection: React.FC = () => {
  const [active, setActive] = useState<string | null>(null);
  const post = POSTS.find((p) => p.id === active);

  if (post) {
    return (
      <div className="bg-transparent">
        <section className="max-w-3xl mx-auto px-5 py-14">
          <button onClick={() => { setActive(null); window.scrollTo({ top: 0 }); }} className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 mb-6">
            <ArrowLeft className="w-4 h-4" /> All articles
          </button>
          <p className="text-xs font-semibold text-emerald-700 mb-2">{post.meta}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8">{post.title}</h2>
          <div className="space-y-4">
            {post.body.map((para, i) => (
              <p key={i} className="text-[15px] text-stone-600 leading-relaxed">{para}</p>
            ))}
          </div>
          <div className="mt-10 p-7 rounded-3xl bg-stone-900 text-white text-center">
            <h3 className="font-bold text-lg mb-1">Need this for your business?</h3>
            <p className="text-sm text-stone-400 mb-5">Free quote on WhatsApp within hours.</p>
            <a href="https://wa.me/8801767882562?text=Hello%20SRS%20Digital%20Labs!%20I%20read%20your%20blog.%20Please%20share%20a%20free%20quote." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-white text-stone-900 text-sm font-bold hover:bg-stone-200">
              Get free quote <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">Blog</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Guides for BD sellers</h2>
          <p className="text-sm text-stone-500 mt-2">Pricing, chatbots & online selling — in plain language.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {POSTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <article onClick={() => { setActive(p.id); window.scrollTo({ top: 0 }); }} className="h-full cursor-pointer rounded-3xl bg-white border border-stone-200 p-7 hover:border-stone-900 hover:shadow-lg hover:-translate-y-1 transition flex flex-col">
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mb-3"><Clock className="w-3 h-3" /> {p.meta}</p>
                <h3 className="font-bold text-stone-900 leading-snug mb-2">{p.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed mb-5 flex-1">{p.excerpt}</p>
                <span className="text-sm font-semibold text-stone-900 underline underline-offset-4">Read article</span>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
};
