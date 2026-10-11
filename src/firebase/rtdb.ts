import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  Database,
  ref,
  onValue,
  set,
  push,
  remove,
  update,
} from 'firebase/database';
import type { Product, Inquiry, SiteSettings } from '../types';

// Second Firebase project (Realtime Database) — chat-2-me-c3213
const secondaryConfig = {
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
const app2: FirebaseApp = existing ?? initializeApp(secondaryConfig, 'secondary');

export const rtdb: Database = getDatabase(app2);

export const rtdbProductsRef = () => ref(rtdb, 'products');
export const rtdbProductRef = (id: string) => ref(rtdb, `products/${id}`);
export const rtdbSettingsRef = () => ref(rtdb, 'settings/main');
export const rtdbInquiriesRef = () => ref(rtdb, 'inquiries');

export const snapToProducts = (val: unknown): Product[] => {
  if (!val || typeof val !== 'object') return [];
  return Object.entries(val as Record<string, Product>).map(([id, p]) => ({ ...p, id }));
};

export const saveProductRTDB = (product: Product) =>
  set(rtdbProductRef(product.id), { ...product, updatedAt: new Date().toISOString() });

export const deleteProductRTDB = (id: string) => remove(rtdbProductRef(id));

export const saveSettingsRTDB = (settings: Partial<SiteSettings>) =>
  update(rtdbSettingsRef(), { ...settings, updatedAt: new Date().toISOString() });

export const pushInquiryRTDB = (inquiry: Inquiry) => push(rtdbInquiriesRef(), inquiry);

export const deleteInquiryRTDB = (id: string) => remove(ref(rtdb, `inquiries/${id}`));

export { onValue };
