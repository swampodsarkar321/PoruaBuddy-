import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  CreditCard,
  Phone,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  Lock
} from 'lucide-react';
import { OrderItem } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotalBDT,
    createOrder,
    user,
    siteSettings,
    showToast,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  if (!isCheckoutOpen || cart.length === 0) return null;

  const activeNumber = paymentMethod === 'bKash' ? siteSettings.bkashNumber : siteSettings.nagadNumber;

  const copyToClipboard = (text: string) => {
    const rawNumber = text.split(' ')[0];
    navigator.clipboard.writeText(rawNumber);
    setCopiedNumber(true);
    showToast(`Copied ${rawNumber} to clipboard!`, 'info');
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Please provide your name', 'error');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      showToast('Please provide a valid email address for delivery updates', 'error');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      showToast('Please provide your active WhatsApp / phone number', 'error');
      return;
    }
    if (!senderPhone.trim() || senderPhone.length < 10) {
      showToast(`Please enter the ${paymentMethod} sender number you paid from`, 'error');
      return;
    }
    if (!transactionId.trim() || transactionId.length < 6) {
      showToast(`Please enter your valid ${paymentMethod} Transaction ID (TrxID)`, 'error');
      return;
    }

    setIsSubmitting(true);

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      priceBDT: item.product.discountPriceBDT || item.product.priceBDT,
      quantity: item.quantity,
      deliveryType: item.product.deliveryType,
      category: item.product.category,
    }));

    try {
      await createOrder({
        userId: user ? user.uid : 'guest',
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        items: orderItems,
        totalAmountBDT: cartTotalBDT,
        paymentMethod,
        transactionId: transactionId.trim().toUpperCase(),
        senderPhone: senderPhone.trim(),
        notes: notes.trim(),
      });
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error('Checkout submission error:', err);
      showToast('Failed to complete checkout. Please try again or message on WhatsApp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl my-8 bg-[#090d16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Manual Verification Checkout
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-800">
                bKash / Nagad
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              Finalize Your Digital Order
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Order Summary Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Total Due Amount</span>
              <span className="text-2xl font-black text-cyan-300 font-mono">
                ৳{cartTotalBDT.toLocaleString()} BDT
              </span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span className="font-semibold text-white block">{cart.length} Products in Order</span>
              <span>Protected Digital Delivery</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5 font-mono">
              1. Choose Manual Payment Gateway
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('bKash')}
                className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                  paymentMethod === 'bKash'
                    ? 'bg-pink-950/30 border-pink-500 shadow-md shadow-pink-500/10 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-600 flex items-center justify-center font-bold text-white text-sm">
                    bK
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm block">bKash</span>
                    <span className="text-[11px] text-pink-300">Personal / Send Money</span>
                  </div>
                </div>
                {paymentMethod === 'bKash' && <CheckCircle className="w-5 h-5 text-pink-400" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Nagad')}
                className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                  paymentMethod === 'Nagad'
                    ? 'bg-orange-950/30 border-orange-500 shadow-md shadow-orange-500/10 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white text-sm">
                    নগদ
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm block">Nagad</span>
                    <span className="text-[11px] text-orange-300">Personal / Send Money</span>
                  </div>
                </div>
                {paymentMethod === 'Nagad' && <CheckCircle className="w-5 h-5 text-orange-400" />}
              </button>
            </div>
          </div>

          {/* Payment Instructions Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">
                {paymentMethod} Payment Account:
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(activeNumber)}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 transition"
              >
                {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNumber ? 'Copied Number!' : 'Copy Number'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono font-bold text-base text-white">
              <span>{activeNumber}</span>
              <span className="text-xs text-emerald-400 font-sans">Active</span>
            </div>

            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Open your <strong>{paymentMethod}</strong> app and select <strong>Send Money</strong>.</li>
              <li>Send exactly <strong>৳{cartTotalBDT.toLocaleString()} BDT</strong> to the number above.</li>
              <li>After sending, copy the <strong>Transaction ID (TrxID)</strong> from the confirmation SMS/App.</li>
            </ol>
          </div>

          {/* Payment Verification Input Fields */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5 font-mono">
              2. Transaction Proof &amp; Verification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Sender {paymentMethod} Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="018XXXXXXXX"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Transaction ID (TrxID) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9J47KLP3Q"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5 font-mono">
              3. Delivery &amp; Contact Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Email (for Delivery Updates) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  WhatsApp / Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Order Notes / In-Game ID / Specific Requests (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. For Free Fire top-up enter Player ID, or for PC optimization list your GPU/CPU model..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Verification Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Security Protocol:</strong> Your order will initially be placed in{' '}
              <span className="text-yellow-400 font-semibold font-mono">Payment Under Review</span>.
              Protected digital downloads and license keys become available in your order dashboard immediately after our admin
              confirms receipt of funds with bKash/Nagad. No fake instant successes.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Verifying and Submitting Order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Submit Order with {paymentMethod} (৳{cartTotalBDT.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
