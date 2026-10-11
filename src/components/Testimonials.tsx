import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Reveal } from './Reveal';

const ITEMS = [
  { n: 'Rahim Uddin', r: 'Clothing store • Dhaka', q: '3 dine amar online shop live. Payment ar order tracking niye kono jhamela nai. Best investment chilo.' },
  { n: 'Tanvir Ahmed', r: 'Gaming top-up seller', q: 'Messenger bot ekhon 80% customer ke auto reply dey. Eid campaign e sales double hoyeche.' },
  { n: 'Nusrat J.', r: 'Boutique owner', q: 'Design dekhe sobai jiggesh kore ke banaise. Mobile e eto smooth site age dekhi nai.' },
];

export const Testimonials: React.FC = () => (
  <section className="bg-white border-y border-stone-200/80">
    <div className="max-w-6xl mx-auto px-5 py-20">
      <Reveal>
      <div className="text-center mb-10">
        <div className="flex justify-center gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">Clients that grow with us</h2>
        <p className="text-sm text-stone-500 mt-2">40+ projects • 5.0 average rating</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {ITEMS.map(t => (
          <figure key={t.n} className="rounded-3xl bg-stone-50 border border-stone-200 p-7 hover:border-stone-900 hover:bg-white hover:shadow-lg transition">
            <Quote className="w-5 h-5 text-stone-300 mb-4" />
            <blockquote className="text-sm text-stone-600 leading-relaxed mb-5">“{t.q}”</blockquote>
            <figcaption>
              <p className="font-semibold text-sm text-stone-900">{t.n}</p>
              <p className="text-xs text-stone-400">{t.r}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      </Reveal>
    </div>
  </section>
);
