import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Key,
  MessageCircle,
  FileText,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

export const OrderTrackerModal: React.FC = () => {
  const {
    isOrderTrackerOpen,
    setIsOrderTrackerOpen,
    trackingOrderId,
    setTrackingOrderId,
    findOrderById,
    updateOrderPaymentInfo,
    orders,
    siteSettings,
    showToast,
  } = useApp();

  const [searchInput, setSearchInput] = useState(trackingOrderId || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Edit TrxID states
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [newTrxId, setNewTrxId] = useState('');
  const [newSenderPhone, setNewSenderPhone] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (trackingOrderId) {
      setSearchInput(trackingOrderId);
      handleSearch(trackingOrderId);
    }
  }, [trackingOrderId]);

  if (!isOrderTrackerOpen) return null;

  const handleSearch = async (idToSearch?: string) => {
    const id = (idToSearch || searchInput).trim();
    if (!id) {
      showToast('Please enter an Order ID', 'error');
      return;
    }

    setIsSearching(true);
    setSearchAttempted(true);

    try {
      const order = await findOrderById(id);
      setCurrentOrder(order);
      if (!order) {
        showToast('No order found with that ID. Check for typos or contact WhatsApp.', 'info');
      }
    } catch (e) {
      console.error(e);
      showToast('Error searching for order', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    if (!newTrxId.trim() || !newSenderPhone.trim()) {
      showToast('Please fill in both the new TrxID and Sender Phone', 'error');
      return;
    }

    try {
      await updateOrderPaymentInfo(
        currentOrder.id,
        newTrxId.trim().toUpperCase(),
        newSenderPhone.trim(),
        currentOrder.paymentMethod
      );
      setCurrentOrder({
        ...currentOrder,
        transactionId: newTrxId.trim().toUpperCase(),
        senderPhone: newSenderPhone.trim(),
        paymentStatus: 'Payment Under Review',
      });
      setIsEditingPayment(false);
      showToast('Payment proof updated! Admin will verify.', 'success');
    } catch {
      showToast('Failed to update payment proof', 'error');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast('License key copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            {status} — Digital Assets Unlocked
          </span>
        );
      case 'Payment Under Review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-950/80 text-yellow-300 border border-yellow-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Payment Under Review
          </span>
        );
      case 'In Progress':
      case 'Ready for Delivery':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            {status}
          </span>
        );
      case 'Rejected':
      case 'Cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {status} (Contact Support)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  const isVerifiedPaid = currentOrder?.paymentStatus === 'Paid' || currentOrder?.paymentStatus === 'Completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl my-8 bg-[#090d16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Self-Service Order Portal
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              Track Order &amp; Access Downloads
            </h3>
          </div>
          <button
            onClick={() => {
              setIsOrderTrackerOpen(false);
              setTrackingOrderId('');
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. SL-ORD-...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Lookup</span>
            </button>
          </div>

          {/* Quick Select from Recent Orders if any */}
          {orders.length > 0 && !currentOrder && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 font-mono uppercase">
                Your Recent Orders in Current Session:
              </span>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSearchInput(o.id);
                      handleSearch(o.id);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono flex items-center gap-2 transition"
                  >
                    <span>{o.id}</span>
                    <span className="text-[10px] text-cyan-400">৳{o.totalAmountBDT}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Result View */}
          {currentOrder ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-mono block">Order Reference:</span>
                  <span className="text-base font-bold text-white font-mono">{currentOrder.id}</span>
                </div>
                <div>{getStatusBadge(currentOrder.paymentStatus)}</div>
              </div>

              {/* Protected Digital Assets Box (if Paid or Completed) */}
              {isVerifiedPaid ? (
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Payment Verified — Your Deliverables Are Ready</span>
                  </div>

                  {/* Download Links */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block">
                      Downloadable Software &amp; Assets:
                    </span>
                    {currentOrder.downloadLinks && currentOrder.downloadLinks.length > 0 ? (
                      currentOrder.downloadLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-emerald-800/60 hover:border-emerald-500 text-xs text-white font-medium transition group"
                        >
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-emerald-400 group-hover:animate-bounce" />
                            <span>Download Package #{idx + 1}</span>
                          </div>
                          <span className="text-emerald-400 text-xs font-mono">Access File →</span>
                        </a>
                      ))
                    ) : (
                      <div className="space-y-2">
                        {currentOrder.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                          >
                            <span className="text-white font-medium">{it.productName}</span>
                            <span className="text-emerald-400 font-semibold">Active &amp; Delivered</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* License Keys */}
                  {currentOrder.licenseKeys && currentOrder.licenseKeys.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-emerald-900/40">
                      <span className="text-xs font-semibold text-slate-300 block">
                        Assigned License Keys:
                      </span>
                      {currentOrder.licenseKeys.map((key, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300"
                        >
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-cyan-400" />
                            <span className="tracking-wider">{key}</span>
                          </div>
                          <button
                            onClick={() => copyKey(key)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Copy Key"
                          >
                            {copiedKey === key ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin Delivery Notes */}
                  {currentOrder.deliveryNotes && (
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-semibold text-cyan-400 block">Fulfillment Notes from Swampod:</span>
                      <p>{currentOrder.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Unverified / Pending Notice */
                <div className="p-4 rounded-2xl bg-yellow-950/20 border border-yellow-700/40 text-xs text-slate-300 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-300 mb-1">
                        Manual Verification in Progress
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Our administrator independently checks your submitted {currentOrder.paymentMethod} TrxID ({currentOrder.transactionId})
                        against merchant receipts. Verification is usually completed within 15–45 minutes during business hours.
                      </p>
                    </div>
                  </div>

                  {/* Option to correct TrxID if typo made */}
                  {!isEditingPayment ? (
                    <div className="pt-2 flex justify-between items-center text-[11px] border-t border-yellow-900/40">
                      <span className="text-slate-400">Made a typo in your TrxID?</span>
                      <button
                        onClick={() => {
                          setNewTrxId(currentOrder.transactionId);
                          setNewSenderPhone(currentOrder.senderPhone);
                          setIsEditingPayment(true);
                        }}
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        Update Transaction Info
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateTrx} className="pt-2 border-t border-yellow-900/40 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Sender Phone"
                          value={newSenderPhone}
                          onChange={(e) => setNewSenderPhone(e.target.value)}
                          className="p-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Correct TrxID"
                          value={newTrxId}
                          onChange={(e) => setNewTrxId(e.target.value)}
                          className="p-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono uppercase"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingPayment(false)}
                          className="px-3 py-1 rounded-lg text-slate-400 text-xs hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                        >
                          Save Correction
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Order Items Summary */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Items in this Order
                </span>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-900/50 overflow-hidden">
                  {currentOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{it.productName}</span>
                        <span className="text-[11px] text-slate-400">Qty: {it.quantity} • {it.category}</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300">
                        ৳{(it.priceBDT * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="p-3.5 bg-slate-950/80 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Total BDT Paid:</span>
                    <span className="text-sm font-mono text-white">৳{currentOrder.totalAmountBDT.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Help & Direct WhatsApp Support */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Sairah%20Labs,%20inquiry%20regarding%20Order%20${encodeURIComponent(currentOrder.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask Admin on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : searchAttempted && !isSearching ? (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs">No order record matched &quot;{searchInput}&quot;.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Please double check the Order ID format (e.g. SL-ORD-...) or reach out to WhatsApp support.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
