import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType
} from '../firebase/config';
import {
  Product,
  Order,
  Inquiry,
  SiteSettings,
  CartItem,
  ProductCategory,
  OrderStatus
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS } from '../data/initialProducts';

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;

  // Modals & Panels
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderTrackerOpen: boolean;
  setIsOrderTrackerOpen: (open: boolean) => void;
  trackingOrderId: string;
  setTrackingOrderId: (id: string) => void;
  isPoliciesOpen: boolean;
  setIsPoliciesOpen: (open: boolean) => void;
  policyTopic: string;
  setPolicyTopic: (topic: string) => void;
  isDevDocsOpen: boolean;
  setIsDevDocsOpen: (open: boolean) => void;
  orderSuccess: Order | null;
  setOrderSuccess: (order: Order | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalBDT: number;
  cartCount: number;

  // Auth & Admin
  user: FirebaseUser | null;
  isAdmin: boolean;
  demoAdminMode: boolean;
  setDemoAdminMode: (enabled: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  saveProduct: (product: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  resetToInitialProducts: () => Promise<void>;

  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, deliveryNotes?: string, licenseKeys?: string[], downloadLinks?: string[]) => Promise<void>;
  updateOrderPaymentInfo: (orderId: string, transactionId: string, senderPhone: string, paymentMethod: 'bKash' | 'Nagad') => Promise<void>;
  findOrderById: (orderId: string) => Promise<Order | null>;

  // Inquiries
  inquiries: Inquiry[];
  submitInquiry: (data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateInquiryStatus: (id: string, status: 'New' | 'In Discussion' | 'Closed') => Promise<void>;

  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;

  // Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [policyTopic, setPolicyTopic] = useState('all');
  const [isDevDocsOpen, setIsDevDocsOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auth & Admin
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [demoAdminMode, setDemoAdminMode] = useState(false);
  const adminEmail = 'mdswampodsarkar007@gmail.com';
  const isAdmin = demoAdminMode || (user !== null && user.email?.toLowerCase() === adminEmail.toLowerCase());

  // Data states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('srs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('srs_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Test Firestore Connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        showToast(`Welcome back, ${currentUser.displayName || currentUser.email}!`, 'success');
      }
    });
    return () => unsubscribe();
  }, []);

  // Load / Sync Products from Firestore
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const syncProducts = async () => {
      try {
        const prodCol = collection(db, 'products');
        unsubscribe = onSnapshot(
          prodCol,
          (snapshot) => {
            if (!snapshot.empty) {
              const loaded: Product[] = [];
              snapshot.forEach((docSnap) => {
                loaded.push({ ...(docSnap.data() as Product), id: docSnap.id });
              });
              setProducts(loaded);
            } else {
              // Seed initial catalog if completely empty
              setProducts(INITIAL_PRODUCTS);
            }
            setIsLoadingProducts(false);
          },
          (error) => {
            console.warn('Products snapshot offline/error, using initial catalog:', error);
            setProducts(INITIAL_PRODUCTS);
            setIsLoadingProducts(false);
          }
        );
      } catch (err) {
        console.warn('Using offline product catalog:', err);
        setProducts(INITIAL_PRODUCTS);
        setIsLoadingProducts(false);
      }
    };

    syncProducts();
    return () => unsubscribe();
  }, []);

  // Sync Site Settings
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const settingsDoc = doc(db, 'siteSettings', 'main');
      unsubscribe = onSnapshot(settingsDoc, (snap) => {
        if (snap.exists()) {
          setSiteSettings(snap.data() as SiteSettings);
        }
      }, (err) => {
        console.warn('Site settings snapshot error:', err);
      });
    } catch (e) {
      console.warn('Site settings initialization error:', e);
    }
    return () => unsubscribe();
  }, []);

  // Sync Orders for Admin or Authenticated User
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    setIsLoadingOrders(true);

    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => {
            list.push({ ...(d.data() as Order), id: d.id });
          });
          setOrders(list);
          setIsLoadingOrders(false);
        },
        (error) => {
          console.warn('Orders listener notice:', error);
          // Fallback to locally cached guest orders if any
          try {
            const cached = localStorage.getItem('srs_my_orders');
            if (cached) {
              setOrders(JSON.parse(cached));
            }
          } catch {}
          setIsLoadingOrders(false);
        }
      );
    } catch {
      setIsLoadingOrders(false);
    }

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Sync Inquiries for Admin
  useEffect(() => {
    if (!isAdmin) return;
    let unsubscribe: () => void = () => {};
    try {
      const inquiriesCol = collection(db, 'inquiries');
      const q = query(inquiriesCol, orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Inquiry[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Inquiry), id: d.id });
        });
        setInquiries(list);
      }, (err) => {
        console.warn('Inquiries snapshot notice:', err);
      });
    } catch {}
    return () => unsubscribe();
  }, [isAdmin]);

  // Cart Handlers
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        showToast(`Increased quantity for "${product.name}"`, 'info');
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      showToast(`Added "${product.name}" to cart!`, 'success');
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalBDT = cart.reduce((total, item) => {
    const price = item.product.discountPriceBDT || item.product.priceBDT;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Auth Functions
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully!', 'success');
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      showToast('Sign in cancelled or not completed', 'error');
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      showToast('Signed out successfully', 'info');
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  // Orders Management
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'>
  ): Promise<Order> => {
    const orderId = `SL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      paymentStatus: 'Payment Under Review', // Customer submitted transaction info
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'orders', orderId), {
        ...newOrder,
        serverCreated: serverTimestamp(),
      });
      showToast('Order submitted! Admin is reviewing your payment.', 'success');
    } catch (err) {
      console.warn('Could not write to Firestore directly, caching locally:', err);
      showToast('Order saved! Please record your Order ID for reference.', 'success');
    }

    // Save order locally for quick customer tracking
    try {
      const existingMyOrders = JSON.parse(localStorage.getItem('srs_my_orders') || '[]');
      localStorage.setItem('srs_my_orders', JSON.stringify([newOrder, ...existingMyOrders]));
    } catch {}

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setOrderSuccess(newOrder);
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    deliveryNotes?: string,
    licenseKeys?: string[],
    downloadLinks?: string[]
  ) => {
    const updates: Partial<Order> = {
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };
    if (deliveryNotes !== undefined) updates.deliveryNotes = deliveryNotes;
    if (licenseKeys !== undefined) updates.licenseKeys = licenseKeys;
    if (downloadLinks !== undefined) updates.downloadLinks = downloadLinks;

    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
      showToast(`Order status updated to "${status}"`, 'success');
    } catch (err) {
      console.warn('Local update fallback for order:', err);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  const updateOrderPaymentInfo = async (
    orderId: string,
    transactionId: string,
    senderPhone: string,
    paymentMethod: 'bKash' | 'Nagad'
  ) => {
    const updates = {
      transactionId,
      senderPhone,
      paymentMethod,
      paymentStatus: 'Payment Under Review' as OrderStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
      showToast('Payment verification details submitted!', 'success');
    } catch (err) {
      console.warn('Local fallback payment info update:', err);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  const findOrderById = async (orderId: string): Promise<Order | null> => {
    const trimmedId = orderId.trim();
    if (!trimmedId) return null;

    // Check memory first
    const inMem = orders.find((o) => o.id.toLowerCase() === trimmedId.toLowerCase());
    if (inMem) return inMem;

    // Check localStorage
    try {
      const local = JSON.parse(localStorage.getItem('srs_my_orders') || '[]');
      const inLocal = local.find((o: Order) => o.id.toLowerCase() === trimmedId.toLowerCase());
      if (inLocal) return inLocal;
    } catch {}

    // Check Firestore
    try {
      const snap = await getDoc(doc(db, 'orders', trimmedId));
      if (snap.exists()) {
        return { ...(snap.data() as Order), id: snap.id };
      }
    } catch (e) {
      console.warn('Order lookup error:', e);
    }
    return null;
  };

  // Product CRUD
  const saveProduct = async (productData: Partial<Product>) => {
    const id = productData.id || `prod-${Date.now().toString(36)}`;
    const fullProd: Product = {
      id,
      name: productData.name || 'Untitled Product',
      slug: productData.slug || (productData.name ? productData.name.toLowerCase().replace(/\s+/g, '-') : 'untitled'),
      category: productData.category || 'pc-optimization',
      categoryLabel: productData.categoryLabel || 'PC Optimization',
      description: productData.description || '',
      fullDetails: productData.fullDetails || '',
      priceBDT: Number(productData.priceBDT) || 0,
      discountPriceBDT: productData.discountPriceBDT ? Number(productData.discountPriceBDT) : undefined,
      imageUrls: productData.imageUrls && productData.imageUrls.length > 0
        ? productData.imageUrls
        : ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'],
      features: productData.features || [],
      compatibility: productData.compatibility || 'Windows 10 / 11',
      deliveryType: productData.deliveryType || 'instant-download',
      licenseInfo: productData.licenseInfo || 'Standard License',
      version: productData.version || 'v1.0',
      downloadUrl: productData.downloadUrl,
      isPublished: productData.isPublished ?? true,
      badge: productData.badge,
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'products', id), fullProd);
      showToast('Product saved successfully!', 'success');
    } catch (err) {
      console.warn('Saving product locally:', err);
      showToast('Product saved to session', 'info');
    }

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.map((p) => (p.id === id ? fullProd : p));
      }
      return [fullProd, ...prev];
    });
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      showToast('Product deleted', 'info');
    } catch (err) {
      console.warn('Deleting product locally:', err);
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const resetToInitialProducts = async () => {
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      showToast('Catalog initialized to full Sairah Labs standard!', 'success');
    } catch (err) {
      console.warn('Seeding products locally:', err);
      setProducts(INITIAL_PRODUCTS);
      showToast('Catalog restored from local defaults', 'info');
    }
  };

  // Inquiries
  const submitInquiry = async (data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) => {
    const id = `inq-${Date.now().toString(36)}`;
    const newInquiry: Inquiry = {
      ...data,
      id,
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'inquiries', id), newInquiry);
      showToast('Your inquiry has been submitted! We will contact you on WhatsApp/Phone.', 'success');
    } catch (err) {
      console.warn('Inquiry cached locally:', err);
      showToast('Thank you! Your request has been received.', 'success');
    }

    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const updateInquiryStatus = async (id: string, status: 'New' | 'In Discussion' | 'Closed') => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
      showToast('Inquiry status updated', 'info');
    } catch (err) {
      console.warn('Inquiry status updated locally:', err);
    }
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
  };

  // Site Settings
  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    const updated = {
      ...siteSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'siteSettings', 'main'), updated);
      showToast('Site settings updated successfully!', 'success');
    } catch (err) {
      console.warn('Updated site settings locally:', err);
      showToast('Settings saved to session', 'info');
    }
    setSiteSettings(updated);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderTrackerOpen,
        setIsOrderTrackerOpen,
        trackingOrderId,
        setTrackingOrderId,
        isPoliciesOpen,
        setIsPoliciesOpen,
        policyTopic,
        setPolicyTopic,
        isDevDocsOpen,
        setIsDevDocsOpen,
        orderSuccess,
        setOrderSuccess,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalBDT,
        cartCount,
        user,
        isAdmin,
        demoAdminMode,
        setDemoAdminMode,
        signInWithGoogle,
        logout,
        products,
        isLoadingProducts,
        saveProduct,
        deleteProduct,
        resetToInitialProducts,
        orders,
        isLoadingOrders,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentInfo,
        findOrderById,
        inquiries,
        submitInquiry,
        updateInquiryStatus,
        siteSettings,
        updateSiteSettings,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
