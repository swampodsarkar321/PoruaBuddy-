import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, OrderStatus, ProductCategory } from '../types';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Package,
  Layers,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  FileText,
  Key,
  Download,
  Settings,
  Mail,
  Phone,
  MessageSquare,
  Lock,
  Unlock,
  Eye,
  Sliders,
  Send
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    user,
    isAdmin,
    demoAdminMode,
    setDemoAdminMode,
    orders,
    products,
    inquiries,
    siteSettings,
    updateSiteSettings,
    saveProduct,
    deleteProduct,
    resetToInitialProducts,
    updateOrderStatus,
    updateInquiryStatus,
    showToast,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'orders' | 'products' | 'inquiries' | 'settings'>('overview');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Selected Order for Review/Approval Modal
  const [selectedOrderForVerification, setSelectedOrderForVerification] = useState<Order | null>(null);
  const [reviewStatus, setReviewStatus] = useState<OrderStatus>('Paid');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [downloadLinkInput, setDownloadLinkInput] = useState('');
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  // Product Add / Edit Modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isEditingProductModalOpen, setIsEditingProductModalOpen] = useState(false);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(siteSettings);

  // Financial & Metric Calculations
  const totalRevenueBDT = orders
    .filter((o) => o.paymentStatus === 'Paid' || o.paymentStatus === 'Completed')
    .reduce((sum, o) => sum + o.totalAmountBDT, 0);

  const pendingPaymentsCount = orders.filter(
    (o) => o.paymentStatus === 'Payment Under Review' || o.paymentStatus === 'Awaiting Payment'
  ).length;

  const completedOrdersCount = orders.filter(
    (o) => o.paymentStatus === 'Paid' || o.paymentStatus === 'Completed'
  ).length;

  const newInquiriesCount = inquiries.filter((i) => i.status === 'New').length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.paymentStatus !== orderFilter) return false;
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.transactionId.toLowerCase().includes(q) ||
      o.senderPhone.toLowerCase().includes(q)
    );
  });

  const handleOpenVerifyModal = (order: Order) => {
    setSelectedOrderForVerification(order);
    setReviewStatus(order.paymentStatus === 'Payment Under Review' ? 'Paid' : order.paymentStatus);
    setDeliveryNotes(order.deliveryNotes || 'Payment confirmed via bKash/Nagad statement. Access granted.');
    setDownloadLinkInput(order.downloadLinks ? order.downloadLinks.join(', ') : '');
    setLicenseKeyInput(order.licenseKeys ? order.licenseKeys.join(', ') : '');
  };

  const handleSaveOrderVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForVerification) return;

    const links = downloadLinkInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const keys = licenseKeyInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateOrderStatus(
        selectedOrderForVerification.id,
        reviewStatus,
        deliveryNotes.trim(),
        keys.length > 0 ? keys : undefined,
        links.length > 0 ? links : undefined
      );
      setSelectedOrderForVerification(null);
      showToast(`Order ${selectedOrderForVerification.id} updated to "${reviewStatus}"!`, 'success');
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleOpenNewProduct = () => {
    setEditingProduct({
      name: '',
      slug: '',
      category: 'pc-optimization',
      categoryLabel: 'PC Optimization',
      description: '',
      fullDetails: '',
      priceBDT: 299,
      discountPriceBDT: undefined,
      imageUrls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'],
      features: ['Feature 1', 'Feature 2'],
      compatibility: 'Windows 10 / 11',
      deliveryType: 'instant-download',
      licenseInfo: 'Standard License',
      version: 'v1.0.0',
      downloadUrl: '',
      isPublished: true,
      badge: '',
    });
    setIsEditingProductModalOpen(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.priceBDT) {
      showToast('Please provide product name and price in BDT', 'error');
      return;
    }

    try {
      await saveProduct(editingProduct);
      setIsEditingProductModalOpen(false);
      setEditingProduct(null);
    } catch {
      showToast('Error saving product', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSiteSettings(settingsForm);
      showToast('Settings updated successfully!', 'success');
    } catch {
      showToast('Error saving settings', 'error');
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-purple-500/30 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/60 flex items-center justify-center text-purple-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Sairah Labs Admin Control
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900 text-purple-200 uppercase font-mono">
                {demoAdminMode ? 'Demo Admin' : 'Super Admin'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Authorized admin: <span className="text-cyan-400 font-mono">mdswampodsarkar007@gmail.com</span> (Swampod)
            </p>
          </div>
        </div>

        {/* Admin Demo Switcher & Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDemoAdminMode(!demoAdminMode)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition"
          >
            {demoAdminMode ? 'Exit Demo Admin' : 'Toggle Demo Admin'}
          </button>
          <button
            onClick={resetToInitialProducts}
            className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-xs font-semibold text-purple-200 transition flex items-center gap-1.5"
            title="Seed standard products into database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Seed Catalog</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: TrendingUp },
          { id: 'orders', label: `Orders Queue (${pendingPaymentsCount} Review)`, icon: ShoppingBag },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'inquiries', label: `Inquiries (${newInquiriesCount} New)`, icon: MessageSquare },
          { id: 'settings', label: 'Store & Payment Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Revenue */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Verified Revenue
                </span>
                <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                  ৳{totalRevenueBDT.toLocaleString()} BDT
                </span>
                <span className="text-[10px] text-slate-400">bKash &amp; Nagad manually verified</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Pending Reviews */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Payments Under Review
                </span>
                <span className="text-2xl font-black text-yellow-400 font-mono mt-1 block">
                  {pendingPaymentsCount} Orders
                </span>
                <span className="text-[10px] text-yellow-500/80">Requires TrxID verification</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-950/80 border border-yellow-800/80 flex items-center justify-center text-yellow-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3: Completed Orders */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Fulfilled &amp; Paid Orders
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  {completedOrdersCount} Orders
                </span>
                <span className="text-[10px] text-emerald-500/80">Downloads &amp; services delivered</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4: Inquiries */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  New Customer Inquiries
                </span>
                <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
                  {newInquiriesCount} Leads
                </span>
                <span className="text-[10px] text-purple-400/80">Custom sites &amp; chatbots</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Orders Snapshot in Overview */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Recent Orders Awaiting Action</h3>
              <button
                onClick={() => setActiveAdminTab('orders')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                View Full Queue →
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-mono font-bold text-white block">{ord.id}</span>
                      <span className="text-slate-400">
                        {ord.customerName} ({ord.customerPhone}) • {ord.paymentMethod} Trx: {ord.transactionId}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-cyan-300">৳{ord.totalAmountBDT}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {ord.paymentStatus}
                      </span>
                      <button
                        onClick={() => handleOpenVerifyModal(ord)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px]"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT & MANUAL PAYMENT VERIFICATION */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Name, Phone, or TrxID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Status Filter:</span>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="p-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="Payment Under Review">Payment Under Review ({pendingPaymentsCount})</option>
                <option value="Awaiting Payment">Awaiting Payment</option>
                <option value="Paid">Paid</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-3xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment &amp; TrxID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No orders match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-4">
                          <span className="font-mono font-bold text-white block">{ord.id}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-200 block">{ord.customerName}</span>
                          <span className="text-[11px] text-slate-400 block">{ord.customerPhone}</span>
                          <span className="text-[10px] text-slate-500">{ord.customerEmail}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-pink-300">{ord.paymentMethod}</span>
                            <span className="text-slate-400 text-[10px]">• Sender: {ord.senderPhone}</span>
                          </div>
                          <span className="font-mono text-cyan-300 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {ord.transactionId || 'None'}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-white text-sm">
                          ৳{ord.totalAmountBDT.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ord.paymentStatus === 'Payment Under Review'
                                ? 'bg-yellow-950 text-yellow-300 border border-yellow-700'
                                : ord.paymentStatus === 'Rejected'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenVerifyModal(ord)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
                          >
                            Verify &amp; Fulfill
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {activeAdminTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Marketplace Product Catalog</h3>
              <p className="text-xs text-slate-400">
                Add, update prices, or toggle active listing status for any product without touching code.
              </p>
            </div>
            <button
              onClick={handleOpenNewProduct}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                      {prod.categoryLabel}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prod.isPublished
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {prod.isPublished ? 'Published' : 'Hidden'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{prod.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4 font-mono">
                    <span className="text-base font-extrabold text-cyan-300">
                      ৳{prod.priceBDT.toLocaleString()}
                    </span>
                    {prod.discountPriceBDT && (
                      <span className="text-xs text-slate-500 line-through">
                        ৳{prod.discountPriceBDT}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">v{prod.version}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setIsEditingProductModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INQUIRIES & LEADS */}
      {activeAdminTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Customer Inquiries &amp; Quotations</h3>
              <p className="text-xs text-slate-400">
                AI Messenger bot demo requests and custom development proposals.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800 rounded-3xl bg-[#090d16] border border-slate-800 overflow-hidden">
            {inquiries.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No inquiries received yet.</p>
            ) : (
              inquiries.map((inq) => (
                <div key={inq.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{inq.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {inq.serviceType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{inq.message}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Phone: <strong className="text-cyan-400">{inq.phone}</strong></span>
                      {inq.budget && <span>Budget: <strong className="text-emerald-400">{inq.budget}</strong></span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inq.status}
                      onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                      className="p-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="New">New</option>
                      <option value="In Discussion">In Discussion</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <a
                      href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inq.name)},%20this%20is%20Swampod%20from%20Sairah%20Labs%20regarding%20your%20inquiry`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-800"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SITE & PAYMENT SETTINGS */}
      {activeAdminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-[#090d16] border border-slate-800 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-bold text-white">Storefront &amp; Payment Configuration</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure merchant numbers shown to customers during checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">bKash Account Number *</label>
              <input
                type="text"
                required
                value={settingsForm.bkashNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Nagad Account Number *</label>
              <input
                type="text"
                required
                value={settingsForm.nagadNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Official WhatsApp Contact *</label>
              <input
                type="text"
                required
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Top Banner Live Notice (Announcements / Offers)
            </label>
            <input
              type="text"
              value={settingsForm.heroNotice || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroNotice: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Manual Payment Instructions Text
            </label>
            <textarea
              rows={3}
              value={settingsForm.paymentInstructions}
              onChange={(e) => setSettingsForm({ ...settingsForm, paymentInstructions: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            Save Site Settings
          </button>
        </form>
      )}

      {/* VERIFY ORDER MODAL */}
      {selectedOrderForVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div
            className="relative w-full max-w-xl my-8 bg-[#090d16] border border-purple-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">Admin Action</span>
                <h3 className="text-lg font-bold text-white">
                  Verify Payment &amp; Fulfill Order {selectedOrderForVerification.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForVerification(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderVerification} className="space-y-4">
              {/* Order Transaction Details Snapshot */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="text-white font-medium">{selectedOrderForVerification.customerName} ({selectedOrderForVerification.customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Method &amp; Sender:</span>
                  <span className="text-pink-400 font-bold">{selectedOrderForVerification.paymentMethod} • {selectedOrderForVerification.senderPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submitted TrxID:</span>
                  <span className="font-mono text-cyan-300 font-bold text-sm">{selectedOrderForVerification.transactionId}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">Total BDT:</span>
                  <span className="text-white text-sm font-mono">৳{selectedOrderForVerification.totalAmountBDT.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Set Order Status *</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as OrderStatus)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="Paid">Paid (Unlock Digital Deliverables)</option>
                  <option value="Completed">Completed (Fully Delivered)</option>
                  <option value="Payment Under Review">Payment Under Review</option>
                  <option value="In Progress">In Progress (PC Session / Development)</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                  <option value="Awaiting Payment">Awaiting Payment</option>
                  <option value="Rejected">Rejected (TrxID Not Found / Invalid Amount)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Attach Download Links */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Download URLs (comma-separated for multiple files)
                </label>
                <input
                  type="text"
                  placeholder="https://storage.googleapis.com/.../file.zip"
                  value={downloadLinkInput}
                  onChange={(e) => setDownloadLinkInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              {/* Attach License Keys */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  License Keys (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="SL-KEY-XXXX-YYYY, SL-PRO-ZZZZ"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase"
                />
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Customer Delivery Notes / Appointment Instructions
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForVerification(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
                >
                  Save Verification &amp; Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / CREATE PRODUCT MODAL */}
      {isEditingProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div
            className="relative w-full max-w-2xl my-8 bg-[#090d16] border border-cyan-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingProduct.id ? 'Edit Product' : 'Add New Digital Product'}
              </h3>
              <button
                onClick={() => setIsEditingProductModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'pc-optimization'}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      const labels: Record<ProductCategory, string> = {
                        'pc-optimization': 'PC Optimization',
                        'gaming-tools': 'Gaming Tools',
                        'windows-panels': 'Windows Panels',
                        'websites': 'Website Shop',
                        'gaming-services': 'Gaming Services',
                      };
                      setEditingProduct({
                        ...editingProduct,
                        category: cat,
                        categoryLabel: labels[cat],
                      });
                    }}
                    className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="pc-optimization">PC Optimization</option>
                    <option value="gaming-tools">Gaming Tools</option>
                    <option value="windows-panels">Windows Panels</option>
                    <option value="websites">Website Shop</option>
                    <option value="gaming-services">Gaming Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Price in BDT *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceBDT || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceBDT: Number(e.target.value) })}
                    className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Discount Price BDT</label>
                  <input
                    type="number"
                    value={editingProduct.discountPriceBDT || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPriceBDT: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Compatibility</label>
                  <input
                    type="text"
                    value={editingProduct.compatibility || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compatibility: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">License Info</label>
                  <input
                    type="text"
                    value={editingProduct.licenseInfo || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, licenseInfo: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Protected Download URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingProduct.downloadUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, downloadUrl: e.target.value })}
                  className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={editingProduct.isPublished ?? true}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <label htmlFor="pub-check" className="text-xs text-slate-300">
                  Visible &amp; published in store catalog
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
