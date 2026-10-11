import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Product, ProductCategory, Inquiry } from '../types';
import {
  rtdbProductsRef,
  rtdbInquiriesRef,
  rtdbSettingsRef,
  snapToProducts,
  saveProductRTDB,
  deleteProductRTDB,
  saveSettingsRTDB,
  deleteInquiryRTDB,
  onValue,
} from '../firebase/rtdb';
import { Plus, Trash2, Pencil, X, Check, Database, ShoppingBag, MessagesSquare, Settings2 } from 'lucide-react';

const ADMIN_EMAIL = 'mdswampodsarkar@gmail.com';

const CATS: Array<{ id: ProductCategory; label: string }> = [
  { id: 'pc-optimization', label: 'PC Optimization' },
  { id: 'gaming-tools', label: 'Gaming' },
  { id: 'windows-panels', label: 'Windows' },
  { id: 'websites', label: 'Websites' },
  { id: 'gaming-services', label: 'Gaming Services' },
];

const emptyProduct = (): Product => ({
  id: `prod-${Date.now().toString(36)}`,
  name: '',
  slug: '',
  category: 'websites',
  categoryLabel: 'Websites',
  description: '',
  priceBDT: 0,
  imageUrls: [],
  features: [],
  compatibility: 'All modern browsers',
  deliveryType: 'custom-delivery',
  licenseInfo: 'Single project license',
  version: 'v1.0',
  isPublished: true,
  createdAt: new Date().toISOString(),
});

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-900 shadow-sm";

const AdminLogin: React.FC<{ onDone: () => void }> = () => {
  const { showToast } = useApp();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      showToast('This email is not authorized for admin access', 'error');
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showToast('Welcome back, Admin', 'success');
    } catch {
      try { await signOut(auth); } catch {}
      showToast('Wrong password or account not found. Create the user in Firebase Console first.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-transparent">
      <section className="max-w-md mx-auto px-5 py-20">
        <div className="rounded-[2rem] bg-white border border-stone-200 shadow-xl p-8 text-center">
          <span className="w-14 h-14 rounded-3xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-5">
            <Database className="w-6 h-6" />
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 mb-1">DB Admin Login</h2>
          <p className="text-sm text-stone-500 mb-6">Only the admin email can sign in here.</p>
          <form onSubmit={login} className="space-y-3 text-left">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className={inputCls} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className={inputCls} />
            <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 disabled:opacity-50">
              {busy ? 'Signing in...' : 'Login to admin panel'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export const RtdbAdminPanel: React.FC = () => {
  const { user, showToast, siteSettings } = useApp();
  const isAllowed = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const [tab, setTab] = useState<'products' | 'inquiries' | 'settings'>('products');
  const [items, setItems] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [featText, setFeatText] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [heroNotice, setHeroNotice] = useState('');

  useEffect(() => {
    const off1 = onValue(rtdbProductsRef(), (snap) => setItems(snapToProducts(snap.val())), () => {});
    const off2 = onValue(rtdbInquiriesRef(), (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') {
        const list = Object.entries(val as Record<string, Inquiry>).map(([id, q]) => ({ ...q, id }));
        setInquiries(list.reverse());
      } else setInquiries([]);
    }, () => {});
    return () => { off1(); off2(); };
  }, []);

  useEffect(() => {
    setWaNumber(siteSettings.whatsappNumber || '');
    setHeroNotice((siteSettings as { heroNotice?: string }).heroNotice || '');
  }, [siteSettings]);

  if (!isAllowed) {
    return <AdminLogin onDone={() => {}} />;
  }

  const startNew = () => { setEditing(emptyProduct()); setFeatText(''); };
  const startEdit = (p: Product) => { setEditing({ ...p }); setFeatText((p.features || []).join('\n')); };

  const save = async () => {
    if (!editing || !editing.name.trim()) { showToast('Product name required', 'error'); return; }
    const cat = CATS.find((c) => c.id === editing.category);
    const toSave: Product = {
      ...editing,
      slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryLabel: cat?.label || editing.categoryLabel,
      features: featText.split('\n').map((s) => s.trim()).filter(Boolean),
      priceBDT: Number(editing.priceBDT) || 0,
      discountPriceBDT: editing.discountPriceBDT ? Number(editing.discountPriceBDT) : undefined,
    };
    try {
      await saveProductRTDB(toSave);
      showToast('Saved to Realtime Database', 'success');
      setEditing(null);
    } catch {
      showToast('Save failed — check RTDB rules', 'error');
    }
  };

  return (
    <div className="bg-transparent">
      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Realtime Database • chat-2-me-c3213
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">DB Admin Panel</h2>
            <button onClick={async () => { await signOut(auth); showToast('Signed out', 'info'); }} className="text-xs font-semibold text-stone-400 hover:text-rose-600 underline underline-offset-4">
              Logout ({user?.email})
            </button>
          </div>
          <div className="flex gap-2 bg-white border border-stone-200 rounded-full p-1">
            {([
              { id: 'products', label: 'Products', icon: ShoppingBag },
              { id: 'inquiries', label: 'Inbox', icon: MessagesSquare },
              { id: 'settings', label: 'Settings', icon: Settings2 },
            ] as const).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition ${tab === t.id ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'}`}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
                {t.id === 'inquiries' && inquiries.length > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{inquiries.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === 'products' && (
          <>
            <button onClick={startNew} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 mb-5">
              <Plus className="w-4 h-4" /> Add product
            </button>
            {items.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-stone-300 text-sm text-stone-400">
                No products in Realtime Database yet — add your first one. Site falls back to old catalog until then.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((p) => (
                  <div key={p.id} className="rounded-3xl bg-white border border-stone-200 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                        {p.isPublished ? 'Published' : 'Hidden'}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(p)} className="p-2 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={async () => { if (confirm(`Delete "${p.name}"?`)) { await deleteProductRTDB(p.id); showToast('Deleted', 'info'); } }} className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h4 className="font-bold text-stone-900">{p.name}</h4>
                    <p className="text-xs text-stone-400">{p.categoryLabel}</p>
                    <p className="font-extrabold text-stone-900 mt-2">৳{(p.discountPriceBDT || p.priceBDT).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'inquiries' && (
          <div className="space-y-3">
            {inquiries.length === 0 && (
              <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-stone-300 text-sm text-stone-400">Inbox empty — new contact/chatbot leads appear here.</div>
            )}
            {inquiries.map((q) => (
              <div key={q.id} className="rounded-2xl bg-white border border-stone-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{q.name} <span className="font-normal text-stone-400">• {q.phone}</span></p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">{q.serviceType}</p>
                    <p className="text-sm text-stone-600 mt-2">{q.message}</p>
                    <p className="text-[11px] text-stone-400 mt-1">{new Date(q.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={async () => { await deleteInquiryRTDB(q.id); }} className="p-2 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 shrink-0" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-xl rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">WhatsApp number (site-wide)</label>
              <input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="01767882562" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Announcement bar text</label>
              <input value={heroNotice} onChange={(e) => setHeroNotice(e.target.value)} placeholder="Offer text..." className={inputCls} />
            </div>
            <button
              onClick={async () => {
                try {
                  await saveSettingsRTDB({ whatsappNumber: waNumber, heroNotice } as Partial<import('../types').SiteSettings>);
                  showToast('Settings saved to RTDB — live instantly', 'success');
                } catch {
                  showToast('Save failed — check RTDB rules', 'error');
                }
              }}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700"
            >
              <Check className="w-4 h-4" /> Save settings
            </button>
            <p className="text-xs text-stone-400">RTDB settings override everything — WhatsApp buttons update across the site immediately.</p>
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl my-8 bg-white rounded-[1.75rem] shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-stone-900">{items.some((p) => p.id === editing.id) ? 'Edit product' : 'New product'}</h3>
                <button onClick={() => setEditing(null)} className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500"><X className="w-4 h-4" /></button>
              </div>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Product name *" className={inputCls} />
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} placeholder="Short description" className={`${inputCls} resize-none`} />
              <div className="grid sm:grid-cols-2 gap-4">
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Product['category'] })} className={inputCls}>
                  {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select value={editing.deliveryType} onChange={(e) => setEditing({ ...editing, deliveryType: e.target.value as Product['deliveryType'] })} className={inputCls}>
                  <option value="custom-delivery">Custom delivery</option>
                  <option value="instant-download">Instant download</option>
                  <option value="service-booking">Service booking</option>
                  <option value="license-key">License key</option>
                </select>
                <input type="number" value={editing.priceBDT} onChange={(e) => setEditing({ ...editing, priceBDT: Number(e.target.value) })} placeholder="Price BDT *" className={inputCls} />
                <input type="number" value={editing.discountPriceBDT || ''} onChange={(e) => setEditing({ ...editing, discountPriceBDT: e.target.value ? Number(e.target.value) : undefined })} placeholder="Discount price (optional)" className={inputCls} />
                <input value={editing.badge || ''} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} placeholder="Badge (e.g. Popular)" className={inputCls} />
                <input value={editing.version} onChange={(e) => setEditing({ ...editing, version: e.target.value })} placeholder="Version" className={inputCls} />
              </div>
              <textarea value={featText} onChange={(e) => setFeatText(e.target.value)} rows={4} placeholder={'Features — one per line:\nFast delivery\nSource code included'} className={`${inputCls} resize-none`} />
              <input value={editing.compatibility} onChange={(e) => setEditing({ ...editing, compatibility: e.target.value })} placeholder="Compatibility" className={inputCls} />
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="w-4 h-4 accent-stone-900" />
                Published (visible in shop)
              </label>
              <button onClick={save} className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700">Save to Realtime Database</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
