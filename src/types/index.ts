export type ProductCategory =
  | 'pc-optimization'
  | 'gaming-tools'
  | 'windows-panels'
  | 'websites'
  | 'gaming-services';

export type DeliveryType =
  | 'instant-download'
  | 'license-key'
  | 'service-booking'
  | 'custom-delivery';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  categoryLabel: string;
  description: string;
  fullDetails?: string;
  priceBDT: number;
  discountPriceBDT?: number;
  imageUrls: string[];
  features: string[];
  compatibility: string;
  deliveryType: DeliveryType;
  licenseInfo: string;
  version: string;
  downloadUrl?: string;
  isPublished: boolean;
  badge?: string;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Awaiting Payment'
  | 'Payment Under Review'
  | 'Paid'
  | 'In Progress'
  | 'Ready for Delivery'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  priceBDT: number;
  quantity: number;
  deliveryType: DeliveryType;
  category: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmountBDT: number;
  paymentMethod: 'bKash' | 'Nagad';
  transactionId: string;
  senderPhone: string;
  paymentStatus: OrderStatus;
  deliveryNotes?: string;
  licenseKeys?: string[];
  downloadLinks?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  budget?: string;
  status: 'New' | 'In Discussion' | 'Closed';
  createdAt: string;
}

export interface SiteSettings {
  bkashNumber: string;
  nagadNumber: string;
  whatsappNumber: string;
  paymentInstructions: string;
  heroNotice?: string;
  updatedAt?: string;
}

export interface WebDevServiceItem {
  id: string;
  title: string;
  description: string;
  startingPriceBDT: number;
  features: string[];
  deliveryTimeDays: number;
  includesSourceCode: boolean;
  includesDeployment: boolean;
  includesDomainSetup: boolean;
  revisions: number;
  badge?: string;
}
