import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/rtdb';
import { Product, ProductCategory, Inquiry, Testimonial, PortfolioItem, ProductReview } from '../types';
import {
  rtdbProductsRef,
  rtdbInquiriesRef,
  rtdbOrdersRef,
  rtdbTestimonialsRef,
  rtdbPortfolioRef,
  rtdbReviewsRef,
  snapToProducts,
  snapToOrders,
  snapToTestimonials,
  snapToPortfolio,
  snapToReviews,
  saveProductRTDB,
  deleteProductRTDB,
  updateOrderRTDB,
  deleteOrderRTDB,
  saveSettingsRTDB,
  deleteInquiryRTDB,
  saveTestimonialRTDB,
  deleteTestimonialRTDB,
  savePortfolioRTDB,
  deletePortfolioRTDB,
  updateReviewRTDB,
  deleteReviewRTDB,
  onValue,
} from '../firebase/rtdb';
import {
  Plus, Trash2, Pencil, X, Check, Database, ShoppingBag, MessagesSquare,
  Settings2, Package, LayoutDashboard, Star, ArrowRight, LogOut, Users, Upload,
} from 'lucide-react';
import { Stars } from './Stars';
import { Order } from '../types';

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

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 shadow-sm";

type Tab = 'dashboard' | 'products' | 'orders' | 'inbox' | 'reviews' | 'content' | 'customers' | 'settings';

const REPLY_TEMPLATES = [
  { label: 'Price list', text: 'Hello! Thanks for messaging Sairah Labs 🙏\n\nOur prices:\n• Business website — from ৳3,500\n• Online store — from ৳5,500\n• AI chatbot — ৳800/month\n\nWhich one do you need? I will share a free quote.' },
  { label: 'Delivery info', text: 'Hello! Delivery time:\n• Business website — 4 days\n• Online store — 7 days\n• Chatbot setup — 2 days\n\n Preview in 48 hours, source code included ✅' },
  { label: 'Payment', text: 'Hello! Order confirm korle payment details ekhane dibo. Apnar nam + address ta pathan, order ready kore dicchi ✅' },
];

export const RtdbAdminPanel: React.FC = () => {
  const { user, showToast, siteSettings, setActiveTab } = useApp();
  const isAllowed = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const [tab, setTab] = useState<Tab>('dashboard');
  const [items, setItems] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [allReviews, setAllReviews] = useState<ProductReview[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [featText, setFeatText] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [heroNotice, setHeroNotice] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [contentMode, setContentMode] = useState<'reviews' | 'work'>('reviews');
  const [tName, setTName] = useState('');
  const [tRole, setTRole] = useState('');
  const [tQuote, setTQuote] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pCat, setPCat] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pStat, setPStat] = useState('');

  useEffect(() => {
    if (!isAllowed) return;
    const offs = [
      onValue(rtdbProductsRef(), (s) => setItems(snapToProducts(s.val())), () => {}),
      onValue(rtdbInquiriesRef(), (s) => {
        const v = s.val();
        setInquiries(v && typeof v === 'object'
          ? Object.entries(v as Record<string, Inquiry>).map(([id, q]) => ({ ...q, id })).reverse()
          : []);
      }, () => {}),
      onValue(rtdbOrdersRef(), (s) => setOrders(snapToOrders(s.val())), () => {}),
      onValue(rtdbTestimonialsRef(), (s) => setTestimonials(snapToTestimonials(s.val())), () => {}),
      onValue(rtdbPortfolioRef(), (s) => setPortfolio(snapToPortfolio(s.val())), () => {}),
      onValue(rtdbReviewsRef(), (s) => setAllReviews(snapToReviews(s.val())), () => {}),
    ];
    return () => offs.forEach((o) => o());
  }, [isAllowed]);

  useEffect(() => {
    setWaNumber(siteSettings.whatsappNumber || '');
    setHeroNotice((siteSettings as { heroNotice?: string }).heroNotice || '');
  }, [siteSettings]);

  if (!isAllowed) return <AdminLogin />;

  const revenue = orders.filter((o) => ['Paid', 'Completed'].includes(o.paymentStatus)).reduce((s, o) => s + (o.totalAmountBDT || 0), 0);

  // Last 7 days order chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => (o.createdAt || '').slice(0, 10) === key);
    return { label: d.toLocaleDateString('en-GB', { weekday: 'short' }), count: dayOrders.length, revenue: dayOrders.reduce((s, o) => s + (o.totalAmountBDT || 0), 0) };
  });
  const maxCount = Math.max(1, ...last7.map((d) => d.count));

  // Top products by ordered quantity
  const topProducts = (() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach((o) => (o.items || []).forEach((it) => {
      const cur = map.get(it.productName) || { name: it.productName, qty: 0, revenue: 0 };
      cur.qty += it.quantity || 1;
      cur.revenue += (it.priceBDT || 0) * (it.quantity || 1);
      map.set(it.productName, cur);
    }));
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  })();

  // Browser alerts for new inbox/orders while panel is open
  const prevCounts = React.useRef({ inbox: -1, orders: -1 });
  useEffect(() => {
    if (!isAllowed || typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') Notification.requestPermission().catch(() => {});
    const { inbox, orders: oc } = { inbox: inquiries.length, orders: orders.length };
    if (prevCounts.current.inbox >= 0 && inbox > prevCounts.current.inbox && Notification.permission === 'granted') {
      new Notification('Sairah Labs — new message', { body: 'A customer just sent a message. Check Inbox.' });
      showToast('New inbox message!', 'info');
    }
    if (prevCounts.current.orders >= 0 && oc > prevCounts.current.orders && Notification.permission === 'granted') {
      new Notification('Sairah Labs — new order', { body: 'A new order just came in. Check Orders.' });
      showToast('New order received!', 'success');
    }
    prevCounts.current = { inbox, orders: oc };
  }, [inquiries.length, orders.length, isAllowed]);
  const stats = [
    { label: 'Products live', value: items.filter((p) => p.isPublished).length, sub: `${items.length} total`, icon: ShoppingBag },
    { label: 'Orders', value: orders.length, sub: `৳${revenue.toLocaleString()} collected`, icon: Package },
    { label: 'Inbox leads', value: inquiries.length, sub: 'contact + chatbot', icon: MessagesSquare },
    { label: 'Reviews live', value: testimonials.length, sub: `${portfolio.length} work items`, icon: Star },
  ];

  const TABS: Array<{ id: Tab; label: string; icon: typeof Database; badge?: number }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    { id: 'inbox', label: 'Inbox', icon: MessagesSquare, badge: inquiries.length },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: allReviews.filter((r) => r.status === 'pending').length },
    { id: 'content', label: 'Content', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  const startNew = () => { setEditing(emptyProduct()); setFeatText(''); };
  const startEdit = (p: Product) => { setEditing({ ...p }); setFeatText((p.features || []).join('\n')); };

  const save = async () => {
    if (!editing || !editing.name.trim()) { showToast('Product name required', 'error'); return; }
    const cat = CATS.find((c) => c.id === editing.category);
    await saveProductRTDB({
      ...editing,
      slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryLabel: cat?.label || editing.categoryLabel,
      features: featText.split('\n').map((s) => s.trim()).filter(Boolean),
      priceBDT: Number(editing.priceBDT) || 0,
      discountPriceBDT: editing.discountPriceBDT ? Number(editing.discountPriceBDT) : undefined,
    }).then(() => { showToast('Saved — live on site instantly', 'success'); setEditing(null); })
      .catch(() => showToast('Save failed — check RTDB rules', 'error'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-[#fafaf9] to-[#fafaf9]">
      <section className="max-w-6xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[1.75rem] bg-stone-900 text-white p-7 sm:p-9 mb-6">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/25 blur-3xl pointer-events-none" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-300" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Sairah Labs — Admin</h2>
                <p className="text-xs text-stone-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Realtime Database connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-semibold hover:bg-white/20 transition">
                View site <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={async () => { await signOut(auth); showToast('Signed out', 'info'); }} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-stone-400 hover:text-white transition">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="relative flex gap-1.5 mt-6 overflow-x-auto scrollbar-none">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition ${tab === t.id ? 'bg-white text-stone-900 shadow' : 'text-stone-400 hover:text-white hover:bg-white/10'}`}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
                {!!t.badge && <span className="min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{t.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl bg-white border border-stone-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
                  <s.icon className="w-5 h-5 text-emerald-700 mb-3" />
                  <p className="text-2xl font-extrabold text-stone-900">{s.value}</p>
                  <p className="text-xs font-semibold text-stone-900 mt-0.5">{s.label}</p>
                  <p className="text-[11px] text-stone-400">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
                <h4 className="font-bold text-stone-900 text-sm mb-1">Orders — last 7 days</h4>
                <p className="text-[11px] text-stone-400 mb-4">Bars = orders, hover title shows revenue</p>
                <div className="flex items-end gap-2 h-32">
                  {last7.map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5" title={`${d.count} orders • ৳${d.revenue.toLocaleString()}`}>
                      <span className="text-[11px] font-bold text-stone-700">{d.count > 0 ? d.count : ''}</span>
                      <div className="w-full rounded-lg bg-stone-100 relative overflow-hidden" style={{ height: '100%' }}>
                        <div className="absolute bottom-0 w-full rounded-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all" style={{ height: `${Math.max(d.count > 0 ? 12 : 4, (d.count / maxCount) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
                <h4 className="font-bold text-stone-900 text-sm mb-4">Top selling products</h4>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-stone-400">No sales data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-stone-900 truncate">{p.name}</p>
                          <div className="h-1.5 rounded-full bg-stone-100 mt-1 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(p.qty / Math.max(1, topProducts[0].qty)) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-700 whitespace-nowrap">{p.qty} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
                <h4 className="font-bold text-stone-900 text-sm mb-4">Quick actions</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Add product', fn: () => { startNew(); setTab('products'); } },
                    { label: 'Add review', fn: () => { setContentMode('reviews'); setTab('content'); } },
                    { label: 'Add work', fn: () => { setContentMode('work'); setTab('content'); } },
                    { label: 'Edit settings', fn: () => setTab('settings') },
                  ].map((a) => (
                    <button key={a.label} onClick={a.fn} className="px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-[13px] font-semibold text-stone-700 hover:border-stone-900 hover:bg-white transition text-left">
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
                <h4 className="font-bold text-stone-900 text-sm mb-4">Latest inbox</h4>
                {inquiries.length === 0 ? (
                  <p className="text-sm text-stone-400">No messages yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {inquiries.slice(0, 3).map((q) => (
                      <button key={q.id} onClick={() => setTab('inbox')} className="w-full text-left p-3.5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-300 transition">
                        <p className="text-[13px] font-bold text-stone-900">{q.name} <span className="font-normal text-stone-400">• {q.serviceType}</span></p>
                        <p className="text-xs text-stone-500 truncate mt-0.5">{q.message}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={startNew} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 shadow">
                <Plus className="w-4 h-4" /> Add product
              </button>
              <button onClick={() => setBulkOpen(!bulkOpen)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-stone-200 text-sm font-bold text-stone-700 hover:border-stone-900 transition">
                <Upload className="w-4 h-4" /> Bulk upload
              </button>
            </div>
            {bulkOpen && (
              <div className="rounded-3xl bg-white border border-stone-200 p-5 mb-5 shadow-sm">
                <p className="text-xs font-bold text-stone-500 mb-1.5">One product per line: <span className="font-mono font-normal">name | price | category | description</span></p>
                <p className="text-[11px] text-stone-400 mb-2.5">Category: websites, pc-optimization, gaming-tools, windows-panels, gaming-services</p>
                <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={5}
                  placeholder={'Business Website | 3500 | websites | 8-page company site\nGaming Top-up Store | 4500 | gaming-tools | Player-ID checkout store'}
                  className={`${inputCls} resize-none font-mono !text-[13px]`} />
                <button disabled={bulkBusy} onClick={async () => {
                  const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
                  if (lines.length === 0) { showToast('Paste at least one line', 'error'); return; }
                  setBulkBusy(true);
                  let done = 0;
                  for (const line of lines) {
                    const [name, price, cat, ...desc] = line.split('|').map((s) => s.trim());
                    if (!name) continue;
                    const category = (CATS.some((c) => c.id === cat) ? cat : 'websites') as Product['category'];
                    const base = emptyProduct();
                    try {
                      await saveProductRTDB({
                        ...base,
                        name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        category,
                        categoryLabel: CATS.find((c) => c.id === category)?.label || category,
                        description: desc.join(' | '),
                        priceBDT: Number(price) || 0,
                      });
                      done++;
                    } catch {}
                  }
                  setBulkBusy(false);
                  setBulkText('');
                  setBulkOpen(false);
                  showToast(`${done} products added!`, 'success');
                }} className="mt-3 px-6 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 disabled:opacity-50">
                  {bulkBusy ? 'Uploading...' : 'Upload all'}
                </button>
              </div>
            )}
            {items.length === 0 ? (
              <EmptyBox text="No products yet — add your first one. Shop section stays hidden on site until then." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((p) => (
                  <div key={p.id} className="rounded-3xl bg-white border border-stone-200 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${p.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                        {p.isPublished ? '● Live' : '○ Hidden'}
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

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 && <EmptyBox text="No orders yet." />}
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{o.customerName || 'Guest'} <span className="font-normal text-stone-400">• {o.customerPhone}</span></p>
                    <p className="text-xs text-stone-500 mt-1 font-mono">{o.id} • ৳{o.totalAmountBDT.toLocaleString()}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{o.items?.map((i) => `${i.productName} x${i.quantity}`).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={o.paymentStatus} onChange={async (e) => { await updateOrderRTDB(o.id, { paymentStatus: e.target.value as Order['paymentStatus'] }); showToast('Order updated', 'success'); }}
                      className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 outline-none">
                      {['Pending', 'Awaiting Payment', 'Payment Under Review', 'Paid', 'In Progress', 'Ready for Delivery', 'Completed', 'Rejected', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={async () => { if (confirm('Delete this order?')) await deleteOrderRTDB(o.id); }} className="p-2 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS MODERATION */}
        {tab === 'reviews' && (
          <div className="space-y-3">
            {allReviews.filter((r) => r.status === 'pending').length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Waiting approval ({allReviews.filter((r) => r.status === 'pending').length})</p>
                {allReviews.filter((r) => r.status === 'pending').map((r) => (
                  <div key={r.id} className="rounded-2xl bg-amber-50/60 border border-amber-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-stone-900 text-sm">{r.name} <span className="font-normal text-stone-400">• on {r.productName}</span></p>
                        <span className="inline-block my-1.5"><Stars value={r.rating} size="w-3.5 h-3.5" /></span>
                        <p className="text-sm text-stone-600">{r.text}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={async () => { await updateReviewRTDB(r.id, { status: 'approved' }); showToast('Review published', 'success'); }} className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500" title="Approve & publish">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={async () => { if (confirm('Delete this review?')) await deleteReviewRTDB(r.id); }} className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 pt-2">Published ({allReviews.filter((r) => r.status === 'approved').length})</p>
            {allReviews.filter((r) => r.status === 'approved').length === 0 && <EmptyBox text="No published reviews yet." />}
            {allReviews.filter((r) => r.status === 'approved').map((r) => (
              <div key={r.id} className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-stone-900 text-sm">{r.name} <span className="font-normal text-stone-400">• on {r.productName}</span></p>
                  <span className="inline-block my-1"><Stars value={r.rating} size="w-3 h-3" /></span>
                  <p className="text-sm text-stone-600">{r.text}</p>
                </div>
                <button onClick={async () => { if (confirm('Remove this review from site?')) await deleteReviewRTDB(r.id); }} className="p-2 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 shrink-0" title="Remove"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

        {/* INBOX */}
        {tab === 'inbox' && (
          <div className="space-y-3">
            {inquiries.length === 0 && <EmptyBox text="Inbox empty — contact form + chatbot leads appear here live." />}
            {inquiries.map((q) => (
              <div key={q.id} className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-stone-900 text-sm">{q.name} <span className="font-normal text-stone-400">• {q.phone}</span></p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">{q.serviceType}</p>
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{q.message}</p>
                    <p className="text-[11px] text-stone-400 mt-1.5">{new Date(q.createdAt).toLocaleString()}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <a href={`https://wa.me/${q.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded-full bg-[#25d366] text-white text-xs font-bold hover:bg-[#1eb85a]">
                        Reply on WhatsApp
                      </a>
                      {REPLY_TEMPLATES.map((tpl) => (
                        <a key={tpl.label} href={`https://wa.me/${q.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${q.name}! ` + tpl.text)}`} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-2 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-semibold text-stone-600 hover:border-stone-900 hover:text-stone-900 transition">
                          {tpl.label} template
                        </a>
                      ))}
                    </div>
                  </div>
                  <button onClick={async () => { await deleteInquiryRTDB(q.id); }} className="p-2 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 shrink-0" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CUSTOMERS */}
        {tab === 'customers' && (
          <CustomerList orders={orders} inquiries={inquiries} />
        )}

        {/* CONTENT */}
        {tab === 'content' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              {(['reviews', 'work'] as const).map((m) => (
                <button key={m} onClick={() => setContentMode(m)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${contentMode === m ? 'bg-stone-900 text-white shadow' : 'bg-white border border-stone-200 text-stone-500 hover:text-stone-900'}`}>
                  {m === 'reviews' ? `Reviews (${testimonials.length})` : `Work (${portfolio.length})`}
                </button>
              ))}
            </div>

            {contentMode === 'reviews' && (
              <div className="grid lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 rounded-3xl bg-white border border-stone-200 p-6 shadow-sm h-fit">
                  <h4 className="font-bold text-stone-900 text-sm mb-4">Add client review</h4>
                  <div className="space-y-3">
                    <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Client name *" className={inputCls} />
                    <input value={tRole} onChange={(e) => setTRole(e.target.value)} placeholder="Role (e.g. Boutique owner • Dhaka)" className={inputCls} />
                    <textarea value={tQuote} onChange={(e) => setTQuote(e.target.value)} rows={4} placeholder="Review text *" className={`${inputCls} resize-none`} />
                    <button onClick={async () => {
                      if (!tName.trim() || !tQuote.trim()) { showToast('Name + review required', 'error'); return; }
                      await saveTestimonialRTDB({ id: `tst-${Date.now().toString(36)}`, name: tName.trim(), role: tRole.trim(), quote: tQuote.trim(), createdAt: new Date().toISOString() });
                      setTName(''); setTRole(''); setTQuote('');
                      showToast('Review live on site', 'success');
                    }} className="w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700">Publish review</button>
                  </div>
                </div>
                <div className="lg:col-span-3 space-y-3">
                  {testimonials.length === 0 && <EmptyBox text="No reviews — homepage section hidden until you add one." />}
                  {testimonials.map((t) => (
                    <div key={t.id} className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm flex gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-stone-900 text-sm">{t.name} <span className="font-normal text-stone-400">• {t.role}</span></p>
                        <p className="text-sm text-stone-600 mt-1">“{t.quote}”</p>
                      </div>
                      <button onClick={async () => { await deleteTestimonialRTDB(t.id); }} className="p-2 h-fit rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contentMode === 'work' && (
              <div className="grid lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 rounded-3xl bg-white border border-stone-200 p-6 shadow-sm h-fit">
                  <h4 className="font-bold text-stone-900 text-sm mb-4">Add work item</h4>
                  <div className="space-y-3">
                    <input value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="Project title *" className={inputCls} />
                    <input value={pCat} onChange={(e) => setPCat(e.target.value)} placeholder="Category (e.g. E-commerce • WhatsApp orders)" className={inputCls} />
                    <textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={3} placeholder="Result description *" className={`${inputCls} resize-none`} />
                    <input value={pStat} onChange={(e) => setPStat(e.target.value)} placeholder="Metric (e.g. +2.3x sales)" className={inputCls} />
                    <button onClick={async () => {
                      if (!pTitle.trim() || !pDesc.trim()) { showToast('Title + description required', 'error'); return; }
                      await savePortfolioRTDB({ id: `wrk-${Date.now().toString(36)}`, title: pTitle.trim(), category: pCat.trim(), description: pDesc.trim(), stat: pStat.trim(), createdAt: new Date().toISOString() });
                      setPTitle(''); setPCat(''); setPDesc(''); setPStat('');
                      showToast('Work item live on site', 'success');
                    }} className="w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700">Publish work</button>
                  </div>
                </div>
                <div className="lg:col-span-3 space-y-3">
                  {portfolio.length === 0 && <EmptyBox text="No work items — homepage section hidden until you add one." />}
                  {portfolio.map((w) => (
                    <div key={w.id} className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm flex gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-stone-900 text-sm">{w.title}</p>
                        <p className="text-xs text-emerald-700 font-semibold">{w.category} • {w.stat}</p>
                        <p className="text-sm text-stone-600 mt-1">{w.description}</p>
                      </div>
                      <button onClick={async () => { await deletePortfolioRTDB(w.id); }} className="p-2 h-fit rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <SettingsForm
            waNumber={waNumber} setWaNumber={setWaNumber}
            heroNotice={heroNotice} setHeroNotice={setHeroNotice}
          />
        )}

        {/* PRODUCT MODAL */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl my-8 bg-white rounded-[1.75rem] shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-stone-900">{items.some((p) => p.id === editing.id) ? 'Edit product' : 'New product'}</h3>
                <button onClick={() => setEditing(null)} className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500"><X className="w-4 h-4" /></button>
              </div>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Product name *" className={inputCls} />
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} placeholder="Short description" className={`${inputCls} resize-none`} />
              <input value={(editing.imageUrls || []).join(', ')} onChange={(e) => setEditing({ ...editing, imageUrls: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Image URL (optional, https://...)" className={inputCls} />
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

const EmptyBox: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-16 px-6 text-center rounded-3xl bg-white border border-dashed border-stone-300 text-sm text-stone-400">{text}</div>
);

const CustomerList: React.FC<{ orders: Order[]; inquiries: Inquiry[] }> = ({ orders, inquiries }) => {
  const map = new Map<string, { name: string; phone: string; orders: number; spent: number; last: string }>();
  const touch = (name: string, phone: string, spent = 0, date = '') => {
    const key = phone.replace(/[^0-9]/g, '') || name.toLowerCase();
    if (!key) return;
    const cur = map.get(key) || { name, phone, orders: 0, spent: 0, last: '' };
    if (name) cur.name = name;
    if (phone) cur.phone = phone;
    if (spent > 0) { cur.orders += 1; cur.spent += spent; }
    if (date && date > cur.last) cur.last = date;
    map.set(key, cur);
  };
  orders.forEach((o) => touch(o.customerName || '', o.customerPhone || '', o.totalAmountBDT || 0, o.createdAt || ''));
  inquiries.forEach((q) => touch(q.name || '', q.phone || '', 0, q.createdAt || ''));
  const list = [...map.values()].sort((a, b) => b.spent - a.spent);

  if (list.length === 0) return <EmptyBox text="No customers yet — they appear automatically from orders + inbox." />;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {list.map((c) => (
        <div key={c.phone + c.name} className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-extrabold shrink-0">
            {(c.name || '?').charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-stone-900 text-sm truncate">{c.name || 'Unknown'}</p>
            <p className="text-xs text-stone-400 font-mono">{c.phone || '—'}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">{c.orders} orders • ৳{c.spent.toLocaleString()} spent</p>
          </div>
          {c.phone && (
            <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${c.name}! Sairah Labs theke bolchi — apnar jonno ekta special offer ache 🎉`)}`} target="_blank" rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-full bg-[#25d366] text-white text-[11px] font-bold hover:bg-[#1eb85a] shrink-0">
              Send offer
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

const SettingsForm: React.FC<{
  waNumber: string; setWaNumber: (v: string) => void;
  heroNotice: string; setHeroNotice: (v: string) => void;
}> = ({ waNumber, setWaNumber, heroNotice, setHeroNotice }) => {
  const { showToast } = useApp();
  const [offerText, setOfferText] = useState('');
  const [offerEndsAt, setOfferEndsAt] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const { siteSettings } = useApp();

  useEffect(() => {
    setOfferText(siteSettings.offerText || '');
    setOfferEndsAt(siteSettings.offerEndsAt ? siteSettings.offerEndsAt.slice(0, 16) : '');
    setCouponCode(siteSettings.couponCode || '');
  }, [siteSettings]);

  return (
    <div className="max-w-xl rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
      <div>
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">WhatsApp number (site-wide)</label>
        <input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="01767882562" className={inputCls} />
      </div>
      <div>
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Announcement bar text</label>
        <input value={heroNotice} onChange={(e) => setHeroNotice(e.target.value)} placeholder="Offer text..." className={inputCls} />
      </div>
      <div className="pt-3 border-t border-stone-100 space-y-4">
        <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">Offer banner + countdown</p>
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Offer text (empty = hidden)</label>
          <input value={offerText} onChange={(e) => setOfferText(e.target.value)} placeholder="Eid offer — 20% off all websites!" className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Ends at</label>
            <input type="datetime-local" value={offerEndsAt} onChange={(e) => setOfferEndsAt(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Coupon code</label>
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="EID20" className={inputCls} />
          </div>
        </div>
      </div>
      <button
        onClick={async () => {
          try {
            await saveSettingsRTDB({
              whatsappNumber: waNumber, heroNotice, offerText,
              offerEndsAt: offerEndsAt ? new Date(offerEndsAt).toISOString() : '',
              couponCode,
            } as Partial<import('../types').SiteSettings>);
            showToast('Settings saved — live instantly', 'success');
          } catch {
            showToast('Save failed — check RTDB rules', 'error');
          }
        }}
        className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700"
      >
        <Check className="w-4 h-4" /> Save settings
      </button>
    </div>
  );
};

const AdminLogin: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-[#fafaf9] flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-[2rem] bg-white border border-stone-200 shadow-xl p-8 text-center">
        <span className="w-14 h-14 rounded-3xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-5">
          <Database className="w-6 h-6" />
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 mb-1">Sairah Labs — Admin</h2>
        <p className="text-sm text-stone-500 mb-6">Sign in to manage your business.</p>
        <form onSubmit={login} className="space-y-3 text-left">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className={inputCls} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className={inputCls} />
          <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 disabled:opacity-50">
            {busy ? 'Signing in...' : 'Login to admin panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
