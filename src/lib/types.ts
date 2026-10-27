export type Category = 'tees' | 'caps' | 'hoodies-polos' | 'trousers' | 'tracksuits' | 'shirts';

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  isAlternate: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'ONE SIZE'
  color?: string;
  stockQuantity: number;
  sku: string;
  priceOverrideKobo?: number | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  priceKobo: number; // Integer in kobo (100 kobo = ₦1)
  salePriceKobo?: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNewDrop: boolean;
  details?: {
    material?: string;
    fit?: string;
    weight?: string;
    care?: string[];
    features?: string[];
  };
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  size: string;
  color?: string;
  priceKobo: number;
  quantity: number;
  imageUrl: string;
  maxStock: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  unitPriceKoboSnapshot: number;
  quantity: number;
  subtotalKobo: number;
}

export interface Order {
  id: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryFeeKobo: number;
  subtotalKobo: number;
  totalKobo: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentReference?: string | null;
  trackingReference?: string | null;
  internalNotes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items?: OrderItem[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'manager';
}
