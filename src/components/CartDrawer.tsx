import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { waLink, cartOrderMessage } from '../utils/whatsapp';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotalBDT,
    setActiveTab,
    siteSettings,
    t,
  } = useApp();

  if (!isCartOpen) return null;

  const orderMsg = cartOrderMessage(
    cart.map((item) => ({
      name: item.product.name,
      qty: item.quantity,
      price: item.product.discountPriceBDT || item.product.priceBDT,
    })),
    cartTotalBDT
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-stone-800">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h3 className="font-bold text-lg text-stone-900">{t('cart.title')}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-stone-900 mb-1">{t('cart.empty')}</h4>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Explore templates, PC optimization and website packages.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveTab('products');
                  }}
                  className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 transition"
                >
                  {t('cart.browse')}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.product.discountPriceBDT || item.product.priceBDT;
                return (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex gap-3.5 items-center hover:border-stone-300 transition"
                  >
                    <span className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-lg font-extrabold shrink-0 overflow-hidden">
                      {item.product.imageUrls?.[0] ? (
                        <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        item.product.name.charAt(0).toUpperCase()
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider truncate">
                          {item.product.categoryLabel}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-300 hover:text-rose-500 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-[13px] font-bold text-stone-900 truncate mb-1">
                        {item.product.name}
                      </h4>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-1 py-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[13px] font-extrabold text-stone-900">
                          ৳{(itemPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-100 bg-stone-50/60 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-900 font-semibold">৳{cartTotalBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Gateway fee</span>
                  <span className="text-emerald-700 font-semibold">Confirmed on WhatsApp</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-sm font-bold text-stone-900">
                  <span>{t('cart.total')}</span>
                  <span className="text-xl font-extrabold">
                    ৳{cartTotalBDT.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={clearCart}
                  className="px-3.5 py-3 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-500 hover:border-rose-200 transition"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <a
                  href={waLink(siteSettings.whatsappNumber, orderMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25d366] hover:bg-[#1eb85a] text-white font-bold text-[13px] flex items-center justify-center gap-2 active:scale-[0.99] transition"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>{t('cart.order')}</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Product details auto-filled — just press send</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
