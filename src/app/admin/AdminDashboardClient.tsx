'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Mail,
  BarChart3,
  Settings,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Truck,
  AlertTriangle,
  RotateCcw,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  Printer,
  Sparkles,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from './admin-dashboard.module.css';

// Repo Layer
import {
  getDashboardMetrics,
  getOrders,
  getProducts,
  getCustomers,
  getEmailTemplates,
  getFollowUpRules,
  getDueFollowUps,
  updateOrder,
  simulateNextDeliveryStep,
  updateProduct,
  addProduct,
  deleteProduct,
  toggleFollowUpRule,
  dismissDueFollowUp,
  resetStore,
} from '@/lib/repo';
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
} from '@/lib/repo/types';

// Subcomponents
import SalesChart from '@/components/admin/SalesChart';
import OrderDrawer from '@/components/admin/OrderDrawer';
import ProductDrawer from '@/components/admin/ProductDrawer';
import CustomerDrawer from '@/components/admin/CustomerDrawer';
import EmailComposerDrawer from '@/components/admin/EmailComposerDrawer';
import CommandPalette from '@/components/admin/CommandPalette';

interface AdminDashboardClientProps {
  adminName: string;
  adminRole: string;
}

type NavTab = 'dashboard' | 'orders' | 'products' | 'customers' | 'email' | 'analytics' | 'settings';

export default function AdminDashboardClient({ adminName, adminRole }: AdminDashboardClientProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Data states
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [heroRevenueKobo, setHeroRevenueKobo] = useState(0);
  const [salesChartData, setSalesChartData] = useState<SalesDataPoint[]>([]);
  const [pipeline, setPipeline] = useState<Record<FulfillmentStage, number>>({ new: 0, packing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);

  // Entities
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [followUpRules, setFollowUpRules] = useState<FollowUpRule[]>([]);
  const [dueFollowUps, setDueFollowUps] = useState<DueFollowUp[]>([]);

  // Drawers
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [emailTargetCustomer, setEmailTargetCustomer] = useState<AdminCustomer | AdminOrder | null>(null);

  // Filter & Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<FulfillmentStage | 'all'>('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productViewMode, setProductViewMode] = useState<'table' | 'grid'>('table');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState('all');

  // Inline editing state for product table
  const [inlineEditingStockId, setInlineEditingStockId] = useState<string | null>(null);
  const [inlineStockVal, setInlineStockVal] = useState('');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Keyboard navigation shortcuts (G then O, G then D, etc.)
  useEffect(() => {
    let lastKey = '';
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === '?') {
        setShowKeyboardHelp(prev => !prev);
        return;
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        setIsProductDrawerOpen(true);
        setSelectedProduct(null);
        return;
      }
      if (lastKey === 'g') {
        if (e.key === 'd') setActiveTab('dashboard');
        if (e.key === 'o') setActiveTab('orders');
        if (e.key === 'p') setActiveTab('products');
        if (e.key === 'c') setActiveTab('customers');
        lastKey = '';
        return;
      }
      if (e.key === 'g') {
        lastKey = 'g';
        setTimeout(() => { lastKey = ''; }, 1000);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Initial Data Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dash, ords, prods, custs, tpls, rules, due] = await Promise.all([
        getDashboardMetrics('30d'),
        getOrders({ limit: 60 }),
        getProducts(),
        getCustomers(),
        getEmailTemplates(),
        getFollowUpRules(),
        getDueFollowUps(),
      ]);

      setKpis(dash.kpis);
      setHeroRevenueKobo(dash.heroRevenueKobo);
      setSalesChartData(dash.salesChart);
      setPipeline(dash.pipeline);
      setNeedsAttention(dash.needsAttention);
      setOrders(ords.orders);
      setProducts(prods);
      setCustomers(custs);
      setEmailTemplates(tpls);
      setFollowUpRules(rules);
      setDueFollowUps(due);
    } catch {
      showToast('Error syncing repository store', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for Orders
  const handleUpdateOrder = async (orderId: string, updates: Partial<AdminOrder>) => {
    const updated = await updateOrder(orderId, updates);
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
    if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
    showToast(`Order #${updated.orderNumber} updated`);
  };

  const handleSimulateStep = async (orderId: string) => {
    const updated = await simulateNextDeliveryStep(orderId);
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
    if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
    showToast(`Order #${updated.orderNumber} advanced to ${updated.fulfillmentStatus}`);
  };

  // Handlers for Products
  const handleSaveProduct = async (productData: any) => {
    if (selectedProduct) {
      const updated = await updateProduct(selectedProduct.id, productData);
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      showToast(`Product ${updated.title} updated`);
    } else {
      const created = await addProduct(productData);
      setProducts(prev => [created, ...prev]);
      showToast(`Product ${created.title} created`);
    }
    setIsProductDrawerOpen(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    await deleteProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast(`Deleted ${prod?.title || 'product'}`);
  };

  const handleSaveInlineStock = async (prodId: string) => {
    const newStock = parseInt(inlineStockVal, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      const updated = await updateProduct(prodId, { stock: newStock });
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      showToast(`Stock updated to ${newStock}`);
    }
    setInlineEditingStockId(null);
  };

  // Handlers for Follow-up Rules
  const handleToggleRule = async (ruleId: string) => {
    const updated = await toggleFollowUpRule(ruleId);
    setFollowUpRules(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    showToast(`Rule ${updated.isEnabled ? 'activated' : 'deactivated'}`);
  };

  const handleDismissDueFollowUp = async (id: string) => {
    await dismissDueFollowUp(id);
    setDueFollowUps(prev => prev.filter(d => d.id !== id));
    showToast('Follow-up dismissed');
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase();
    const matchQ = !q || o.orderNumber.includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q);
    const matchStatus = orderStatusFilter === 'all' || o.fulfillmentStatus === orderStatusFilter;
    return matchQ && matchStatus;
  });

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchQ && matchCat;
  });

  // Filtered Customers
  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const matchSeg = customerSegmentFilter === 'all' || c.segment === customerSegmentFilter;
    return matchQ && matchSeg;
  });

  const formatNgn = (kobo: number) => `₦${(kobo / 100).toLocaleString('en-NG')}`;

  return (
    <div className={styles.adminRoot}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 9999,
          padding: '10px 16px', borderRadius: '10px',
          backgroundColor: toast.type === 'ok' ? '#0A0A0A' : '#EF4444',
          color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
          border: '1px solid #27272A', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>{toast.type === 'ok' ? '✓' : '⚠'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR (240px) ── */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <a href="/admin" className={styles.brandWrap}>
            <div className={styles.brandIcon}>DD</div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.04em' }}>DEEN DRIP</div>
                <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Admin Operations</div>
              </div>
            )}
          </a>
        </div>

        <nav className={styles.navSection}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
          >
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`}
          >
            <ShoppingBag size={18} />
            {!sidebarCollapsed && <span>Orders</span>}
            {!sidebarCollapsed && pipeline.new > 0 && <span className={styles.navBadge}>{pipeline.new}</span>}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`${styles.navItem} ${activeTab === 'products' ? styles.navItemActive : ''}`}
          >
            <Package size={18} />
            {!sidebarCollapsed && <span>Products</span>}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`${styles.navItem} ${activeTab === 'customers' ? styles.navItemActive : ''}`}
          >
            <Users size={18} />
            {!sidebarCollapsed && <span>Customers</span>}
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`${styles.navItem} ${activeTab === 'email' ? styles.navItemActive : ''}`}
          >
            <Mail size={18} />
            {!sidebarCollapsed && <span>Email & Follow-ups</span>}
            {!sidebarCollapsed && dueFollowUps.length > 0 && <span className={styles.navBadge}>{dueFollowUps.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`${styles.navItem} ${activeTab === 'analytics' ? styles.navItemActive : ''}`}
          >
            <BarChart3 size={18} />
            {!sidebarCollapsed && <span>Analytics</span>}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.navItemActive : ''}`}
          >
            <Settings size={18} />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => toggleTheme()}
              className={styles.btnSecondary}
              style={{ padding: '6px 10px', height: '32px', fontSize: '12px' }}
              title="Toggle Light / Dark mode"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {!sidebarCollapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
            </button>
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className={styles.btnSecondary}
              style={{ padding: '6px 8px', height: '32px' }}
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle size={14} />
            </button>
          </div>

          {!sidebarCollapsed && (
            <div style={{ fontSize: '11px', color: 'var(--admin-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
              <span>{adminName}</span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Command Palette Trigger */}
            <div
              className={styles.searchTrigger}
              onClick={() => setCommandPaletteOpen(true)}
              role="button"
              tabIndex={0}
            >
              <Search size={14} />
              <span>Search or type command…</span>
              <kbd className={styles.kbd}>⌘K</kbd>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
              style={{ padding: '6px 12px', height: '34px', fontSize: '12px' }}
            >
              <span>Storefront</span>
              <ExternalLink size={12} />
            </a>
            <button
              onClick={() => { setIsProductDrawerOpen(true); setSelectedProduct(null); }}
              className={styles.btnPrimary}
              style={{ padding: '6px 14px', height: '34px', fontSize: '12px' }}
            >
              <Plus size={14} />
              <span>New Product</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className={styles.pageBody}>
          {/* ══════════════════════════════════════════════════════════════
              MODULE 1: DASHBOARD HOME (Max 6 calm blocks)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Block 1: Revenue Hero Card */}
              <div className={styles.cardHero} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#A1A1AA', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Verified Gross Revenue
                    </span>
                    <div className={styles.tabular} style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '4px' }}>
                      {formatNgn(heroRevenueKobo)}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.15)', padding: '4px 10px', borderRadius: '9999px', fontWeight: 700 }}>
                    +14.2% vs last 30d
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', color: '#A1A1AA' }}>
                  <span>Currency: <strong>NGN (₦)</strong></span>
                  <span>Store: <strong>Deen Drip Lagos</strong></span>
                  <span>Status: <strong style={{ color: '#10B981' }}>Live</strong></span>
                </div>
              </div>

              {/* Block 2: KPI Row (4 cards) */}
              <div className={styles.kpiGrid}>
                {kpis.map((kpi) => (
                  <div key={kpi.title} className={styles.kpiCard}>
                    <span className={styles.kpiTitle}>{kpi.title}</span>
                    <span className={`${styles.kpiValue} ${styles.tabular}`}>{kpi.value}</span>
                    <span className={`${styles.kpiDelta} ${kpi.trend === 'up' ? styles.kpiDeltaUp : styles.kpiDeltaDown}`}>
                      {kpi.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>+{kpi.deltaPercent}%</span>
                      <span style={{ color: 'var(--admin-muted)', fontWeight: 400, marginLeft: '4px' }}>{kpi.description}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Block 3: Order Pipeline Ribbon (Clickable stages) */}
              <div className={styles.pipelineRow}>
                {[
                  { stage: 'new' as const, label: 'New Orders', count: pipeline.new, desc: 'Awaiting packing' },
                  { stage: 'packing' as const, label: 'Packing', count: pipeline.packing, desc: 'In inspection hub' },
                  { stage: 'shipped' as const, label: 'Shipped', count: pipeline.shipped, desc: 'In transit with courier' },
                  { stage: 'delivered' as const, label: 'Delivered', count: pipeline.delivered, desc: 'Completed orders' },
                ].map((item) => (
                  <div
                    key={item.stage}
                    onClick={() => {
                      setOrderStatusFilter(item.stage);
                      setActiveTab('orders');
                    }}
                    className={styles.pipelineStage}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                        {item.label}
                      </span>
                      <span className={`${styles.tabular}`} style={{ fontSize: '18px', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {item.count}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '4px' }}>{item.desc} →</span>
                  </div>
                ))}
              </div>

              {/* Block 4: Sales Chart with Toggle & Table Alternative */}
              <SalesChart data={salesChartData} />

              {/* Two Column Grid for Block 5 & Block 6 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                {/* Block 5: Recent 5 Orders */}
                <div className={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '11px', height: '26px' }}>
                      View all ({orders.length}) →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {orders.slice(0, 5).map((o) => (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-border-subtle)', cursor: 'pointer', transition: 'background 150ms' }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700 }}>#{o.orderNumber} — {o.customerName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>{o.items.length} items · {o.deliveryCity}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={styles.tabular} style={{ fontSize: '13px', fontWeight: 700 }}>{formatNgn(o.totalKobo)}</div>
                          <span className={`${styles.badge} ${o.fulfillmentStatus === 'shipped' ? styles.badgeShipped : styles.badgePaid}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {o.fulfillmentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Block 6: Needs Attention List (max 4 items) */}
                <div className={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--admin-text)' }}>Needs Attention</h3>
                    <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>{needsAttention.length} urgent</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {needsAttention.map((item) => (
                      <div key={item.id} style={{ padding: '12px', borderRadius: '10px', background: 'var(--admin-canvas)', border: '1px solid var(--admin-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '2px' }}>{item.subtitle}</div>
                          </div>
                          <button
                            onClick={() => {
                              if (item.linkTab === 'products') setActiveTab('products');
                              if (item.linkTab === 'orders') setActiveTab('orders');
                              if (item.linkTab === 'email') setActiveTab('email');
                            }}
                            className={styles.btnSecondary}
                            style={{ padding: '4px 8px', fontSize: '11px', height: '26px' }}
                          >
                            {item.actionText}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MODULE 2: ORDERS TABLE & MANAGEMENT
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>Orders</h2>
                  <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>Manage fulfillment and courier dispatches</span>
                </div>
              </div>

              {/* Filter Row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="search"
                  placeholder="Filter by order #, customer, email, phone…"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', width: '280px' }}
                />

                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                  {(['all', 'new', 'packing', 'shipped', 'delivered', 'cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: orderStatusFilter === st ? 600 : 500,
                        borderRadius: '9999px',
                        border: '1px solid var(--admin-border)',
                        background: orderStatusFilter === st ? 'var(--admin-ink)' : 'var(--admin-surface)',
                        color: orderStatusFilter === st ? '#fff' : 'var(--admin-muted)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Location</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Fulfillment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className={styles.tableRow} onClick={() => setSelectedOrder(o)} style={{ cursor: 'pointer' }}>
                        <td><strong>#{o.orderNumber}</strong></td>
                        <td style={{ color: 'var(--admin-muted)', fontSize: '12px' }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div><strong>{o.customerName}</strong></div>
                          <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>{o.customerEmail}</div>
                        </td>
                        <td>{o.deliveryCity}, {o.deliveryState}</td>
                        <td>{o.items.length}</td>
                        <td className={styles.tabular} style={{ fontWeight: 700 }}>{formatNgn(o.totalKobo)}</td>
                        <td>
                          <span className={`${styles.badge} ${o.paymentStatus === 'paid' ? styles.badgePaid : styles.badgePending}`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${o.fulfillmentStatus === 'shipped' ? styles.badgeShipped : styles.badgePending}`}>
                            {o.fulfillmentStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                            className={styles.btnSecondary}
                            style={{ padding: '4px 10px', height: '28px', fontSize: '11px' }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MODULE 3: PRODUCTS (Table/Grid + Inline Edit)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>Products</h2>
                  <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>Inventory catalog, inline pricing, and stock control</span>
                </div>
                <button
                  onClick={() => { setIsProductDrawerOpen(true); setSelectedProduct(null); }}
                  className={styles.btnSky}
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Search & Category Filter */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="search"
                  placeholder="Search products by title, SKU…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', width: '280px' }}
                />
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                >
                  <option value="all">All Categories</option>
                  <option value="tees">Tees</option>
                  <option value="caps">Caps</option>
                  <option value="hoodies-polos">Hoodies & Polos</option>
                  <option value="trousers">Trousers</option>
                  <option value="tracksuits">Tracksuits</option>
                  <option value="shirts">Shirts</option>
                </select>
                <span style={{ fontSize: '12px', color: 'var(--admin-muted)', marginLeft: 'auto' }}>
                  {filteredProducts.length} items
                </span>
              </div>

              {/* Products Table with Inline Stock / Price edit */}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock (Click to Edit)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className={styles.tableRow}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', position: 'relative', backgroundColor: 'var(--admin-canvas)', flexShrink: 0 }}>
                              {p.images[0] && (
                                <Image src={p.images[0]} alt={p.title} fill sizes="40px" style={{ objectFit: 'cover' }} />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{p.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>{p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>{p.category}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.sku}</td>
                        <td className={styles.tabular} style={{ fontWeight: 700 }}>
                          {formatNgn(p.priceKobo)}
                        </td>
                        <td>
                          {inlineEditingStockId === p.id ? (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <input
                                autoFocus
                                type="number"
                                value={inlineStockVal}
                                onChange={(e) => setInlineStockVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineStock(p.id);
                                  if (e.key === 'Escape') setInlineEditingStockId(null);
                                }}
                                style={{ width: '60px', padding: '3px 6px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--admin-sky-500)' }}
                              />
                              <button onClick={() => handleSaveInlineStock(p.id)} className={styles.btnSky} style={{ padding: '2px 6px', fontSize: '11px', height: '24px' }}>✓</button>
                            </div>
                          ) : (
                            <span
                              onClick={() => { setInlineEditingStockId(p.id); setInlineStockVal(p.stock.toString()); }}
                              style={{
                                cursor: 'pointer',
                                fontWeight: 700,
                                color: p.stock === 0 ? '#EF4444' : p.stock <= p.lowStockThreshold ? '#F59E0B' : 'inherit',
                                borderBottom: '1px dashed var(--admin-border)',
                                paddingBottom: '1px'
                              }}
                              title="Click to inline-edit stock"
                            >
                              {p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`${styles.badge} ${p.status === 'active' ? styles.badgePaid : styles.badgePending}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => { setSelectedProduct(p); setIsProductDrawerOpen(true); }}
                            className={styles.btnSecondary}
                            style={{ padding: '4px 10px', height: '28px', fontSize: '11px' }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MODULE 4: CUSTOMERS
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>Customers</h2>
                  <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>Audience directory and lifetime spend tracking</span>
                </div>
              </div>

              {/* Search & Segments */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="search"
                  placeholder="Search customer name, email, phone…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', width: '280px' }}
                />

                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                  {(['all', 'vip', 'repeat', 'new', 'at_risk', 'never_ordered'] as const).map((seg) => (
                    <button
                      key={seg}
                      onClick={() => setCustomerSegmentFilter(seg)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: customerSegmentFilter === seg ? 600 : 500,
                        borderRadius: '9999px',
                        border: '1px solid var(--admin-border)',
                        background: customerSegmentFilter === seg ? 'var(--admin-ink)' : 'var(--admin-surface)',
                        color: customerSegmentFilter === seg ? '#fff' : 'var(--admin-muted)',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                      }}
                    >
                      {seg.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Orders</th>
                      <th>Total Spend (LTV)</th>
                      <th>Segment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className={styles.tableRow} onClick={() => { setSelectedCustomer(c); setIsCustomerDrawerOpen(true); }} style={{ cursor: 'pointer' }}>
                        <td><strong>{c.name}</strong></td>
                        <td style={{ color: 'var(--admin-muted)' }}>{c.email}</td>
                        <td>{c.city}, {c.state}</td>
                        <td className={styles.tabular}>{c.totalOrders}</td>
                        <td className={styles.tabular} style={{ fontWeight: 700, color: 'var(--admin-sky-700)' }}>
                          {formatNgn(c.totalSpentKobo)}
                        </td>
                        <td>
                          <span className={styles.badge} style={{ textTransform: 'uppercase', backgroundColor: 'var(--admin-sky-100)', color: 'var(--admin-sky-700)' }}>
                            {c.segment}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); setIsCustomerDrawerOpen(true); }}
                            className={styles.btnSecondary}
                            style={{ padding: '4px 10px', height: '28px', fontSize: '11px' }}
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MODULE 5: EMAIL & FOLLOW-UPS
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'email' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>Email & Follow-ups</h2>
                  <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>Automated engagement rules and personalized AI campaigns</span>
                </div>
                <button
                  onClick={() => setIsEmailComposerOpen(true)}
                  className={styles.btnSky}
                >
                  <Mail size={16} />
                  <span>Compose Email</span>
                </button>
              </div>

              {/* Follow-ups Due Today */}
              <div className={styles.card} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Follow-ups Due Today ({dueFollowUps.length})</h3>
                  <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Automated retention queues</span>
                </div>
                {dueFollowUps.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--admin-muted)', margin: 0 }}>All automated customer follow-ups for today are clear.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {dueFollowUps.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'var(--admin-canvas)', border: '1px solid var(--admin-border)' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.customerName} ({item.customerEmail})</div>
                          <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '2px' }}>{item.ruleTitle} · Due {item.dueDate}</div>
                          <div style={{ fontSize: '12px', color: 'var(--admin-text)', marginTop: '4px', fontStyle: 'italic' }}>
                            "{item.previewMessage}"
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              const found = customers.find(c => c.email === item.customerEmail);
                              setEmailTargetCustomer(found || null);
                              setIsEmailComposerOpen(true);
                            }}
                            className={styles.btnSky}
                            style={{ padding: '4px 10px', height: '28px', fontSize: '11px' }}
                          >
                            Review & Send
                          </button>
                          <button
                            onClick={() => handleDismissDueFollowUp(item.id)}
                            className={styles.btnSecondary}
                            style={{ padding: '4px 10px', height: '28px', fontSize: '11px' }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Automation Rules */}
              <div className={styles.card}>
                <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700 }}>Automated Follow-up Rules</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {followUpRules.map((rule) => (
                    <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{rule.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--admin-muted)', marginTop: '2px' }}>{rule.description}</div>
                      </div>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={rule.isEnabled ? styles.btnSky : styles.btnSecondary}
                        style={{ padding: '4px 12px', height: '30px', fontSize: '12px' }}
                      >
                        {rule.isEnabled ? 'Active' : 'Paused'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MODULE 6: ANALYTICS
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>Analytics & Reports</h2>
                <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>Commercial sales velocity, channels, and conversion metrics</span>
              </div>

              <SalesChart data={salesChartData} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {/* Revenue by Channel */}
                <div className={styles.card}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700 }}>Revenue by Channel</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Direct Web</span>
                      <strong className={styles.tabular}>58%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Instagram Direct</span>
                      <strong className={styles.tabular}>24%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>WhatsApp Storefront</span>
                      <strong className={styles.tabular}>14%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Search & Organic</span>
                      <strong className={styles.tabular}>4%</strong>
                    </div>
                  </div>
                </div>

                {/* Orders by Status */}
                <div className={styles.card}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700 }}>Orders by Stage</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Delivered</span>
                      <strong className={styles.tabular}>{pipeline.delivered}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shipped / Transit</span>
                      <strong className={styles.tabular}>{pipeline.shipped}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Packing Hub</span>
                      <strong className={styles.tabular}>{pipeline.packing}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>New Unfulfilled</span>
                      <strong className={styles.tabular}>{pipeline.new}</strong>
                    </div>
                  </div>
                </div>

                {/* Conversion Funnel */}
                <div className={styles.card}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700 }}>Conversion Funnel</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Session to Product</span>
                      <strong className={styles.tabular}>62.4%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Product to Cart</span>
                      <strong className={styles.tabular}>18.2%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cart to Checkout</span>
                      <strong className={styles.tabular}>54.1%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                      <span>Total Conversion</span>
                      <strong className={styles.tabular}>3.68%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MODULE 7: SETTINGS (Anchored single scrollable page)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '720px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>Store Settings</h2>
                <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>Storefront configuration and operational parameters</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Store Profile */}
                <div className={styles.card}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700 }}>Store Profile</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>Store Name</label>
                      <input type="text" defaultValue="Deen Drip Lagos" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>Operating Currency</label>
                        <input type="text" disabled value="NGN (₦)" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-canvas)', color: 'var(--admin-muted)' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>Default Dispatch City</label>
                        <input type="text" defaultValue="Lagos, Nigeria" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Dispatch Configuration */}
                <div className={styles.card}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700 }}>Live Transactional Email Service</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--admin-muted)' }}>
                    Customer receipts and waybill dispatches send from <strong>Deen Drip &lt;orders@deendrip.shop&gt;</strong> authenticated via Resend DKIM/SPF.
                  </p>
                  <div style={{ background: 'var(--admin-canvas)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                    ✓ Domain Verified & Active on deendrip.shop
                  </div>
                </div>

                {/* Reset Store Data */}
                <div className={styles.card} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#EF4444' }}>Development Store Reset</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--admin-muted)' }}>
                    Re-seed the in-memory/localStorage store with the 60 orders, 40 products, 80 customers, and 12-month analytics dataset.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Re-seed the store with fresh sample data?')) {
                        resetStore();
                        loadAllData();
                        showToast('Store reset to initial seed');
                      }
                    }}
                    className={styles.btnSecondary}
                    style={{ color: '#EF4444', borderColor: '#EF4444' }}
                  >
                    Reset & Re-Seed Dataset
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION (<768px) ── */}
      <nav className={styles.bottomNav}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${styles.bottomNavItem} ${activeTab === 'dashboard' ? styles.bottomNavItemActive : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`${styles.bottomNavItem} ${activeTab === 'orders' ? styles.bottomNavItemActive : ''}`}
        >
          <ShoppingBag size={18} />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`${styles.bottomNavItem} ${activeTab === 'products' ? styles.bottomNavItemActive : ''}`}
        >
          <Package size={18} />
          <span>Products</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`${styles.bottomNavItem} ${activeTab === 'customers' ? styles.bottomNavItemActive : ''}`}
        >
          <Users size={18} />
          <span>Customers</span>
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={styles.bottomNavItem}
        >
          <Search size={18} />
          <span>Search</span>
        </button>
      </nav>

      {/* ── SIDE DRAWERS ── */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={handleUpdateOrder}
        onSimulateStep={handleSimulateStep}
        onOpenEmailWithOrder={(ord) => {
          setEmailTargetCustomer(ord);
          setIsEmailComposerOpen(true);
        }}
      />

      <ProductDrawer
        product={selectedProduct}
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />

      <CustomerDrawer
        customer={selectedCustomer}
        orders={orders.filter(o => o.customerEmail.toLowerCase() === selectedCustomer?.email.toLowerCase())}
        isOpen={isCustomerDrawerOpen}
        onClose={() => setIsCustomerDrawerOpen(false)}
        onOpenEmail={(cust) => {
          setEmailTargetCustomer(cust);
          setIsEmailComposerOpen(true);
        }}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
      />

      <EmailComposerDrawer
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        templates={emailTemplates}
        customers={customers}
        initialRecipient={emailTargetCustomer}
        onSentSuccess={(msg) => showToast(msg)}
      />

      {/* ── GLOBAL COMMAND PALETTE (⌘K) ── */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={(tab) => setActiveTab(tab as NavTab)}
        orders={orders}
        products={products}
        customers={customers}
        onSelectOrder={(o) => setSelectedOrder(o)}
        onSelectCustomer={(c) => { setSelectedCustomer(c); setIsCustomerDrawerOpen(true); }}
        onOpenNewProduct={() => { setIsProductDrawerOpen(true); setSelectedProduct(null); }}
        onOpenEmailComposer={() => setIsEmailComposerOpen(true)}
      />

      {/* ── KEYBOARD SHORTCUTS HELP MODAL (?) ── */}
      {showKeyboardHelp && (
        <div className={styles.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowKeyboardHelp(false); }}>
          <div style={{ backgroundColor: 'var(--admin-surface)', borderRadius: '16px', maxWidth: '420px', width: '100%', margin: 'auto', padding: '24px', border: '1px solid var(--admin-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Keyboard Shortcuts</h3>
              <button onClick={() => setShowKeyboardHelp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Global Command Menu</span>
                <kbd className={styles.kbd}>⌘K / Ctrl+K</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Quick Search</span>
                <kbd className={styles.kbd}>/</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Add New Product</span>
                <kbd className={styles.kbd}>N</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Go to Dashboard</span>
                <kbd className={styles.kbd}>G then D</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Go to Orders</span>
                <kbd className={styles.kbd}>G then O</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Go to Products</span>
                <kbd className={styles.kbd}>G then P</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Go to Customers</span>
                <kbd className={styles.kbd}>G then C</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Keyboard Help</span>
                <kbd className={styles.kbd}>?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
