import { generateSeedData } from './seed';
import type {
  AdminOrder,
  AdminProduct,
  AdminCustomer,
  EmailTemplate,
  FollowUpRule,
  DueFollowUp,
  KpiMetric,
  SalesDataPoint,
  FulfillmentStage,
  PaymentStatus,
} from './types';

const STORAGE_KEY = 'deendrip_admin_store_v2';

interface StoreState {
  products: AdminProduct[];
  customers: AdminCustomer[];
  orders: AdminOrder[];
  salesHistory: SalesDataPoint[];
  emailTemplates: EmailTemplate[];
  followUpRules: FollowUpRule[];
  dueFollowUps: DueFollowUp[];
  sentEmails: Array<{ id: string; recipient: string; subject: string; body: string; sentAt: string }>;
}

let memoryStore: StoreState | null = null;

function getStore(): StoreState {
  if (memoryStore) return memoryStore;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        memoryStore = JSON.parse(stored);
        return memoryStore!;
      }
    } catch {
      // Fallback to fresh seed
    }
  }

  const seed = generateSeedData();
  memoryStore = { ...seed, sentEmails: [] };
  saveStore(memoryStore);
  return memoryStore;
}

function saveStore(state: StoreState) {
  memoryStore = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable
    }
  }
}

// Small artificial delay to ensure realistic UI skeleton transitions
const delay = (ms = 120) => new Promise(res => setTimeout(res, ms));

export async function getDashboardMetrics(dateRange: 'today' | '7d' | '30d' | '12m' = '30d'): Promise<{
  heroRevenueKobo: number;
  kpis: KpiMetric[];
  salesChart: SalesDataPoint[];
  pipeline: Record<FulfillmentStage, number>;
  recentOrders: AdminOrder[];
  needsAttention: Array<{ id: string; type: 'stock' | 'delay' | 'followup'; title: string; subtitle: string; actionText: string; linkTab: string }>;
}> {
  await delay();
  const store = getStore();

  const paidOrders = store.orders.filter(o => o.paymentStatus === 'paid');
  const heroRevenueKobo = paidOrders.reduce((sum, o) => sum + o.totalKobo, 0);

  const kpis: KpiMetric[] = [
    {
      title: 'Net Revenue',
      value: `₦${(heroRevenueKobo / 100).toLocaleString('en-NG')}`,
      numericValue: heroRevenueKobo,
      deltaPercent: 14.2,
      trend: 'up',
      description: 'vs previous period',
    },
    {
      title: 'Paid Orders',
      value: paidOrders.length.toString(),
      numericValue: paidOrders.length,
      deltaPercent: 8.5,
      trend: 'up',
      description: 'across all channels',
    },
    {
      title: 'Average Order Value',
      value: `₦${(Math.round(heroRevenueKobo / (paidOrders.length || 1)) / 100).toLocaleString('en-NG')}`,
      numericValue: Math.round(heroRevenueKobo / (paidOrders.length || 1)),
      deltaPercent: 3.1,
      trend: 'up',
      description: 'basket size up ₦2,400',
    },
    {
      title: 'Store Conversion Rate',
      value: '3.68%',
      numericValue: 3.68,
      deltaPercent: 0.4,
      trend: 'up',
      description: 'traffic to checkout',
    },
  ];

  const pipeline: Record<FulfillmentStage, number> = {
    new: store.orders.filter(o => o.fulfillmentStatus === 'new').length,
    packing: store.orders.filter(o => o.fulfillmentStatus === 'packing').length,
    shipped: store.orders.filter(o => o.fulfillmentStatus === 'shipped').length,
    delivered: store.orders.filter(o => o.fulfillmentStatus === 'delivered').length,
    cancelled: store.orders.filter(o => o.fulfillmentStatus === 'cancelled').length,
  };

  const recentOrders = store.orders.slice(0, 5);

  // Needs Attention items (max 4: low stock, late deliveries, unanswered customers)
  const needsAttention: Array<{ id: string; type: 'stock' | 'delay' | 'followup'; title: string; subtitle: string; actionText: string; linkTab: string }> = [];

  const outStockProd = store.products.find(p => p.stock === 0);
  if (outStockProd) {
    needsAttention.push({
      id: `na_stock_${outStockProd.id}`,
      type: 'stock',
      title: `${outStockProd.title} is Out of Stock`,
      subtitle: '0 units remaining across all sizes. Restock required.',
      actionText: 'Restock',
      linkTab: 'products',
    });
  }

  const delayedOrder = store.orders.find(o => o.isDelayed && o.fulfillmentStatus === 'shipped');
  if (delayedOrder) {
    needsAttention.push({
      id: `na_delay_${delayedOrder.id}`,
      type: 'delay',
      title: `Order #${delayedOrder.orderNumber} in transit >3 days`,
      subtitle: `${delayedOrder.customerName} · ${delayedOrder.carrier || 'Courier'} dispatch`,
      actionText: 'Track Order',
      linkTab: 'orders',
    });
  }

  const dueFollowUp = store.dueFollowUps[0];
  if (dueFollowUp) {
    needsAttention.push({
      id: `na_followup_${dueFollowUp.id}`,
      type: 'followup',
      title: `Review request due for ${dueFollowUp.customerName}`,
      subtitle: dueFollowUp.ruleTitle,
      actionText: 'Review & Send',
      linkTab: 'email',
    });
  }

  const lowStockProd = store.products.find(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
  if (lowStockProd && needsAttention.length < 4) {
    needsAttention.push({
      id: `na_low_${lowStockProd.id}`,
      type: 'stock',
      title: `${lowStockProd.title} has ${lowStockProd.stock} units left`,
      subtitle: 'Approaching critical stock threshold.',
      actionText: 'Adjust Stock',
      linkTab: 'products',
    });
  }

  return {
    heroRevenueKobo,
    kpis,
    salesChart: store.salesHistory,
    pipeline,
    recentOrders,
    needsAttention,
  };
}

export async function getOrders(options?: {
  searchQuery?: string;
  status?: FulfillmentStage | 'all';
  paymentStatus?: PaymentStatus | 'all';
  limit?: number;
  offset?: number;
}): Promise<{ orders: AdminOrder[]; totalCount: number }> {
  await delay();
  const store = getStore();
  let list = [...store.orders];

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    list = list.filter(o =>
      o.orderNumber.includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );
  }

  if (options?.status && options.status !== 'all') {
    list = list.filter(o => o.fulfillmentStatus === options.status);
  }

  if (options?.paymentStatus && options.paymentStatus !== 'all') {
    list = list.filter(o => o.paymentStatus === options.paymentStatus);
  }

  const totalCount = list.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 20;

  return {
    orders: list.slice(offset, offset + limit),
    totalCount,
  };
}

export async function getOrderById(id: string): Promise<AdminOrder | null> {
  await delay(80);
  const store = getStore();
  return store.orders.find(o => o.id === id || o.orderNumber === id) || null;
}

export async function updateOrder(id: string, updates: Partial<AdminOrder>): Promise<AdminOrder> {
  await delay(150);
  const store = getStore();
  const index = store.orders.findIndex(o => o.id === id || o.orderNumber === id);
  if (index === -1) throw new Error('Order not found');

  const existing = store.orders[index];
  const updated: AdminOrder = { ...existing, ...updates };

  // If status changed, push to timeline
  if (updates.fulfillmentStatus && updates.fulfillmentStatus !== existing.fulfillmentStatus) {
    const now = new Date().toISOString();
    const statusMap: Record<FulfillmentStage, string> = {
      new: 'Order Placed & Verified',
      packing: 'Items Packed & Inspected',
      shipped: `Handed over to ${updates.carrier || existing.carrier || 'Courier'}`,
      delivered: 'Package Delivered to Recipient',
      cancelled: 'Order Cancelled',
    };
    updated.timeline = [
      ...existing.timeline,
      {
        id: `t_${Date.now()}`,
        status: updates.fulfillmentStatus as any,
        title: statusMap[updates.fulfillmentStatus] || 'Status Updated',
        description: updates.trackingNumber ? `Waybill: ${updates.trackingNumber}` : 'Status manually advanced in admin.',
        timestamp: now,
      },
    ];
  }

  store.orders[index] = updated;
  saveStore(store);
  return updated;
}

export async function simulateNextDeliveryStep(orderId: string): Promise<AdminOrder> {
  await delay(150);
  const store = getStore();
  const index = store.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
  if (index === -1) throw new Error('Order not found');

  const order = store.orders[index];
  const stepProgression: Record<FulfillmentStage, FulfillmentStage> = {
    new: 'packing',
    packing: 'shipped',
    shipped: 'delivered',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };

  const nextStage = stepProgression[order.fulfillmentStatus];
  const trackingNumber = order.trackingNumber || `GIG-NG-${Math.floor(100000 + Math.random() * 900000)}`;
  const carrier = order.carrier || 'GIG Logistics';

  return updateOrder(orderId, {
    fulfillmentStatus: nextStage,
    carrier,
    trackingNumber,
    trackingLink: `https://track.deendrip.shop/${trackingNumber}`,
  });
}

export async function getProducts(options?: {
  searchQuery?: string;
  category?: string;
  status?: string;
}): Promise<AdminProduct[]> {
  await delay();
  const store = getStore();
  let list = [...store.products];

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.includes(q));
  }
  if (options?.category && options.category !== 'all') {
    list = list.filter(p => p.category === options.category);
  }
  if (options?.status && options.status !== 'all') {
    list = list.filter(p => p.status === options.status);
  }

  return list;
}

export async function updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
  await delay(120);
  const store = getStore();
  const index = store.products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');

  const existing = store.products[index];
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  store.products[index] = updated;
  saveStore(store);
  return updated;
}

export async function addProduct(productData: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminProduct> {
  await delay(150);
  const store = getStore();
  const newProduct: AdminProduct = {
    ...productData,
    id: `prod_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.products.unshift(newProduct);
  saveStore(store);
  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await delay(100);
  const store = getStore();
  const index = store.products.findIndex(p => p.id === id);
  if (index === -1) return false;
  store.products.splice(index, 1);
  saveStore(store);
  return true;
}

export async function getCustomers(options?: {
  searchQuery?: string;
  segment?: string;
}): Promise<AdminCustomer[]> {
  await delay();
  const store = getStore();
  let list = [...store.customers];

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
  }
  if (options?.segment && options.segment !== 'all') {
    list = list.filter(c => c.segment === options.segment);
  }
  return list;
}

export async function getCustomerById(id: string): Promise<{ customer: AdminCustomer; orders: AdminOrder[] } | null> {
  await delay(100);
  const store = getStore();
  const customer = store.customers.find(c => c.id === id);
  if (!customer) return null;
  const customerOrders = store.orders.filter(o => o.customerEmail.toLowerCase() === customer.email.toLowerCase());
  return { customer, orders: customerOrders };
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  await delay(50);
  return getStore().emailTemplates;
}

export async function getFollowUpRules(): Promise<FollowUpRule[]> {
  await delay(50);
  return getStore().followUpRules;
}

export async function toggleFollowUpRule(ruleId: string): Promise<FollowUpRule> {
  await delay(80);
  const store = getStore();
  const rule = store.followUpRules.find(r => r.id === ruleId);
  if (!rule) throw new Error('Rule not found');
  rule.isEnabled = !rule.isEnabled;
  saveStore(store);
  return rule;
}

export async function getDueFollowUps(): Promise<DueFollowUp[]> {
  await delay(50);
  return getStore().dueFollowUps;
}

export async function dismissDueFollowUp(id: string): Promise<void> {
  await delay(80);
  const store = getStore();
  store.dueFollowUps = store.dueFollowUps.filter(f => f.id !== id);
  saveStore(store);
}

export async function sendEmailDraft(payload: {
  to: string;
  subject: string;
  body: string;
  scheduledAt?: string;
}): Promise<{ success: boolean; id: string; sentAt: string }> {
  await delay(250);
  const store = getStore();
  const entry = {
    id: `sent_${Date.now()}`,
    recipient: payload.to,
    subject: payload.subject,
    body: payload.body,
    sentAt: new Date().toISOString(),
  };
  store.sentEmails.unshift(entry);
  saveStore(store);
  return { success: true, id: entry.id, sentAt: entry.sentAt };
}

export async function generateAiDraft(params: {
  goal: 'shipping_update' | 'thank_you' | 'review_request' | 'win_back' | 'delay_apology';
  customerName: string;
  orderNumber?: string;
  productName?: string;
}): Promise<{ subject: string; body: string }> {
  await delay(350);
  const fName = params.customerName.split(' ')[0] || 'valued customer';
  const orderRef = params.orderNumber || '10482';
  const item = params.productName || 'Deen Drip Classic Arch Tee';

  switch (params.goal) {
    case 'shipping_update':
      return {
        subject: `🚀 Great news, ${fName}! Order #${orderRef} has shipped`,
        body: `Salam ${fName},\n\nWe wanted to let you know your order #${orderRef} featuring the ${item} is in transit with the courier.\n\nYou can track the exact vehicle progress here: https://track.deendrip.shop/GIG-NG-${orderRef}\n\nThank you for rocking Deen Drip.\n\nWarm regards,\nThe Deen Drip Team`,
      };
    case 'thank_you':
      return {
        subject: `Salam ${fName} — Thank you for supporting Deen Drip`,
        body: `Salam ${fName},\n\nThank you for choosing Deen Drip. Your support means the world to our small creative house in Lagos.\n\nEvery piece is crafted with intention and premium 300GSM heavyweight organic cotton. We hope it brings you confidence and comfort.\n\nWith gratitude,\nDeen Drip Lagos`,
      };
    case 'review_request':
      return {
        subject: `How is the fit of your new ${item}, ${fName}?`,
        body: `Salam ${fName},\n\nIt’s been a few days since your ${item} arrived. How is the silhouette and drape treating you?\n\nCould you take 30 seconds to reply with your thoughts? To show our appreciation, here is a 10% discount code for your next piece: SABR10\n\nStay blessed,\nDeen Drip`,
      };
    case 'win_back':
      return {
        subject: `Salam ${fName} — New drops designed with intention`,
        body: `Salam ${fName},\n\nWe noticed you haven’t dropped by Deen Drip in a while. We’ve just unveiled fresh architectural silhouettes for the season.\n\nHere is an exclusive 15% VIP welcome-back code just for you: WELCOMEBACK15\n\nExplore what’s new: https://deendrip.shop\n\nWarmly,\nDeen Drip`,
      };
    case 'delay_apology':
      return {
        subject: `Proactive update on your order #${orderRef}`,
        body: `Salam ${fName},\n\nWe noticed your parcel #${orderRef} has encountered a slight transit delay with the logistics carrier in Lagos.\n\nOur dispatch manager has escalated this directly with the hub to ensure priority delivery tomorrow. We sincerely apologize for the extra wait.\n\nIf you have any questions, reply directly to this email.\n\nBest regards,\nDeen Drip Logistics`,
      };
  }
}

export function resetStore(): void {
  const seed = generateSeedData();
  memoryStore = { ...seed, sentEmails: [] };
  saveStore(memoryStore);
}
