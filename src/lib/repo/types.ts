export type FulfillmentStage = 'new' | 'packing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface AdminOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  priceKobo: number;
  quantity: number;
  imageUrl?: string;
}

export interface DeliveryTrackingEvent {
  id: string;
  status: 'ordered' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  totalKobo: number;
  subtotalKobo: number;
  deliveryFeeKobo: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStage;
  carrier?: string;
  trackingNumber?: string;
  trackingLink?: string;
  timeline: DeliveryTrackingEvent[];
  items: AdminOrderItem[];
  notes?: string[];
  createdAt: string;
  isDelayed?: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  sku: string;
  stockQuantity: number;
  priceKobo?: number;
}

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'tees' | 'caps' | 'hoodies-polos' | 'trousers' | 'tracksuits' | 'shirts';
  priceKobo: number;
  compareAtPriceKobo?: number | null;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  tags: string[];
  variants: ProductVariant[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpentKobo: number;
  segment: 'new' | 'repeat' | 'vip' | 'at_risk' | 'never_ordered';
  notes?: string;
  tags: string[];
  lastOrderDate?: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'shipping' | 'marketing' | 'support' | 'retention';
}

export interface FollowUpRule {
  id: string;
  title: string;
  description: string;
  triggerDays: number;
  isEnabled: boolean;
  templateId: string;
}

export interface DueFollowUp {
  id: string;
  ruleId: string;
  ruleTitle: string;
  customerName: string;
  customerEmail: string;
  orderNumber?: string;
  dueDate: string;
  previewMessage: string;
}

export interface KpiMetric {
  title: string;
  value: string;
  numericValue: number;
  deltaPercent: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

export interface SalesDataPoint {
  date: string;
  label: string;
  revenueKobo: number;
  ordersCount: number;
  isHighlight?: boolean;
}
