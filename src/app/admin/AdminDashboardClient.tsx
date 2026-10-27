'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Order, Product, FulfillmentStatus } from '@/lib/types';
import { formatNaira, formatDate } from '@/lib/formatters';
import styles from './admin.module.css';

interface AdminDashboardClientProps {
  orders: Order[];
  products: Product[];
  adminName: string;
  adminRole: string;
}

type TabId = 'overview' | 'orders' | 'products' | 'inventory' | 'delivery' | 'settings';

const FULFILLMENT_STATUSES: FulfillmentStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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
  const [savingOrder, setSavingOrder] = useState(false);

  // Inventory state
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const [isSavingStock, setIsSavingStock] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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

  const handleStatusChange = async (orderRef: string, newStatus: FulfillmentStatus) => {
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderReference: orderRef, fulfillmentStatus: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.orderReference === orderRef ? { ...o, fulfillmentStatus: newStatus } : o)));
        if (selectedOrder?.orderReference === orderRef) setSelectedOrder(prev => prev ? { ...prev, fulfillmentStatus: newStatus } : null);
        showToast('Status updated');
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update status', 'err');
      }
    } catch {
      showToast('Network error', 'err');
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder || !trackingInput.trim()) return;
    setSavingOrder(true);
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderReference: selectedOrder.orderReference, fulfillmentStatus: selectedOrder.fulfillmentStatus, trackingReference: trackingInput.trim() }),
      });
      if (res.ok) {
        setSelectedOrder(prev => prev ? { ...prev, trackingReference: trackingInput.trim() } : null);
        showToast('Tracking reference saved');
      } else {
        showToast('Failed to save tracking', 'err');
      }
    } finally {
      setSavingOrder(false);
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

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders', count: orders.length },
    { id: 'products', label: 'Products', count: products.length },
    { id: 'inventory', label: 'Inventory' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className={styles.container}>
      <div className="container">
        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: '1rem', right: '1rem', zIndex: 999,
            padding: '0.75rem 1.25rem',
            backgroundColor: toast.type === 'ok' ? 'var(--success)' : 'var(--danger)',
            color: '#fff', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', fontWeight: 700,
            boxShadow: 'var(--shadow-lg)', maxWidth: '320px',
          }}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className={styles.topBar}>
          <div>
            <span className="section-tag">[ AUTHENTICATED STAFF AREA ]</span>
            <h1 className={styles.title}>Deen Drip Operations</h1>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Signed in as <strong>{adminName}</strong> · {adminRole}
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
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Verified Revenue</span>
                <span className={styles.metricVal} style={{ color: 'var(--accent-primary)' }}>{formatNaira(totalRevenueKobo)}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Gross from confirmed payments</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Total Orders</span>
                <span className={styles.metricVal}>{orders.length}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{paidOrdersCount} paid · {cancelledOrdersCount} cancelled</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Pending Fulfillment</span>
                <span className={styles.metricVal} style={{ color: pendingShipmentsCount > 0 ? 'var(--warning)' : 'inherit' }}>{pendingShipmentsCount}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Paid orders awaiting dispatch</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Stock Alerts</span>
                <span className={styles.metricVal} style={{ color: (lowStockVariants.length + outOfStockVariants.length) > 0 ? 'var(--danger)' : 'inherit' }}>
                  {lowStockVariants.length + outOfStockVariants.length}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {outOfStockVariants.length} out · {lowStockVariants.length} low (≤10)
                </span>
              </div>
            </div>

            {/* Recent Orders */}
            <h2 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 'var(--space-4)', letterSpacing: '0.05em' }}>
              Recent Orders
            </h2>
            {orders.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-xs)' }}>
                No orders yet. Orders will appear here once customers complete checkout.
              </div>
            ) : (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map(order => (
                      <tr key={order.id} onClick={() => { setActiveTab('orders'); openOrderModal(order); }} style={{ cursor: 'pointer' }}>
                        <td><strong>{order.orderReference}</strong></td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.customerName}</td>
                        <td><strong>{formatNaira(order.totalKobo)}</strong></td>
                        <td><span className={`badge ${order.paymentStatus === 'paid' ? 'badge-sky' : 'badge-outline'}`}>{order.paymentStatus}</span></td>
                        <td><span className={`badge badge-outline`}>{order.fulfillmentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stock Alerts */}
            {outOfStockVariants.length > 0 && (
              <>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', margin: 'var(--space-8) 0 var(--space-4) 0', letterSpacing: '0.05em', color: 'var(--danger)' }}>
                  Out of Stock
                </h2>
                <div className={styles.tableCard}>
                  <table className={styles.table}>
                    <thead><tr><th>Product</th><th>SKU</th><th>Size</th><th>Stock</th></tr></thead>
                    <tbody>
                      {outOfStockVariants.slice(0, 10).map(v => {
                        const prod = products.find(p => p.id === v.productId);
                        return (
                          <tr key={v.id}>
                            <td>{prod?.name || v.productId}</td>
                            <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.75rem' }}>{v.sku}</td>
                            <td>{v.size}</td>
                            <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>0 — Out of Stock</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
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
                placeholder="Search by reference, name, email, phone…"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', width: '240px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
              <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value as any)} className={styles.statusSelect}>
                <option value="all">All Payment</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select value={fulfillmentFilter} onChange={e => setFulfillmentFilter(e.target.value as any)} className={styles.statusSelect}>
                <option value="all">All Fulfillment</option>
                {FULFILLMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{filteredOrders.length} of {orders.length} shown</span>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-xs)' }}>
                No orders match the current filters.
              </div>
            ) : (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Destination</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Fulfillment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.orderReference}</strong></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(order.createdAt)}</td>
                        <td>
                          <div>{order.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                        </td>
                        <td>{order.deliveryCity}, {order.deliveryState}</td>
                        <td><strong>{formatNaira(order.totalKobo)}</strong></td>
                        <td>
                          <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-sky' : order.paymentStatus === 'failed' ? '' : 'badge-outline'}`}
                            style={order.paymentStatus === 'failed' ? { background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid var(--danger)' } : {}}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.fulfillmentStatus}
                            onChange={e => handleStatusChange(order.orderReference, e.target.value as FulfillmentStatus)}
                            className={styles.statusSelect}
                            disabled={order.paymentStatus !== 'paid'}
                            title={order.paymentStatus !== 'paid' ? 'Order must be paid before updating fulfillment' : ''}
                          >
                            {FULFILLMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <button onClick={() => openOrderModal(order)} className="btn btn-outline btn-sm">
                            View
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

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <input
                type="search"
                placeholder="Search products…"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', width: '240px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{filteredProducts.length} products</span>
            </div>

            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Total Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const totalStock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
                    const primaryImg = product.images.find(i => i.isPrimary) || product.images[0];
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
                        <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{product.category}</td>
                        <td>
                          <strong>{formatNaira(product.priceKobo)}</strong>
                          {product.salePriceKobo && <div style={{ fontSize: '0.72rem', color: 'var(--success)' }}>Sale: {formatNaira(product.salePriceKobo)}</div>}
                        </td>
                        <td>
                          <span style={{ color: totalStock === 0 ? 'var(--danger)' : totalStock <= 10 ? 'var(--warning)' : 'inherit', fontWeight: 700 }}>
                            {totalStock === 0 ? 'Out of Stock' : `${totalStock} units`}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${product.isPublished ? 'badge-sky' : 'badge-outline'}`}>
                            {product.isPublished ? 'Published' : 'Draft'}
                          </span>
                          {product.isNewDrop && <span className="badge badge-sky" style={{ marginLeft: '0.25rem' }}>New</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handleTogglePublish(product)} className="btn btn-sm btn-outline" style={{ fontSize: '0.7rem' }}>
                              {product.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <a href={`/products/${product.slug}`} target="_blank" className="btn btn-sm btn-outline" style={{ fontSize: '0.7rem' }}>
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
                  <th>Variants & Stock</th>
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
                    <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{product.category}</td>
                    <td><strong>{formatNaira(product.priceKobo)}</strong></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {product.variants.map(v => (
                          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            <span style={{ width: '90px', fontWeight: 700, fontSize: '0.8rem' }}>Size {v.size}:</span>
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
                              style={{ padding: '0.25rem 0.65rem', fontSize: '0.7rem' }}
                            >
                              {isSavingStock === v.id ? 'Saving…' : 'Update'}
                            </button>
                            {v.stockQuantity === 0 && <span style={{ color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 700 }}>Out of Stock</span>}
                            {v.stockQuantity > 0 && v.stockQuantity <= 10 && <span style={{ color: 'var(--warning)', fontSize: '0.72rem', fontWeight: 700 }}>Low Stock</span>}
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

        {/* ── DELIVERY TAB ── */}
        {activeTab === 'delivery' && <DeliveryTab onToast={showToast} />}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && <SettingsTab onToast={showToast} />}

      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,10,12,0.7)', backdropFilter: 'blur(4px)', zIndex: 120, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--space-4)', overflowY: 'auto' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', maxWidth: '680px', width: '100%', padding: 'var(--space-8)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase' }}>Order #{selectedOrder.orderReference}</h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span className={`badge ${selectedOrder.paymentStatus === 'paid' ? 'badge-sky' : 'badge-outline'}`}>{selectedOrder.paymentStatus}</span>
                  <span className="badge badge-outline">{selectedOrder.fulfillmentStatus}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ fontSize: '1.25rem', color: 'var(--text-muted)', padding: '0.25rem', lineHeight: 1 }}>✕</button>
            </div>

            {/* Customer + Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Customer</div>
                <div style={{ fontWeight: 700 }}>{selectedOrder.customerName}</div>
                <div>{selectedOrder.customerEmail}</div>
                <div>{selectedOrder.customerPhone}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Ship To</div>
                <div>{selectedOrder.deliveryAddress}</div>
                <div>{selectedOrder.deliveryCity}, {selectedOrder.deliveryState}</div>
              </div>
            </div>

            {/* Payment info */}
            {selectedOrder.paymentReference && (
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Ref: </span>
                <code style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem' }}>{selectedOrder.paymentReference}</code>
                {selectedOrder.paidAt && <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>· Paid {formatDate(selectedOrder.paidAt)}</span>}
              </div>
            )}

            {/* Tracking reference input */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Tracking / Dispatch Reference
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                  placeholder="e.g. GIG-827441 or DHL tracking number"
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
                <button onClick={handleSaveTracking} disabled={savingOrder} className="btn btn-sm btn-outline">
                  Save
                </button>
              </div>
              {selectedOrder.trackingReference && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Current: {selectedOrder.trackingReference}</div>
              )}
            </div>

            {/* Line items */}
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Order Items</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              {selectedOrder.items?.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>{it.productNameSnapshot}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{it.variantNameSnapshot} × {it.quantity}</div>
                  </div>
                  <strong>{formatNaira(it.subtotalKobo)}</strong>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-5)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Subtotal</span><span>{formatNaira(selectedOrder.subtotalKobo)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Delivery</span><span>{selectedOrder.deliveryFeeKobo === 0 ? 'FREE' : formatNaira(selectedOrder.deliveryFeeKobo)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <span>Total</span><span style={{ color: 'var(--accent-primary)' }}>{formatNaira(selectedOrder.totalKobo)}</span>
              </div>
            </div>

            {/* Notes */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>Staff Notes</div>
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
                  placeholder="Add an internal note…"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
                <button onClick={handleAddNote} disabled={savingOrder || !newNote.trim()} className="btn btn-sm btn-sky">Add</button>
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
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Zone</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Delivery Fee (₦)</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Free Threshold (₦)</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Actions</th>
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
                    : zone.freeThresholdKobo !== null ? <span style={{ color: 'var(--success)' }}>₦{(zone.freeThresholdKobo / 100).toLocaleString()} → FREE</span> : <span style={{ color: 'var(--text-muted)' }}>No free threshold</span>
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
      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{label}</label>
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
        <Field label="Support Email" settingKey="support_email" type="email" placeholder="orders@deendrip.com" />
        <Field label="Support Phone" settingKey="support_phone" placeholder="+234 800 000 0000" />

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0' }} />
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Storefront Content</h3>
        <Field label="Announcement Bar Text" settingKey="announcement_bar" placeholder="FREE delivery on Lagos orders above ₦85,000" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Announcement Bar Enabled</label>
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
