import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getDatabase,
  Database,
  ref,
  onValue,
  get,
  set,
  push,
  remove,
  update,
} from 'firebase/database';
import type { Product, Inquiry, Order, SiteSettings, Testimonial, PortfolioItem } from '../types';

// Single Firebase project — chat-2-me-c3213 (Realtime Database + Auth).
// Old Firestore project is fully removed.
const firebaseConfig = {
  apiKey: 'AIzaSyCwpylnjqWQLBpgoiStlrE01o95aKP3JSY',
  authDomain: 'chat-2-me-c3213.firebaseapp.com',
  databaseURL: 'https://chat-2-me-c3213-default-rtdb.firebaseio.com',
  projectId: 'chat-2-me-c3213',
  storageBucket: 'chat-2-me-c3213.firebasestorage.app',
  messagingSenderId: '302872350523',
  appId: '1:302872350523:web:e2c911cecc259fc532311e',
  measurementId: 'G-PVR3XPQVMS',
};

const existing = getApps().find((a: FirebaseApp) => a.name === 'secondary');
const app: FirebaseApp = existing ?? initializeApp(firebaseConfig, 'secondary');

export const rtdb: Database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ---- Refs ----
export const rtdbProductsRef = () => ref(rtdb, 'products');
export const rtdbProductRef = (id: string) => ref(rtdb, `products/${id}`);
export const rtdbSettingsRef = () => ref(rtdb, 'settings/main');
export const rtdbInquiriesRef = () => ref(rtdb, 'inquiries');
export const rtdbOrdersRef = () => ref(rtdb, 'orders');
export const rtdbOrderRef = (id: string) => ref(rtdb, `orders/${id}`);
export const rtdbTestimonialsRef = () => ref(rtdb, 'testimonials');
export const rtdbPortfolioRef = () => ref(rtdb, 'portfolio');

// ---- Converters ----
export const snapToProducts = (val: unknown): Product[] => {
  if (!val || typeof val !== 'object') return [];
  const list = Object.entries(val as Record<string, Product>).map(([id, p]) => ({ ...p, id }));
  return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const snapToOrders = (val: unknown): Order[] => {
  if (!val || typeof val !== 'object') return [];
  const list = Object.entries(val as Record<string, Order>).map(([id, o]) => ({ ...o, id }));
  return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const snapToInquiries = (val: unknown): Inquiry[] => {
  if (!val || typeof val !== 'object') return [];
  const list = Object.entries(val as Record<string, Inquiry>).map(([id, q]) => ({ ...q, id }));
  return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const snapToTestimonials = (val: unknown): Testimonial[] => {
  if (!val || typeof val !== 'object') return [];
  return Object.entries(val as Record<string, Testimonial>).map(([id, t]) => ({ ...t, id }));
};

export const snapToPortfolio = (val: unknown): PortfolioItem[] => {
  if (!val || typeof val !== 'object') return [];
  return Object.entries(val as Record<string, PortfolioItem>).map(([id, p]) => ({ ...p, id }));
};

// ---- Products ----
export const saveProductRTDB = (product: Product) =>
  set(rtdbProductRef(product.id), { ...product, updatedAt: new Date().toISOString() });

export const deleteProductRTDB = (id: string) => remove(rtdbProductRef(id));

// ---- Orders ----
export const saveOrderRTDB = (order: Order) => set(rtdbOrderRef(order.id), order);

export const updateOrderRTDB = (id: string, updates: Partial<Order>) =>
  update(rtdbOrderRef(id), { ...updates, updatedAt: new Date().toISOString() });

export const getOrderRTDB = async (id: string): Promise<Order | null> => {
  const snap = await get(rtdbOrderRef(id));
  return snap.exists() ? ({ ...(snap.val() as Order), id: snap.key as string }) : null;
};

export const deleteOrderRTDB = (id: string) => remove(rtdbOrderRef(id));

// ---- Inquiries ----
export const pushInquiryRTDB = (inquiry: Inquiry) => push(rtdbInquiriesRef(), inquiry);

export const updateInquiryRTDB = (id: string, updates: Partial<Inquiry>) =>
  update(ref(rtdb, `inquiries/${id}`), updates);

export const deleteInquiryRTDB = (id: string) => remove(ref(rtdb, `inquiries/${id}`));

// ---- Settings ----
export const saveSettingsRTDB = (settings: Partial<SiteSettings>) =>
  update(rtdbSettingsRef(), { ...settings, updatedAt: new Date().toISOString() });

// ---- Content (testimonials + portfolio) ----
export const saveTestimonialRTDB = (t: Testimonial) => set(ref(rtdb, `testimonials/${t.id}`), t);
export const deleteTestimonialRTDB = (id: string) => remove(ref(rtdb, `testimonials/${id}`));
export const savePortfolioRTDB = (p: PortfolioItem) => set(ref(rtdb, `portfolio/${p.id}`), p);
export const deletePortfolioRTDB = (id: string) => remove(ref(rtdb, `portfolio/${id}`));

export { onValue };
