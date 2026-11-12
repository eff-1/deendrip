'use client';

import React from 'react';
import { X, Mail, Phone, ShoppingBag, MapPin, Tag } from 'lucide-react';
import type { AdminCustomer, AdminOrder } from '@/lib/repo/types';
import styles from '@/app/admin/admin-dashboard.module.css';

interface CustomerDrawerProps {
  customer: AdminCustomer | null;
  orders: AdminOrder[];
  isOpen: boolean;
  onClose: () => void;
  onOpenEmail: (customer: AdminCustomer) => void;
  onSelectOrder: (order: AdminOrder) => void;
}

export default function CustomerDrawer({
  customer,
  orders,
  isOpen,
  onClose,
  onOpenEmail,
  onSelectOrder,
}: CustomerDrawerProps) {
  if (!isOpen || !customer) return null;

  const formatNgn = (kobo: number) => `₦${(kobo / 100).toLocaleString('en-NG')}`;

  return (
    <div className={styles.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.drawerPanel}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--admin-surface)', zIndex: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{customer.name}</h3>
            <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Customer since {new Date(customer.createdAt).toLocaleDateString()}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--admin-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
          {/* Lifetime Value Metric Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.card} style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Lifetime Value</span>
              <div className={styles.tabular} style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', color: 'var(--admin-sky-700)' }}>
                {formatNgn(customer.totalSpentKobo)}
              </div>
            </div>
            <div className={styles.card} style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Orders</span>
              <div className={styles.tabular} style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>
                {customer.totalOrders}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onOpenEmail(customer)}
              className={styles.btnSky}
              style={{ flex: 1 }}
            >
              <Mail size={15} />
              <span>Compose Email</span>
            </button>
            <a
              href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=Salam%20${encodeURIComponent(customer.name)},%20this%20is%20Deen%20Drip.`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
              style={{ color: '#25D366' }}
            >
              <Phone size={15} />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Contact Details Card */}
          <div className={styles.card} style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Contact & Location</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} style={{ color: 'var(--admin-muted)' }} />
                <span>{customer.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} style={{ color: 'var(--admin-muted)' }} />
                <span>{customer.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} style={{ color: 'var(--admin-muted)' }} />
                <span>{customer.city}, {customer.state}</span>
              </div>
            </div>
          </div>

          {/* Tags & Segment */}
          <div className={styles.card} style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Segment & Tags</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span className={styles.badge} style={{ textTransform: 'uppercase', backgroundColor: 'var(--admin-sky-100)', color: 'var(--admin-sky-700)' }}>
                {customer.segment}
              </span>
              {customer.tags.map((t) => (
                <span key={t} className={styles.badge} style={{ backgroundColor: 'var(--admin-canvas)', border: '1px solid var(--admin-border)' }}>
                  <Tag size={10} style={{ marginRight: '4px' }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)' }}>
              Order History ({orders.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {orders.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--admin-muted)', padding: '16px 0' }}>
                  No orders placed yet.
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => { onSelectOrder(o); onClose(); }}
                    className={styles.card}
                    style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>Order #{o.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={styles.tabular} style={{ fontSize: '13px', fontWeight: 700 }}>{formatNgn(o.totalKobo)}</div>
                      <span className={`${styles.badge} ${o.fulfillmentStatus === 'shipped' ? styles.badgeShipped : styles.badgePaid}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {o.fulfillmentStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
