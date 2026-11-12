'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Order, Product, FulfillmentStatus, PaymentStatus } from '@/lib/types';
import { formatNaira, formatDate } from '@/lib/formatters';
import styles from './admin.module.css';

interface AdminDashboardClientProps {
  orders: Order[];
  products: Product[];
  adminName: string;
  adminRole: string;
}

type TabId = 'overview' | 'orders' | 'products' | 'inventory' | 'emails' | 'inquiries' | 'delivery' | 'settings';

interface EmailLogItem {
  id: string;
  recipient: string;
  subject: string;
  emailType: string;
  orderReference: string | null;
  status: 'delivered' | 'simulated' | 'failed';
  provider: 'resend' | 'smtp' | 'simulation';
  errorMessage: string | null;
  createdAt: string;
}

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  orderRef: string | null;
  message: string;
  createdAt: string;
}

const FULFILLMENT_STATUSES: FulfillmentStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const COURIER_OPTIONS = ['GIG Logistics', 'Fez Delivery', 'DHL Express', 'Speedaf Express', 'In-House Lagos Dispatch', 'Custom / Other'];

export default function AdminDashboardClient({ orders: initialOrders, products: initialProducts, adminName, adminRole }: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Orders state
  const [orderSearch, setOrderSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded'>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | FulfillmentStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNotes, setOrderNotes] = useState<Array<{ id: string; adminName: string; note: string; createdAt: string }>>([]);
  const [newNote, setNewNote] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [courierSelect, setCourierSelect] = useState('GIG Logistics');
  const [savingOrder, setSavingOrder] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showWaybill, setShowWaybill] = useState(false);

  // Inventory state
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const [isSavingStock, setIsSavingStock] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Products inline edit state
  const [editingPriceProductId, setEditingPriceProductId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<string>('');
  const [salePriceInput, setSalePriceInput] = useState<string>('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Email Audit Logs state
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Customer Inquiries state
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Metrics
  const totalRevenueKobo = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalKobo, 0);
  const pendingShipmentsCount = orders.filter(o => o.paymentStatus === 'paid' && (o.fulfillmentStatus === 'pending' || o.fulfillmentStatus === 'processing')).length;
  const lowStockVariants = products.flatMap(p => p.variants.filter(v => v.stockQuantity > 0 && v.stockQuantity <= 10));
  const outOfStockVariants = products.flatMap(p => p.variants.filter(v => v.stockQuantity === 0));
  const paidOrdersCount = orders.filter(o => o.paymentStatus === 'paid').length;
  const cancelledOrdersCount = orders.filter(o => o.fulfillmentStatus === 'cancelled').length;

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase();
    const matchSearch = !q || o.orderReference.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q) || o.customerPhone.includes(q);
    const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
    const matchFulfillment = fulfillmentFilter === 'all' || o.fulfillmentStatus === fulfillmentFilter;
    return matchSearch && matchPayment && matchFulfillment;
  });

  // Filtered products
  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  // Load emails when tab selected
  useEffect(() => {
    if (activeTab === 'emails') {
      fetchEmailLogs();
    }
  }, [activeTab]);

  // Load inquiries when tab selected
  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const fetchEmailLogs = async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch('/api/admin/emails?limit=50');
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data.logs || []);
      }
    } catch {
      showToast('Failed to load email logs', 'err');
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch('/api/admin/inquiries?limit=50');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch {
      showToast('Failed to load inquiries', 'err');
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailInput.trim()) return;
    setSendingTestEmail(true);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: testEmailInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Verification test delivered to ${testEmailInput}!`);
        setTestEmailInput('');
        fetchEmailLogs();
      } else {
        showToast(data.error || 'Failed to dispatch test email', 'err');
      }
    } catch {
      showToast('Network error while dispatching test email', 'err');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleStatusChange = async (orderRef: string, newStatus: FulfillmentStatus, tracking?: string) => {
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: orderRef,
          fulfillmentStatus: newStatus,
          trackingReference: tracking !== undefined ? tracking : selectedOrder?.trackingReference || undefined
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => (o.orderReference === orderRef ? {
          ...o,
          fulfillmentStatus: newStatus,
          trackingReference: tracking !== undefined ? tracking : o.trackingReference
        } : o)));
        if (selectedOrder?.orderReference === orderRef) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            fulfillmentStatus: newStatus,
            trackingReference: tracking !== undefined ? tracking : prev.trackingReference
          } : null);
        }
        if (newStatus === 'shipped') {
          showToast(`Order marked shipped · ${data.emailSent ? 'Dispatched waybill email to customer!' : 'Waybill recorded.'}`);
        } else {
          showToast(`Status updated to ${newStatus}`);
        }
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update status', 'err');
      }
    } catch {
      showToast('Network error', 'err');
    }
  };

  const handleSaveTrackingAndDispatch = async () => {
    if (!selectedOrder) return;
    const finalTracking = trackingInput.trim() ? `${courierSelect}: ${trackingInput.trim()}` : '';
    setSavingOrder(true);
    try {
      await handleStatusChange(selectedOrder.orderReference, 'shipped', finalTracking);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleResendOrderEmail = async (type: 'confirmation' | 'shipped') => {
    if (!selectedOrder) return;
    setResendingEmail(true);
    try {
      const res = await fetch('/api/admin/orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: selectedOrder.orderReference,
          type
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`${type === 'confirmation' ? 'Order Receipt' : 'Shipping Waybill'} resent to ${data.recipient}!`);
      } else {
        showToast(data.error || 'Failed to resend email', 'err');
      }
    } catch {
      showToast('Network error', 'err');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !newNote.trim()) return;
    setSavingOrder(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.orderReference}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addNote: newNote.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrderNotes(data.notes || []);
        setNewNote('');
        showToast('Note added');
      } else {
        showToast('Failed to add note', 'err');
      }
    } finally {
      setSavingOrder(false);
    }
  };

  const openOrderModal = async (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingReference || '');
    setOrderNotes([]);
    setShowWaybill(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.orderReference}`);
      if (res.ok) {
        const data = await res.json();
        setOrderNotes(data.notes || []);
      }
    } catch { /* non-critical */ }
  };

  const handleStockUpdate = async (variantId: string) => {
    const newStock = stockUpdates[variantId];
    if (typeof newStock !== 'number') return;
    setIsSavingStock(variantId);
    try {
      const res = await fetch('/api/admin/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, newStock }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => ({ ...p, variants: p.variants.map(v => (v.id === variantId ? { ...v, stockQuantity: newStock } : v)) })));
        showToast(`Stock updated to ${newStock}`);
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update stock', 'err');
      }
    } finally {
      setIsSavingStock(null);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !product.isPublished }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(prev => prev.map(p => (p.id === product.id ? data.product : p)));
      showToast(`Product ${!product.isPublished ? 'published' : 'unpublished'}`);
    } else {
      showToast('Failed to update product', 'err');
    }
  };

  const startEditPrice = (product: Product) => {
    setEditingPriceProductId(product.id);
    setPriceInput(String(product.priceKobo / 100));
    setSalePriceInput(product.salePriceKobo ? String(product.salePriceKobo / 100) : '');
  };

  const saveProductPrice = async (product: Product) => {
    setSavingPrice(true);
    const priceKobo = Math.round(parseFloat(priceInput || '0') * 100);
    const salePriceKobo = salePriceInput.trim() ? Math.round(parseFloat(salePriceInput) * 100) : null;

    if (!priceKobo || priceKobo <= 0) {
      showToast('Valid price required', 'err');
      setSavingPrice(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceKobo, salePriceKobo }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => (p.id === product.id ? data.product : p)));
        setEditingPriceProductId(null);
        showToast(`Price updated for ${product.name}`);
      } else {
        showToast('Failed to update product price', 'err');
      }
    } finally {
      setSavingPrice(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // Helper to format Nigerian phone numbers for WhatsApp
  const formatWhatsAppUrl = (phone: string, customerName: string, orderRef: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '234' + clean.slice(1);
    } else if (clean.length === 10) {
      clean = '234' + clean;
    }
    const text = encodeURIComponent(`Salam ${customerName}! This is Deen Drip regarding your order #${orderRef}.`);
    return `https://wa.me/${clean}?text=${text}`;
  };

  const renderPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <span className={`${styles.statusPill} ${styles.pillPaid}`}><span className={styles.statusDot} />Paid</span>;
      case 'pending':
        return <span className={`${styles.statusPill} ${styles.pillPending}`}><span className={styles.statusDot} />Pending</span>;
      case 'failed':
        return <span className={`${styles.statusPill} ${styles.pillFailed}`}><span className={styles.statusDot} />Failed</span>;
      default:
        return <span className={`${styles.statusPill} ${styles.pillCancelled}`}><span className={styles.statusDot} />{status}</span>;
    }
  };

  const renderFulfillmentBadge = (status: FulfillmentStatus) => {
    switch (status) {
      case 'delivered':
        return <span className={`${styles.statusPill} ${styles.pillDelivered}`}><span className={styles.statusDot} />Delivered</span>;
      case 'shipped':
        return <span className={`${styles.statusPill} ${styles.pillShipped}`}><span className={styles.statusDot} />Shipped</span>;
      case 'processing':
        return <span className={`${styles.statusPill} ${styles.pillPending}`}><span className={styles.statusDot} />Processing</span>;
      case 'cancelled':
        return <span className={`${styles.statusPill} ${styles.pillCancelled}`}><span className={styles.statusDot} />Cancelled</span>;
      default:
        return <span className={`${styles.statusPill} ${styles.pillPending}`}><span className={styles.statusDot} />Pending</span>;
    }
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders', count: orders.length },
    { id: 'products', label: 'Products', count: products.length },
    { id: 'inventory', label: 'Inventory' },
    { id: 'emails', label: 'Email Logs' },
    { id: 'inquiries', label: 'Inquiries' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className={styles.container}>
      <div className="container">
        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
            padding: '0.85rem 1.4rem',
            backgroundColor: toast.type === 'ok' ? '#10b981' : '#ef4444',
            color: '#fff', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem', fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', maxWidth: '360px',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span>{toast.type === 'ok' ? '✓' : '⚠'}</span>
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Header */}
        <div className={styles.topBar}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="section-tag" style={{ margin: 0 }}>[ STAFF ADMIN CONSOLE ]</span>
              <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                TURSO CLOUD SYNCED
              </span>
            </div>
            <h1 className={styles.title}>Deen Drip Operations</h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Logged in as <strong>{adminName}</strong> ({adminRole})
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/')} className="btn btn-outline btn-sm">View Storefront ↗</button>
            <button onClick={handleLogout} className="btn btn-primary btn-sm">Sign Out</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className={styles.tabBadge}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Verified Gross Revenue</span>
                <span className={styles.metricVal} style={{ color: 'var(--accent-primary)' }}>{formatNaira(totalRevenueKobo)}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Gross from {paidOrdersCount} confirmed paid orders</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Total Orders</span>
                <span className={styles.metricVal}>{orders.length}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{paidOrdersCount} paid · {cancelledOrdersCount} cancelled</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Awaiting Dispatch</span>
                <span className={styles.metricVal} style={{ color: pendingShipmentsCount > 0 ? '#f59e0b' : 'inherit' }}>{pendingShipmentsCount}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Paid orders requiring courier dispatch</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Stock Status</span>
                <span className={styles.metricVal} style={{ color: (lowStockVariants.length + outOfStockVariants.length) > 0 ? '#ef4444' : '#10b981' }}>
                  {lowStockVariants.length + outOfStockVariants.length}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {outOfStockVariants.length} out of stock · {lowStockVariants.length} low (≤10)
                </span>
              </div>
            </div>

            {/* Recent Orders */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Store Orders
              </h2>
              <button onClick={() => setActiveTab('orders')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                View All ({orders.length}) →
              </button>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-xs)' }}>
                No customer orders placed yet. Orders will appear here the instant customers checkout.
              </div>
            ) : (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order Ref</th>
                      <th>Placed At</th>
                      <th>Customer</th>
                      <th>Total Amount</th>
                      <th>Payment</th>
                      <th>Fulfillment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.orderReference}</strong></td>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(order.createdAt)}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{order.customerName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                        </td>
                        <td><strong style={{ color: 'var(--accent-primary)' }}>{formatNaira(order.totalKobo)}</strong></td>
                        <td>{renderPaymentBadge(order.paymentStatus)}</td>
                        <td>{renderFulfillmentBadge(order.fulfillmentStatus)}</td>
                        <td>
                          <button onClick={() => openOrderModal(order)} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="search"
                placeholder="Search reference, customer, email, phone…"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', width: '300px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
              <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value as any)} className={styles.statusSelect}>
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select value={fulfillmentFilter} onChange={e => setFulfillmentFilter(e.target.value as any)} className={styles.statusSelect}>
                <option value="all">All Fulfillment Statuses</option>
                {FULFILLMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-xs)' }}>
                No orders match your filter criteria.
              </div>
            ) : (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Location</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Fulfillment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.orderReference}</strong></td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{order.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                        </td>
                        <td>
                          <div>{order.deliveryCity}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{order.deliveryState}</div>
                        </td>
                        <td><strong>{formatNaira(order.totalKobo)}</strong></td>
                        <td>{renderPaymentBadge(order.paymentStatus)}</td>
                        <td>
                          <select
                            value={order.fulfillmentStatus}
                            onChange={e => handleStatusChange(order.orderReference, e.target.value as FulfillmentStatus)}
                            className={styles.statusSelect}
                            disabled={order.paymentStatus !== 'paid'}
                            title={order.paymentStatus !== 'paid' ? 'Requires confirmed payment' : ''}
                          >
                            {FULFILLMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <button onClick={() => openOrderModal(order)} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                              View
                            </button>
                            {order.customerPhone && (
                              <a
                                href={formatWhatsAppUrl(order.customerPhone, order.customerName, order.orderReference)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappBtn}
                                title="Chat with customer on WhatsApp"
                              >
                                WA 💬
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <input
                type="search"
                placeholder="Search products by title or category…"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', width: '280px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filteredProducts.length} products listed</span>
            </div>

            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Base Price / Sale</th>
                    <th>Total Stock</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const totalStock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
                    const primaryImg = product.images.find(i => i.isPrimary) || product.images[0];
                    const isEditingThisPrice = editingPriceProductId === product.id;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{ width: 44, height: 55, position: 'relative', borderRadius: 4, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                              {primaryImg && (
                                <Image src={primaryImg.imageUrl} alt={product.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{product.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800 }}>{product.category}</td>
                        <td>
                          {isEditingThisPrice ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem' }}>₦</span>
                                <input
                                  type="number"
                                  value={priceInput}
                                  onChange={e => setPriceInput(e.target.value)}
                                  placeholder="Base"
                                  style={{ width: '85px', padding: '0.25rem 0.4rem', fontSize: '0.78rem', border: '1px solid var(--border-light)', borderRadius: '3px' }}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Sale:</span>
                                <input
                                  type="number"
                                  value={salePriceInput}
                                  onChange={e => setSalePriceInput(e.target.value)}
                                  placeholder="Leave blank"
                                  style={{ width: '85px', padding: '0.25rem 0.4rem', fontSize: '0.78rem', border: '1px solid var(--border-light)', borderRadius: '3px' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem' }}>
                                <button onClick={() => saveProductPrice(product)} disabled={savingPrice} className="btn btn-sm btn-sky" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                  Save
                                </button>
                                <button onClick={() => setEditingPriceProductId(null)} className="btn btn-sm btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <strong>{formatNaira(product.priceKobo)}</strong>
                              {product.salePriceKobo && (
                                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                                  Sale: {formatNaira(product.salePriceKobo)}
                                </div>
                              )}
                              <button
                                onClick={() => startEditPrice(product)}
                                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer', padding: 0, marginTop: '0.2rem', display: 'block' }}
                              >
                                Edit Price ✎
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ color: totalStock === 0 ? '#ef4444' : totalStock <= 10 ? '#f59e0b' : 'inherit', fontWeight: 800 }}>
                            {totalStock === 0 ? 'Out of Stock' : `${totalStock} units`}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${product.isPublished ? 'badge-sky' : 'badge-outline'}`}>
                            {product.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handleTogglePublish(product)} className="btn btn-sm btn-outline" style={{ fontSize: '0.7rem' }}>
                              {product.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ fontSize: '0.7rem' }}>
                              View ↗
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INVENTORY TAB ── */}
        {activeTab === 'inventory' && (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Variants & Stock Quantities</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 44, height: 55, position: 'relative', borderRadius: 4, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                          {product.images[0] && <Image src={product.images[0].imageUrl} alt={product.name} fill sizes="44px" style={{ objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{product.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800 }}>{product.category}</td>
                    <td><strong>{formatNaira(product.priceKobo)}</strong></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {product.variants.map(v => (
                          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            <span style={{ width: '80px', fontWeight: 700, fontSize: '0.8rem' }}>Size {v.size}:</span>
                            <input
                              type="number"
                              min="0"
                              defaultValue={v.stockQuantity}
                              onChange={e => setStockUpdates(prev => ({ ...prev, [v.id]: parseInt(e.target.value) || 0 }))}
                              className={styles.stockInput}
                              aria-label={`Stock for ${product.name} size ${v.size}`}
                            />
                            <button
                              onClick={() => handleStockUpdate(v.id)}
                              disabled={isSavingStock === v.id || stockUpdates[v.id] === undefined}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
                            >
                              {isSavingStock === v.id ? 'Syncing…' : 'Update'}
                            </button>
                            {v.stockQuantity === 0 && <span style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 800 }}>Out of Stock</span>}
                            {v.stockQuantity > 0 && v.stockQuantity <= 10 && <span style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 800 }}>Low Stock</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── EMAILS AUDIT TAB ── */}
        {activeTab === 'emails' && (
          <div>
            {/* Live Test Console */}
            <div style={{
              background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-6)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <span className="section-tag">[ RESEND TRANSACTIONAL AUDIT ]</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', margin: '0.25rem 0 0.5rem 0' }}>
                    Automated Email Engine
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '600px' }}>
                    Emails dispatch live from <strong>Deen Drip &lt;orders@deendrip.shop&gt;</strong> authenticated via Resend DNS (DKIM, SPF, MX).
                  </p>
                </div>
                <button onClick={fetchEmailLogs} disabled={loadingEmails} className="btn btn-outline btn-sm">
                  {loadingEmails ? 'Refreshing…' : '↻ Refresh Logs'}
                </button>
              </div>

              {/* Test Email Box */}
              <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="email"
                  placeholder="Enter email to verify live delivery (e.g. you@gmail.com)…"
                  value={testEmailInput}
                  onChange={e => setTestEmailInput(e.target.value)}
                  style={{
                    flex: '1', minWidth: '280px', maxWidth: '420px',
                    padding: '0.65rem 0.95rem', fontSize: '0.85rem',
                    border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'
                  }}
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail || !testEmailInput.trim()}
                  className="btn btn-sky"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.82rem' }}
                >
                  {sendingTestEmail ? 'Sending via Resend…' : '⚡ Send Test Email'}
                </button>
              </div>
            </div>

            {/* Email Logs Table */}
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Order Ref</th>
                    <th>Provider</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                        {loadingEmails ? 'Loading email audit logs…' : 'No emails dispatched yet.'}
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(log.createdAt)}</td>
                        <td><strong style={{ fontSize: '0.85rem' }}>{log.recipient}</strong></td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject}</td>
                        <td><span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>{log.emailType}</span></td>
                        <td>
                          {log.orderReference ? (
                            <strong style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => {
                              const o = orders.find(ord => ord.orderReference === log.orderReference);
                              if (o) { setSelectedOrder(o); }
                            }}>
                              {log.orderReference}
                            </strong>
                          ) : '—'}
                        </td>
                        <td><span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>{log.provider}</span></td>
                        <td>
                          <span className={`${styles.statusPill} ${log.status === 'delivered' ? styles.pillPaid : log.status === 'simulated' ? styles.pillPending : styles.pillFailed}`}>
                            <span className={styles.statusDot} />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INQUIRIES TAB ── */}
        {activeTab === 'inquiries' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                  Customer Inquiries & Support
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Messages sent via the customer contact page.
                </p>
              </div>
              <button onClick={fetchInquiries} disabled={loadingInquiries} className="btn btn-outline btn-sm">
                {loadingInquiries ? 'Refreshing…' : '↻ Refresh'}
              </button>
            </div>

            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Order Ref</th>
                    <th>Message</th>
                    <th>Reply Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                        {loadingInquiries ? 'Loading inquiries…' : 'No inquiries received yet.'}
                      </td>
                    </tr>
                  ) : (
                    inquiries.map(inq => (
                      <tr key={inq.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(inq.createdAt)}</td>
                        <td><strong>{inq.name}</strong></td>
                        <td>
                          <a href={`mailto:${inq.email}?subject=Deen%20Drip%20Support%20Reply`} style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                            {inq.email}
                          </a>
                        </td>
                        <td>
                          {inq.orderRef ? (
                            <strong style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => {
                              const o = orders.find(ord => ord.orderReference === inq.orderRef);
                              if (o) { setSelectedOrder(o); }
                            }}>
                              {inq.orderRef}
                            </strong>
                          ) : '—'}
                        </td>
                        <td style={{ maxWidth: '320px', fontSize: '0.82rem', lineHeight: '1.4' }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{inq.message}</div>
                        </td>
                        <td>
                          <a
                            href={`mailto:${inq.email}?subject=Deen%20Drip%20Support%20Reply&body=Salam%20${encodeURIComponent(inq.name)},%0D%0A%0D%0AThank%20you%20for%20contacting%20Deen%20Drip.%0D%0A`}
                            className="btn btn-sm btn-sky"
                            style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                          >
                            Reply ✉
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DELIVERY TAB ── */}
        {activeTab === 'delivery' && <DeliveryTab onToast={showToast} />}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && <SettingsTab onToast={showToast} />}

      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5,7,12,0.85)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--space-4)', overflowY: 'auto' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', maxWidth: '720px', width: '100%', padding: 'var(--space-8)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-4)' }}>
              <div>
                <span className="section-tag" style={{ margin: 0 }}>ORDER INSPECTION</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
                  #{selectedOrder.orderReference}
                </h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                  {renderPaymentBadge(selectedOrder.paymentStatus)}
                  {renderFulfillmentBadge(selectedOrder.fulfillmentStatus)}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setShowWaybill(prev => !prev)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  {showWaybill ? '✕ Close Waybill' : '📄 Print Waybill'}
                </button>
                <button onClick={() => setSelectedOrder(null)} style={{ fontSize: '1.25rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>✕</button>
              </div>
            </div>

            {/* Printable Waybill Slip View */}
            {showWaybill ? (
              <div className={styles.printableSlip} style={{ background: '#ffffff', color: '#000000', padding: '24px', borderRadius: '4px', border: '2px solid #000000', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '0.1em' }}>DEEN DRIP LAGOS</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Faith, Culture & Streetwear · orders@deendrip.shop · +234 906 414 7689</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 900 }}>WAYBILL SLIP</div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>#{selectedOrder.orderReference}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px', fontSize: '13px' }}>
                  <div>
                    <strong style={{ textTransform: 'uppercase', fontSize: '11px', display: 'block', marginBottom: '4px' }}>DELIVER TO (RECIPIENT):</strong>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{selectedOrder.customerName}</div>
                    <div>{selectedOrder.deliveryAddress}</div>
                    <div>{selectedOrder.deliveryCity}, {selectedOrder.deliveryState}</div>
                    <div style={{ fontWeight: 800, marginTop: '4px' }}>Tel: {selectedOrder.customerPhone}</div>
                  </div>
                  <div>
                    <strong style={{ textTransform: 'uppercase', fontSize: '11px', display: 'block', marginBottom: '4px' }}>DISPATCH / COURIER DETAILS:</strong>
                    <div><strong>Courier / Waybill:</strong> {selectedOrder.trackingReference || 'Pending Assignment'}</div>
                    <div><strong>Payment Status:</strong> {selectedOrder.paymentStatus.toUpperCase()}</div>
                    <div><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <th style={{ textAlign: 'left', padding: '6px 0' }}>Item Description</th>
                      <th style={{ textAlign: 'center', padding: '6px 0' }}>Size</th>
                      <th style={{ textAlign: 'center', padding: '6px 0' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '6px 0' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map(it => (
                      <tr key={it.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '6px 0' }}>{it.productNameSnapshot}</td>
                        <td style={{ textAlign: 'center', padding: '6px 0' }}>{it.variantNameSnapshot}</td>
                        <td style={{ textAlign: 'center', padding: '6px 0' }}>{it.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '6px 0' }}>{formatNaira(it.subtotalKobo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ textAlign: 'right', fontSize: '13px', borderTop: '2px solid #000', paddingTop: '8px' }}>
                  <div>Delivery Fee: {selectedOrder.deliveryFeeKobo === 0 ? 'FREE' : formatNaira(selectedOrder.deliveryFeeKobo)}</div>
                  <div style={{ fontSize: '15px', fontWeight: 900, marginTop: '4px' }}>Total Paid: {formatNaira(selectedOrder.totalKobo)}</div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => window.print()} className="btn btn-sm btn-primary">
                    🖨 Send to Printer
                  </button>
                  <button onClick={() => setShowWaybill(false)} className="btn btn-sm btn-outline">
                    Back to Order Details
                  </button>
                </div>
              </div>
            ) : null}

            {/* Customer & Address Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: '0.88rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Customer Contact</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{selectedOrder.customerName}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedOrder.customerEmail}</div>
                <div style={{ fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{selectedOrder.customerPhone}</span>
                  {selectedOrder.customerPhone && (
                    <a
                      href={formatWhatsAppUrl(selectedOrder.customerPhone, selectedOrder.customerName, selectedOrder.orderReference)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappBtn}
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                    >
                      WhatsApp 💬
                    </a>
                  )}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Delivery Address</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.deliveryAddress}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedOrder.deliveryCity}, {selectedOrder.deliveryState}</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, marginTop: '0.4rem' }}>
                  Delivery Fee: {selectedOrder.deliveryFeeKobo === 0 ? 'FREE' : formatNaira(selectedOrder.deliveryFeeKobo)}
                </div>
              </div>
            </div>

            {/* Stepper Status Buttons */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Fulfillment Pipeline
              </label>
              <div className={styles.stepperContainer}>
                {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as FulfillmentStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedOrder.orderReference, st)}
                    disabled={selectedOrder.paymentStatus !== 'paid' && st !== 'cancelled'}
                    className={`${styles.stepBtn} ${selectedOrder.fulfillmentStatus === st ? styles.stepBtnActive : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking Reference & Dispatch Email Action */}
            <div style={{ marginBottom: 'var(--space-6)', background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                🚀 Courier Waybill / Tracking & Automated Dispatch Email
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <select
                  value={courierSelect}
                  onChange={e => setCourierSelect(e.target.value)}
                  className={styles.statusSelect}
                  style={{ minWidth: '150px' }}
                >
                  {COURIER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                  placeholder="e.g. 10928472 or Lagos Rider #04"
                  style={{ flex: 1, minWidth: '180px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={handleSaveTrackingAndDispatch}
                  disabled={savingOrder || selectedOrder.paymentStatus !== 'paid'}
                  className="btn btn-sm btn-sky"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {savingOrder ? 'Updating…' : 'Mark Shipped & Send Email ✉'}
                </button>
              </div>

              {selectedOrder.trackingReference && (
                <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '0.25rem' }}>
                  <strong>Current Assigned Reference:</strong> {selectedOrder.trackingReference}
                </div>
              )}
            </div>

            {/* Line items */}
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
              Ordered Items ({selectedOrder.items?.length || 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              {selectedOrder.items?.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <div>
                    <strong>{it.productNameSnapshot}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size: <strong>{it.variantNameSnapshot}</strong> · Qty: {it.quantity}</div>
                  </div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{formatNaira(it.subtotalKobo)}</strong>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-5)', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Subtotal</span><span>{formatNaira(selectedOrder.subtotalKobo)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Delivery Fee</span><span>{selectedOrder.deliveryFeeKobo === 0 ? 'FREE' : formatNaira(selectedOrder.deliveryFeeKobo)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.05rem', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <span>Total Amount</span><span style={{ color: 'var(--accent-primary)' }}>{formatNaira(selectedOrder.totalKobo)}</span>
              </div>
            </div>

            {/* Email Resend Actions */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                Customer Communication
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleResendOrderEmail('confirmation')}
                  disabled={resendingEmail}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  {resendingEmail ? 'Dispatching…' : '↻ Resend Order Receipt'}
                </button>
                <button
                  onClick={() => handleResendOrderEmail('shipped')}
                  disabled={resendingEmail || selectedOrder.fulfillmentStatus !== 'shipped'}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  {resendingEmail ? 'Dispatching…' : '↻ Resend Waybill/Shipping Email'}
                </button>
              </div>
            </div>

            {/* Staff Notes */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>Staff Notes</div>
              {orderNotes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  {orderNotes.map(n => (
                    <div key={n.id} style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', fontSize: '0.82rem' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{n.adminName} · {formatDate(n.createdAt)}</div>
                      {n.note}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add an internal note for staff…"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
                <button onClick={handleAddNote} disabled={savingOrder || !newNote.trim()} className="btn btn-sm btn-sky">Add Note</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────
// Delivery Tab Component
// ──────────────────────────────────────────────────

function DeliveryTab({ onToast }: { onToast: (msg: string, type?: 'ok' | 'err') => void }) {
  const [zones, setZones] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [feeInput, setFeeInput] = React.useState('');
  const [thresholdInput, setThresholdInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/admin/delivery').then(r => r.json()).then(d => { setZones(d.zones || []); setLoading(false); });
  }, []);

  const startEdit = (zone: any) => {
    setEditingId(zone.id);
    setFeeInput(String(zone.feeKobo / 100));
    setThresholdInput(zone.freeThresholdKobo !== null ? String(zone.freeThresholdKobo / 100) : '');
  };

  const saveEdit = async (zone: any) => {
    setSaving(true);
    const feeKobo = Math.round(parseFloat(feeInput || '0') * 100);
    const freeThresholdKobo = thresholdInput ? Math.round(parseFloat(thresholdInput) * 100) : null;

    const res = await fetch('/api/admin/delivery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: zone.id, feeKobo, freeThresholdKobo }),
    });
    if (res.ok) {
      const d = await res.json();
      setZones(d.zones || []);
      setEditingId(null);
      onToast('Delivery zone updated');
    } else {
      onToast('Failed to update zone', 'err');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading delivery zones…</div>;

  return (
    <div>
      <p style={{ marginBottom: 'var(--space-4)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        Configure delivery fees for each zone. Changes apply to all new orders immediately.
        Fees shown in Naira (₦). Leave the free threshold blank to disable free delivery for that zone.
      </p>
      <div className="tableCard" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Zone</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Delivery Fee (₦)</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Free Threshold (₦)</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(zone => (
              <tr key={zone.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-4)' }}>
                  <strong>{zone.zoneName}</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Match: {zone.stateMatch}</div>
                  {!zone.isActive && <span className="badge badge-outline" style={{ marginTop: '0.25rem' }}>Inactive</span>}
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  {editingId === zone.id
                    ? <input type="number" value={feeInput} onChange={e => setFeeInput(e.target.value)} min="0" step="100" style={{ width: '120px', padding: '0.35rem 0.5rem', fontSize: '0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    : <strong>₦{(zone.feeKobo / 100).toLocaleString()}</strong>
                  }
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  {editingId === zone.id
                    ? <input type="number" value={thresholdInput} onChange={e => setThresholdInput(e.target.value)} min="0" step="100" placeholder="No threshold" style={{ width: '140px', padding: '0.35rem 0.5rem', fontSize: '0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    : zone.freeThresholdKobo !== null ? <span style={{ color: '#10b981', fontWeight: 700 }}>₦{(zone.freeThresholdKobo / 100).toLocaleString()} → FREE</span> : <span style={{ color: 'var(--text-muted)' }}>No free threshold</span>
                  }
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  {editingId === zone.id ? (
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button onClick={() => saveEdit(zone)} disabled={saving} className="btn btn-sm btn-sky">Save</button>
                      <button onClick={() => setEditingId(null)} className="btn btn-sm btn-outline">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(zone)} className="btn btn-sm btn-outline">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Settings Tab Component
// ──────────────────────────────────────────────────

function SettingsTab({ onToast }: { onToast: (msg: string, type?: 'ok' | 'err') => void }) {
  const [settings, setSettings] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      setSettings(d.settings || {});
      setForm(d.settings || {});
      setLoading(false);
    });
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      onToast(`Settings saved (${d.updated?.length || 0} updated)`);
      setSettings(form);
    } else {
      onToast('Failed to save settings', 'err');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings…</div>;

  const Field = ({ label, settingKey, type = 'text', placeholder = '' }: { label: string; settingKey: string; type?: string; placeholder?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{label}</label>
      {type === 'textarea'
        ? <textarea value={form[settingKey] || ''} onChange={e => handleChange(settingKey, e.target.value)} rows={3} placeholder={placeholder} style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', resize: 'vertical', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
        : <input type={type} value={form[settingKey] || ''} onChange={e => handleChange(settingKey, e.target.value)} placeholder={placeholder} style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
      }
    </div>
  );

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>Brand & Contact</h3>
        <Field label="Store Name" settingKey="store_name" />
        <Field label="Support Email" settingKey="support_email" type="email" placeholder="orders@deendrip.shop" />
        <Field label="Support Phone" settingKey="support_phone" placeholder="+234 906 414 7689" />

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0' }} />
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Storefront Announcement Bar</h3>
        <Field label="Announcement Bar Text" settingKey="announcement_bar" placeholder="FREE delivery on Lagos orders above ₦85,000" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Announcement Bar Enabled</label>
          <select value={form.announcement_bar_enabled || '1'} onChange={e => handleChange('announcement_bar_enabled', e.target.value)} style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <option value="1">Enabled</option>
            <option value="0">Disabled</option>
          </select>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0' }} />
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social Links</h3>
        <Field label="Instagram URL" settingKey="instagram_url" placeholder="https://instagram.com/deendrip" />
        <Field label="Twitter/X URL" settingKey="twitter_url" placeholder="https://twitter.com/deendrip" />

        <button onClick={handleSave} disabled={saving} className="btn btn-sky" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}>
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
