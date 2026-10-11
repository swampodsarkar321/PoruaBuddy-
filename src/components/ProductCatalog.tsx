import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, setActiveTab } = useApp();
  const cats = [
    { id: 'all', label: 'All' },
    { id: 'pc-optimization', label: 'PC Optimization' },
    { id: 'gaming-tools', label: 'Gaming' },
    { id: 'windows-panels', label: 'Windows' },
    { id: 'websites', label: 'Websites' },
  ] as const;
  const list = useMemo(() => products.filter(p => p.isPublished)
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => !searchQuery.trim() || (p.name + p.description).toLowerCase().includes(searchQuery.toLowerCase())),
    [products, selectedCategory, searchQuery]);

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <h2 className="text-2xl font-bold tracking-tight text-stone-900">Templates & tools</h2>
      <p className="text-sm text-stone-500 mb-6">{list.length} items available</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {cats.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === c.id ? 'bg-stone-900 text-white shadow' : 'bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-900'}`}>
            {c.label}
          </button>
        ))}
      </div>
      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search templates..."
        className="w-full mb-8 px-5 py-3.5 rounded-2xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-900 shadow-sm" />
      {list.length === 0 ? (
        <div className="py-20 px-6 rounded-3xl bg-white border border-dashed border-stone-300 text-center">
          <PackageOpen className="w-10 h-10 text-stone-300 mx-auto mb-4" />
          <h4 className="font-semibold text-stone-900 mb-1">No templates yet</h4>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mb-5">New collection coming soon — or get a custom website built instead.</p>
          <button onClick={() => setActiveTab('contact')} className="px-6 py-2.5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700">
            Request custom build
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
};
