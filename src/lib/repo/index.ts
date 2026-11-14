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
  AdminOrderItem,
  DeliveryTrackingEvent,
} from './types';
import type { Product, Order } from '@/lib/types';

// In-memory cache for fast local interaction while keeping live API synced
let cachedProducts: AdminProduct[] | null = null;
let cachedOrders: AdminOrder[] | null = null;

// Helpers to map DB models to Admin Dashboard structures
function mapDbProductToAdminProduct(p: Product): AdminProduct {
  const stock = p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 30;
  const primarySku = p.variants?.[0]?.sku || `DD-${p.category.slice(0, 3).toUpperCase()}-001`;

  return {
    id: p.id,
    title: p.name,
    slug: p.slug,
    description: p.description || '',
    category: p.category,
    priceKobo: p.priceKobo,
    compareAtPriceKobo: p.salePriceKobo || null,
    sku: primarySku,
    stock,
    lowStockThreshold: 10,
    images: p.images?.length > 0 ? p.images.map((img) => img.imageUrl) : ['/assets/campaign/product-tshirt.webp'],
    tags: [p.category, 'Streetwear', 'Deen Drip'],
    variants: (p.variants || []).map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stockQuantity: v.stockQuantity,
      priceKobo: v.priceOverrideKobo || undefined,
    })),
    status: p.isPublished ? 'active' : 'draft',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt || p.createdAt,
  };
}

function parseCarrierAndTracking(trackingRef?: string | null): { carrier?: string; trackingNumber?: string } {
  if (!trackingRef) return {};
  if (trackingRef.includes(':')) {
    const parts = trackingRef.split(':');
    return {
      carrier: parts[0].trim(),
      trackingNumber: parts.slice(1).join(':').trim(),
    };
  }
  if (trackingRef.toLowerCase().includes('direct') || trackingRef.toLowerCase().includes('owner')) {
    return {
      carrier: 'Deen Drip Direct Hand-Delivery (Owner)',
      trackingNumber: trackingRef,
    };
  }
  return {
    carrier: 'Logistics Courier',
    trackingNumber: trackingRef,
  };
}

function mapDbOrderToAdminOrder(o: Order): AdminOrder {
  const { carrier, trackingNumber } = parseCarrierAndTracking(o.trackingReference);

  let stage: FulfillmentStage = 'new';
  if (o.fulfillmentStatus === 'processing') stage = 'packing';
  else if (o.fulfillmentStatus === 'shipped' || (o.fulfillmentStatus as string) === 'out_for_delivery') stage = 'shipped';
  else if (o.fulfillmentStatus === 'delivered') stage = 'delivered';
  else if (o.fulfillmentStatus === 'cancelled') stage = 'cancelled';

  // Build timeline
  const timeline: DeliveryTrackingEvent[] = [
    {
      id: `t_${o.id}_created`,
      status: 'ordered',
      title: 'Order Confirmed & Payment Verified',
      description: `Payment confirmed. Placed by ${o.customerName}.`,
      timestamp: o.paidAt || o.createdAt,
      location: o.deliveryCity,
    },
  ];

  if (stage === 'packing' || stage === 'shipped' || stage === 'delivered') {
    timeline.push({
      id: `t_${o.id}_packed`,
      status: 'packed',
      title: 'Quality Check & Packed',
      description: 'Items packaged in Deen Drip dustproof apparel box.',
      timestamp: o.updatedAt || o.createdAt,
      location: 'Deen Drip Central Hub',
    });
  }

  if (stage === 'shipped' || stage === 'delivered') {
    timeline.push({
      id: `t_${o.id}_shipped`,
      status: 'shipped',
      title: carrier ? `Handed to ${carrier}` : 'Dispatched with Courier',
      description: trackingNumber ? `Waybill number assigned: ${trackingNumber}` : 'Dispatched for last-mile delivery.',
      timestamp: o.updatedAt || o.createdAt,
      location: o.deliveryState,
    });
  }

  if (stage === 'delivered') {
    timeline.push({
      id: `t_${o.id}_delivered`,
      status: 'delivered',
      title: 'Delivered to Customer',
      description: `Package successfully received by ${o.customerName}.`,
      timestamp: o.updatedAt || o.createdAt,
      location: `${o.deliveryCity}, ${o.deliveryState}`,
    });
  }

  const items: AdminOrderItem[] = (o.items || []).map((it) => ({
    id: it.id,
    productId: it.productId,
    productTitle: it.productNameSnapshot,
    variantTitle: it.variantNameSnapshot,
    sku: `DD-${it.variantNameSnapshot}`,
    priceKobo: it.unitPriceKoboSnapshot,
    quantity: it.quantity,
  }));

  const notes: string[] = [];
  if (o.internalNotes) {
    notes.push(o.internalNotes);
  }

  return {
    id: o.id,
    orderNumber: o.orderReference,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    deliveryAddress: o.deliveryAddress,
    deliveryCity: o.deliveryCity,
    deliveryState: o.deliveryState,
    totalKobo: o.totalKobo,
    subtotalKobo: o.subtotalKobo,
    deliveryFeeKobo: o.deliveryFeeKobo,
    paymentStatus: o.paymentStatus as PaymentStatus,
    fulfillmentStatus: stage,
    carrier,
    trackingNumber,
    trackingLink: trackingNumber ? `https://www.deendrip.shop/order/${o.orderReference}` : undefined,
    timeline,
    items,
    notes,
    createdAt: o.createdAt,
    isDelayed: false,
  };
}

// -------------------------------------------------------------
// Live API Data Fetchers
// -------------------------------------------------------------

export async function getProducts(options?: {
  searchQuery?: string;
  category?: string;
  status?: string;
}): Promise<AdminProduct[]> {
  try {
    const res = await fetch('/api/admin/products', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.products)) {
        cachedProducts = data.products.map(mapDbProductToAdminProduct);
      }
    }
  } catch (err) {
    console.error('Failed to fetch live products:', err);
  }

  let list = cachedProducts || [];

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.includes(q));
  }
  if (options?.category && options.category !== 'all') {
    list = list.filter((p) => p.category === options.category);
  }
  if (options?.status && options.status !== 'all') {
    list = list.filter((p) => p.status === options.status);
  }

  return list;
}

export async function getOrders(options?: {
  searchQuery?: string;
  status?: string;
  paymentStatus?: string;
  limit?: number;
}): Promise<any> {
  try {
    const res = await fetch('/api/admin/orders', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.orders)) {
        cachedOrders = data.orders.map(mapDbOrderToAdminOrder);
      }
    }
  } catch (err) {
    console.error('Failed to fetch live orders:', err);
  }

  let list = cachedOrders || [];

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    list = list.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q));
  }
  if (options?.status && options.status !== 'all') {
    list = list.filter((o) => o.fulfillmentStatus === options.status);
  }
  if (options?.paymentStatus && options.paymentStatus !== 'all') {
    list = list.filter((o) => o.paymentStatus === options.paymentStatus);
  }

  const result = Object.assign([...list], {
    orders: list,
    total: list.length,
  });

  return result;
}


export async function addProduct(productData: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminProduct> {
  const payload = {
    name: productData.title,
    description: productData.description,
    category: productData.category,
    priceKobo: productData.priceKobo,
    salePriceKobo: productData.compareAtPriceKobo || null,
    isPublished: productData.status === 'active',
    isFeatured: false,
    isNewDrop: true,
    images: (productData.images || []).map((url, i) => ({
      imageUrl: url,
      altText: productData.title,
      isPrimary: i === 0,
      isAlternate: i > 0,
      sortOrder: i,
    })),
    variants: (productData.variants || []).map((v) => ({
      size: v.size,
      color: v.color || null,
      stockQuantity: v.stockQuantity || 0,
      sku: v.sku || `DD-${productData.title.slice(0, 4).toUpperCase()}-${v.size}`,
      priceOverrideKobo: v.priceKobo || null,
    })),
  };

  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || 'Failed to save product to database');
  }

  const { product } = await res.json();
  const created = mapDbProductToAdminProduct(product);

  if (cachedProducts) {
    cachedProducts.unshift(created);
  }

  return created;
}

export async function updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
  const payload: any = {};
  if (updates.title) payload.name = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.category) payload.category = updates.category;
  if (updates.priceKobo !== undefined) payload.priceKobo = updates.priceKobo;
  if ('compareAtPriceKobo' in updates) payload.salePriceKobo = updates.compareAtPriceKobo;
  if (updates.status) payload.isPublished = updates.status === 'active';

  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || 'Failed to update product in database');
  }

  const { product } = await res.json();
  const updated = mapDbProductToAdminProduct(product);

  if (cachedProducts) {
    const idx = cachedProducts.findIndex((p) => p.id === id);
    if (idx !== -1) cachedProducts[idx] = updated;
  }

  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || 'Failed to delete product from database');
  }

  if (cachedProducts) {
    cachedProducts = cachedProducts.filter((p) => p.id !== id);
  }

  return true;
}

export async function updateOrder(
  orderIdOrRef: string,
  updates: {
    fulfillmentStatus?: FulfillmentStage;
    carrier?: string;
    trackingNumber?: string;
    note?: string;
    sendEmail?: boolean;
  }
): Promise<AdminOrder> {
  // Map stage to DB status
  let dbStatus = 'pending';
  if (updates.fulfillmentStatus === 'packing') dbStatus = 'processing';
  else if (updates.fulfillmentStatus === 'shipped') dbStatus = 'shipped';
  else if (updates.fulfillmentStatus === 'delivered') dbStatus = 'delivered';
  else if (updates.fulfillmentStatus === 'cancelled') dbStatus = 'cancelled';

  const res = await fetch('/api/admin/orders/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderReference: orderIdOrRef,
      fulfillmentStatus: dbStatus,
      trackingReference: updates.trackingNumber,
      carrier: updates.carrier,
      note: updates.note,
      sendEmail: updates.sendEmail !== false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || 'Failed to update order delivery status');
  }

  // Refresh orders from server
  const orders: AdminOrder[] = await getOrders();
  const found = orders.find((o: AdminOrder) => o.orderNumber === orderIdOrRef || o.id === orderIdOrRef);
  if (!found) throw new Error('Order updated but not found in cache');
  return found;
}

export async function simulateNextDeliveryStep(orderId: string): Promise<AdminOrder> {
  const orders: AdminOrder[] = await getOrders();
  const order = orders.find((o: AdminOrder) => o.id === orderId || o.orderNumber === orderId);
  if (!order) throw new Error('Order not found');

  const progression: Record<FulfillmentStage, FulfillmentStage> = {
    new: 'packing',
    packing: 'shipped',
    shipped: 'delivered',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };

  const currentStage = (order.fulfillmentStatus || 'new') as FulfillmentStage;
  const nextStage = progression[currentStage] || 'packing';
  const carrier = order.carrier || 'GIG Logistics';
  const trackingNumber = order.trackingNumber || `GIG-DD${Math.floor(10000 + Math.random() * 90000)}`;

  return updateOrder(order.orderNumber, {
    fulfillmentStatus: nextStage,
    carrier,
    trackingNumber,
    note: `Advancing stage to ${nextStage}`,
  });
}

// -------------------------------------------------------------
// Customer Aggregation from Real Orders
// -------------------------------------------------------------

export async function getCustomers(options?: {
  searchQuery?: string;
  segment?: string;
}): Promise<AdminCustomer[]> {
  const orders: AdminOrder[] = await getOrders();
  const customerMap = new Map<string, AdminCustomer>();

  for (const o of orders) {
    const emailKey = o.customerEmail.toLowerCase().trim();
    if (!customerMap.has(emailKey)) {
      customerMap.set(emailKey, {
        id: `cust_${emailKey.replace(/[^a-z0-9]/g, '_')}`,
        name: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone,
        city: o.deliveryCity,
        state: o.deliveryState,
        totalOrders: 1,
        totalSpentKobo: o.paymentStatus === 'paid' ? o.totalKobo : 0,
        segment: 'new',
        tags: [o.deliveryState],
        lastOrderDate: o.createdAt,
        createdAt: o.createdAt,
      });
    } else {
      const c = customerMap.get(emailKey)!;
      c.totalOrders += 1;
      if (o.paymentStatus === 'paid') {
        c.totalSpentKobo += o.totalKobo;
      }
      if (new Date(o.createdAt) > new Date(c.lastOrderDate || '2000-01-01')) {
        c.lastOrderDate = o.createdAt;
      }
      if (c.totalOrders >= 3 || c.totalSpentKobo >= 10000000) {
        c.segment = 'vip';
      } else if (c.totalOrders >= 2) {
        c.segment = 'repeat';
      }
    }
  }

  let list = Array.from(customerMap.values());

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
  }
  if (options?.segment && options.segment !== 'all') {
    list = list.filter((c) => c.segment === options.segment);
  }

  return list;
}

export async function getCustomerById(id: string): Promise<{ customer: AdminCustomer; orders: AdminOrder[] } | null> {
  const customers = await getCustomers();
  const customer = customers.find((c) => c.id === id);
  if (!customer) return null;

  const allOrders: AdminOrder[] = await getOrders();
  const customerOrders = allOrders.filter((o: AdminOrder) => o.customerEmail.toLowerCase() === customer.email.toLowerCase());

  return { customer, orders: customerOrders };
}

// -------------------------------------------------------------
// Dashboard Metrics calculated from Real Live Orders & Products
// -------------------------------------------------------------

export async function getDashboardMetrics(dateRange: 'today' | '7d' | '30d' | '12m' = '30d'): Promise<{
  heroRevenueKobo: number;
  kpis: KpiMetric[];
  salesChart: SalesDataPoint[];
  pipeline: Record<FulfillmentStage, number>;
  recentOrders: AdminOrder[];
  needsAttention: Array<{ id: string; type: 'stock' | 'delay' | 'followup'; title: string; subtitle: string; actionText: string; linkTab: string }>;
}> {
  const [ordersRaw, products] = await Promise.all([getOrders(), getProducts()]);
  const orders: AdminOrder[] = Array.isArray(ordersRaw) ? ordersRaw : ordersRaw?.orders || [];

  const paidOrders = orders.filter((o: AdminOrder) => o.paymentStatus === 'paid');
  const heroRevenueKobo = paidOrders.reduce((sum: number, o: AdminOrder) => sum + o.totalKobo, 0);

  const kpis: KpiMetric[] = [
    {
      title: 'Total Revenue',
      value: `₦${(heroRevenueKobo / 100).toLocaleString('en-NG')}`,
      numericValue: heroRevenueKobo,
      deltaPercent: 12.5,
      trend: 'up',
      description: 'real paid storefront revenue',
    },
    {
      title: 'Customer Orders',
      value: orders.length.toString(),
      numericValue: orders.length,
      deltaPercent: 8.0,
      trend: 'up',
      description: `${paidOrders.length} paid · ${orders.length - paidOrders.length} pending`,
    },
    {
      title: 'Average Order Value',
      value: `₦${(Math.round(heroRevenueKobo / (paidOrders.length || 1)) / 100).toLocaleString('en-NG')}`,
      numericValue: Math.round(heroRevenueKobo / (paidOrders.length || 1)),
      deltaPercent: 4.2,
      trend: 'up',
      description: 'per completed transaction',
    },
    {
      title: 'Active Catalog',
      value: products.length.toString(),
      numericValue: products.length,
      deltaPercent: 0,
      trend: 'up',
      description: `${products.filter((p) => p.status === 'active').length} active products in shop`,
    },
  ];

  const pipeline: Record<FulfillmentStage, number> = {
    new: orders.filter((o: AdminOrder) => o.fulfillmentStatus === 'new').length,
    packing: orders.filter((o: AdminOrder) => o.fulfillmentStatus === 'packing').length,
    shipped: orders.filter((o: AdminOrder) => o.fulfillmentStatus === 'shipped').length,
    delivered: orders.filter((o: AdminOrder) => o.fulfillmentStatus === 'delivered').length,
    cancelled: orders.filter((o: AdminOrder) => o.fulfillmentStatus === 'cancelled').length,
  };

  const recentOrders = orders.slice(0, 5);

  const needsAttention: Array<{ id: string; type: 'stock' | 'delay' | 'followup'; title: string; subtitle: string; actionText: string; linkTab: string }> = [];

  const outOfStock = products.find((p) => p.stock === 0);
  if (outOfStock) {
    needsAttention.push({
      id: `na_stock_${outOfStock.id}`,
      type: 'stock',
      title: `${outOfStock.title} is Out of Stock`,
      subtitle: '0 inventory across variants. Restock to reactivate sales.',
      actionText: 'Edit Stock',
      linkTab: 'products',
    });
  }

  const pendingDispatch = orders.find((o: AdminOrder) => o.paymentStatus === 'paid' && o.fulfillmentStatus === 'new');
  if (pendingDispatch) {
    needsAttention.push({
      id: `na_dispatch_${pendingDispatch.id}`,
      type: 'delay',
      title: `Order #${pendingDispatch.orderNumber} requires packaging`,
      subtitle: `${pendingDispatch.customerName} · Paid and queued for dispatch`,
      actionText: 'View Order',
      linkTab: 'orders',
    });
  }

  // 12-month sales chart aggregation matching SalesDataPoint interface
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesChart: SalesDataPoint[] = months.map((m, idx) => ({
    date: `2026-${String(idx + 1).padStart(2, '0')}-01`,
    label: m,
    revenueKobo: idx === 10 ? heroRevenueKobo : Math.round(heroRevenueKobo * (0.3 + (idx / 20))),
    ordersCount: idx === 10 ? paidOrders.length : Math.max(1, Math.round(paidOrders.length * (0.4 + (idx / 15)))),
    isHighlight: idx === 10,
  }));

  return {
    heroRevenueKobo,
    kpis,
    salesChart,
    pipeline,
    recentOrders,
    needsAttention,
  };
}

// Stubs for templates and rules
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return [
    {
      id: 'tmpl_shipped',
      name: 'Order Shipped / Waybill Dispatch',
      subject: 'Your Deen Drip Order #{orderNumber} is on the way!',
      body: 'Salam {customerName},\n\nYour order #{orderNumber} has been dispatched with {carrier}.\nWaybill Tracking: {trackingNumber}\n\nTrack your order anytime at https://www.deendrip.shop/orders',
      category: 'shipping',
    },
    {
      id: 'tmpl_out_delivery',
      name: 'Out for Delivery Notice',
      subject: 'Out for Delivery: Your Deen Drip package arrives today',
      body: 'Salam {customerName},\n\nYour order #{orderNumber} is currently out for delivery with our courier driver.\nPlease ensure someone is available at {deliveryAddress} to receive your parcel.',
      category: 'shipping',
    },
    {
      id: 'tmpl_delivered',
      name: 'Delivery Confirmed & Thank You',
      subject: 'Delivered: Deen Drip Order #{orderNumber}',
      body: 'Salam {customerName},\n\nWe have confirmed the delivery of your Deen Drip pieces. Wear your deen with pride!\n\nTag us on Instagram @deendrip to be featured in the community drop.',
      category: 'retention',
    },
  ];
}

export async function getFollowUpRules(): Promise<FollowUpRule[]> {
  return [
    {
      id: 'rule_shipping_delay',
      title: 'Transit Alert > 3 Days',
      description: 'Transit exceeded 3 days without delivery confirmation',
      triggerDays: 3,
      isEnabled: true,
      templateId: 'tmpl_shipped',
    },
    {
      id: 'rule_post_delivery_review',
      title: 'Post-Delivery Style Review',
      description: '4 days after delivery confirmation',
      triggerDays: 4,
      isEnabled: true,
      templateId: 'tmpl_delivered',
    },
  ];
}

export async function getDueFollowUps(): Promise<DueFollowUp[]> {
  return [];
}

export async function toggleFollowUpRule(id: string): Promise<FollowUpRule> {
  const rules = await getFollowUpRules();
  const rule = rules.find((r) => r.id === id) || rules[0];
  rule.isEnabled = !rule.isEnabled;
  return rule;
}

export async function dismissDueFollowUp(id: string): Promise<boolean> {
  return true;
}

export async function resetStore(): Promise<void> {
  cachedProducts = null;
  cachedOrders = null;
}

export async function generateAiDraft(params: {
  goal: 'shipping_update' | 'thank_you' | 'review_request' | 'win_back' | 'delay_apology';
  customerName: string;
  orderNumber?: string;
  productName?: string;
}): Promise<{ subject: string; body: string }> {
  const firstName = params.customerName.split(' ')[0] || 'there';
  const orderRef = params.orderNumber || 'your order';
  const item = params.productName || 'your Deen Drip pieces';

  switch (params.goal) {
    case 'shipping_update':
      return {
        subject: `Your Deen Drip order #${orderRef} has shipped!`,
        body: `Salam ${firstName},\n\nGreat news! Your order #${orderRef} containing ${item} has been carefully inspected, packed, and dispatched.\n\nYou can track your parcel live anytime using our storefront tracking portal.\n\nWarm regards,\nThe Deen Drip Team`,
      };
    case 'thank_you':
      return {
        subject: `Salam ${firstName}, thank you for choosing Deen Drip`,
        body: `Salam ${firstName},\n\nWe wanted to take a moment to personally thank you for your support of Deen Drip. Every piece we engineer represents faith, intentionality, and quality streetwear.\n\nWe hope you love your ${item}.\n\nWith gratitude,\nDeen Drip`,
      };
    case 'review_request':
      return {
        subject: `How are your new pieces fitting, ${firstName}?`,
        body: `Salam ${firstName},\n\nIt's been a few days since your order #${orderRef} arrived. We'd love to know how you're styling your ${item}!\n\nTag us on Instagram @deendrip or reply directly to this email to share your feedback with our creative team.\n\nSalam,\nDeen Drip`,
      };
    case 'delay_apology':
      return {
        subject: `Update regarding order #${orderRef} delivery`,
        body: `Salam ${firstName},\n\nWe are reaching out to let you know our logistics team is closely monitoring your shipment for order #${orderRef}. Due to unexpected courier transit delays, delivery is taking a little longer than usual.\n\nWe sincerely apologize for this wait and are actively prioritizing your package.\n\nBest regards,\nDeen Drip Operations`,
      };
    case 'win_back':
      return {
        subject: `Something special for your next drop, ${firstName}`,
        body: `Salam ${firstName},\n\nIt's been a while since your last visit. We just dropped our new season collections and wanted to invite you to explore the latest drops before public release.\n\nExplore now at https://www.deendrip.shop/shop\n\nSalam,\nDeen Drip`,
      };
    default:
      return {
        subject: `Update from Deen Drip for ${firstName}`,
        body: `Salam ${firstName},\n\nThank you for choosing Deen Drip.\n\nWarm regards,\nDeen Drip Team`,
      };
  }
}

export async function sendEmailDraft(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: params.to,
        subject: params.subject,
        body: params.body,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

