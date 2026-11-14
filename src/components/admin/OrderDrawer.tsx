'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Printer,
  Mail,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Phone,
  FileText,
  UserCheck,
  Send,
  Navigation,
} from 'lucide-react';
import type { AdminOrder, FulfillmentStage } from '@/lib/repo/types';
import styles from '@/app/admin/admin-dashboard.module.css';

interface OrderDrawerProps {
  order: AdminOrder | null;
  onClose: () => void;
  onUpdateOrder: (orderId: string, updates: Partial<AdminOrder> & { note?: string; sendEmail?: boolean }) => Promise<void>;
  onSimulateStep?: (orderId: string) => Promise<void>;
  onOpenEmailWithOrder: (order: AdminOrder) => void;
}

export default function OrderDrawer({
  order,
  onClose,
  onUpdateOrder,
  onOpenEmailWithOrder,
}: OrderDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'delivery' | 'messages'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Delivery form states
  const [selectedStage, setSelectedStage] = useState<FulfillmentStage>(order?.fulfillmentStatus || 'new');
  const [selectedCarrier, setSelectedCarrier] = useState(order?.carrier || 'Deen Drip Direct Hand-Delivery (Owner)');
  const [trackingNumberInput, setTrackingNumberInput] = useState(order?.trackingNumber || '');
  const [deliveryNoteInput, setDeliveryNoteInput] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  const [newInternalNote, setNewInternalNote] = useState('');
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!order) return null;

  const handleCopyLink = () => {
    const link = order.trackingLink || `https://www.deendrip.shop/order/${order.orderNumber}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveDeliveryUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      let finalTracking = trackingNumberInput.trim();
      if (!finalTracking && selectedCarrier.includes('Owner')) {
        finalTracking = `DD-DIRECT-${order.deliveryState.toUpperCase() || 'LAGOS'}`;
      }

      await onUpdateOrder(order.orderNumber, {
        fulfillmentStatus: selectedStage,
        carrier: selectedCarrier,
        trackingNumber: finalTracking,
        note: deliveryNoteInput.trim() || undefined,
        sendEmail: notifyCustomer,
      });

      setUpdateSuccess(true);
      setDeliveryNoteInput('');
      setTimeout(() => setUpdateSuccess(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!newInternalNote.trim()) return;
    const currentNotes = order.notes || [];
    await onUpdateOrder(order.orderNumber, {
      notes: [...currentNotes, newInternalNote.trim()],
    });
    setNewInternalNote('');
  };

  const formatNgn = (kobo: number) => `₦${(kobo / 100).toLocaleString('en-NG')}`;

  return (
    <div className={styles.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.drawerPanel}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--admin-surface)', zIndex: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--admin-text)' }}>Order #{order.orderNumber}</span>
              <span className={`${styles.badge} ${order.paymentStatus === 'paid' ? styles.badgePaid : styles.badgePending}`}>
                {order.paymentStatus}
              </span>
              <span className={`${styles.badge} ${order.fulfillmentStatus === 'delivered' ? styles.badgeShipped : styles.badgePending}`}>
                {order.fulfillmentStatus === 'packing' ? 'packed' : order.fulfillmentStatus}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
              Placed {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => setShowPrintSlip(true)} className={styles.btnSecondary} title="Print packing slip" style={{ padding: '6px 10px', height: '32px' }}>
              <Printer size={15} />
            </button>
            <button onClick={() => onOpenEmailWithOrder(order)} className={styles.btnSecondary} title="Email customer" style={{ padding: '6px 10px', height: '32px' }}>
              <Mail size={15} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--admin-muted)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', padding: '0 20px', gap: '20px' }}>
          {(['overview', 'items', 'delivery', 'messages'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t ? '2px solid var(--admin-sky-500)' : '2px solid transparent',
                padding: '12px 0',
                fontSize: '13px',
                fontWeight: activeTab === t ? 600 : 500,
                color: activeTab === t ? 'var(--admin-text)' : 'var(--admin-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t === 'delivery' ? 'Delivery & Waybill' : t}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {/* Printable Packing Slip View */}
          {showPrintSlip && (
            <div style={{ background: '#fff', color: '#000', padding: '24px', borderRadius: '8px', border: '2px solid #000', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>DEEN DRIP LAGOS</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#555' }}>Faith, Culture & Streetwear · orders@deendrip.shop</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800 }}>PACKING SLIP</div>
                  <div style={{ fontSize: '13px' }}>#{order.orderNumber}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', marginBottom: '16px' }}>
                <strong>SHIP TO:</strong>
                <div>{order.customerName}</div>
                <div>{order.deliveryAddress}</div>
                <div>{order.deliveryCity}, {order.deliveryState}</div>
                <div>Tel: {order.customerPhone}</div>
              </div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '4px 0' }}>Variant</th>
                    <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '6px 0' }}>{it.productTitle}</td>
                      <td style={{ textAlign: 'center' }}>{it.variantTitle}</td>
                      <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatNgn(it.priceKobo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => window.print()} className={styles.btnPrimary} style={{ padding: '6px 14px' }}>
                  Print Slip
                </button>
                <button onClick={() => setShowPrintSlip(false)} className={styles.btnSecondary} style={{ padding: '6px 14px' }}>
                  Close
                </button>
              </div>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Customer Box */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Customer Details</span>
                <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600 }}>{order.customerName}</div>
                <div style={{ fontSize: '13px', color: 'var(--admin-muted)', marginTop: '2px' }}>{order.customerEmail}</div>
                <div style={{ fontSize: '13px', color: 'var(--admin-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} />
                  <span>{order.customerPhone}</span>
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Salam%20${encodeURIComponent(order.customerName)},%20this%20is%20Deen%20Drip%20regarding%20Order%20%23${order.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: '#25D366', fontWeight: 700, marginLeft: '6px' }}
                  >
                    WhatsApp Chat ↗
                  </a>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Delivery Destination</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-sky-500)' }}>
                    {order.carrier || 'Pending Dispatch'}
                  </span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: '1.5' }}>
                  <div>{order.deliveryAddress}</div>
                  <div style={{ color: 'var(--admin-muted)' }}>{order.deliveryCity}, {order.deliveryState}</div>
                  {order.trackingNumber && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--admin-sky-700)', fontWeight: 600 }}>
                      Waybill / Tracking: {order.trackingNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('delivery');
                    setSelectedStage('packing');
                  }}
                  className={styles.btnSecondary}
                  style={{ padding: '9px 12px', fontSize: '13px', justifyContent: 'center' }}
                >
                  <FileText size={15} />
                  <span>Mark as Packed</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('delivery');
                    setSelectedStage('shipped');
                  }}
                  className={styles.btnSky}
                  style={{ padding: '9px 12px', fontSize: '13px', justifyContent: 'center' }}
                >
                  <Truck size={15} />
                  <span>Update Waybill & Dispatch</span>
                </button>
              </div>

              {/* Financial Breakdown */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Payment Breakdown</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--admin-muted)' }}>Subtotal</span>
                    <span className={styles.tabular}>{formatNgn(order.subtotalKobo)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--admin-muted)' }}>Delivery Fee</span>
                    <span className={styles.tabular}>{order.deliveryFeeKobo === 0 ? 'FREE' : formatNgn(order.deliveryFeeKobo)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--admin-border)', fontWeight: 700, fontSize: '15px' }}>
                    <span>Total Amount Paid</span>
                    <span className={styles.tabular} style={{ color: 'var(--admin-sky-700)' }}>{formatNgn(order.totalKobo)}</span>
                  </div>
                </div>
              </div>

              {/* Staff Notes */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Internal Operational Notes</span>
                {order.notes && order.notes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
                    {order.notes.map((n, i) => (
                      <div key={i} style={{ fontSize: '12px', background: 'var(--admin-canvas)', padding: '8px 10px', borderRadius: '6px' }}>
                        {n}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="text"
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    placeholder="Add operational notes..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddInternalNote()}
                    style={{ flex: 1, padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                  />
                  <button onClick={handleAddInternalNote} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. ITEMS TAB */}
          {activeTab === 'items' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.card} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--admin-canvas)', flexShrink: 0, position: 'relative' }}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productTitle} fill sizes="48px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={18} style={{ color: 'var(--admin-muted)' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.productTitle}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{item.variantTitle} · SKU: {item.sku}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.tabular} style={{ fontSize: '13px', fontWeight: 600 }}>{formatNgn(item.priceKobo)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. DELIVERY & WAYBILL TAB */}
          {activeTab === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Status Update Form */}
              <div className={styles.card} style={{ padding: '18px', border: '1px solid var(--admin-sky-500)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Navigation size={16} style={{ color: 'var(--admin-sky-500)' }} />
                    <span>Update Delivery & Fulfillment Stage</span>
                  </h4>
                  {updateSuccess && (
                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700 }}>
                      ✓ Live status updated & saved!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveDeliveryUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Stage Dropdown */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                      Current Fulfillment Stage
                    </label>
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value as FulfillmentStage)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontSize: '13px' }}
                    >
                      <option value="new">1. Order Confirmed (Paid & Queued)</option>
                      <option value="packing">2. Packed & Ready for Dispatch</option>
                      <option value="shipped">3. Handed to Courier / Dispatched</option>
                      <option value="out_for_delivery">4. Out for Delivery (Rider En Route)</option>
                      <option value="delivered">5. Delivered to Customer</option>
                      <option value="cancelled">6. Order Cancelled</option>
                    </select>
                  </div>

                  {/* Delivery Method / Carrier */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                      Delivery Method / Logistics Carrier
                    </label>
                    <select
                      value={selectedCarrier}
                      onChange={(e) => {
                        setSelectedCarrier(e.target.value);
                        if (e.target.value.includes('Owner') && !trackingNumberInput) {
                          setTrackingNumberInput(`DD-DIRECT-${order.deliveryState.toUpperCase() || 'LAGOS'}`);
                        }
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontSize: '13px' }}
                    >
                      <option value="Deen Drip Direct Hand-Delivery (Owner)">Deen Drip Direct Hand-Delivery (Owner / In-House)</option>
                      <option value="GIG Logistics">GIG Logistics</option>
                      <option value="DHL Express">DHL Express</option>
                      <option value="Fez Delivery">Fez Delivery</option>
                      <option value="Speedaf Express">Speedaf Express</option>
                      <option value="Other Courier / Rider">Other Courier / Rider</option>
                    </select>
                  </div>

                  {/* Waybill / Tracking Reference */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)' }}>
                        Waybill / Tracking Number
                      </label>
                      {selectedCarrier.includes('Owner') && (
                        <button
                          type="button"
                          onClick={() => setTrackingNumberInput(`DD-DIRECT-${order.deliveryState.toUpperCase() || 'LAGOS'}`)}
                          style={{ background: 'none', border: 'none', color: 'var(--admin-sky-500)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Use Direct Handover Ref
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      placeholder="e.g. GIG-NG-889102 or DD-DIRECT-LAGOS"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontSize: '13px' }}
                    />
                  </div>

                  {/* Status / Location Note */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                      Dispatch Note / Timeline Location (Visible in Customer Timeline)
                    </label>
                    <input
                      type="text"
                      value={deliveryNoteInput}
                      onChange={(e) => setDeliveryNoteInput(e.target.value)}
                      placeholder="e.g. Package packed at Lekki hub · Handed to GIG Ikeja hub · Rider en route..."
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontSize: '13px' }}
                    />
                  </div>

                  {/* Email Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifyCustomer}
                      onChange={(e) => setNotifyCustomer(e.target.checked)}
                    />
                    <span>Notify customer <strong>{order.customerEmail}</strong> via email with live waybill tracking link</span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={styles.btnSky}
                    style={{ padding: '10px', fontSize: '13px', justifyContent: 'center' }}
                  >
                    <Send size={15} />
                    <span>{isUpdating ? 'Saving Live Status…' : 'Save Status & Update Customer Tracking'}</span>
                  </button>
                </form>
              </div>

              {/* Tracking Details Card */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Current Waybill & Method</span>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{order.carrier || 'Not yet dispatched'}</div>
                    {order.trackingNumber && (
                      <div style={{ fontSize: '12px', color: 'var(--admin-sky-700)', marginTop: '2px', fontWeight: 600 }}>
                        Waybill: {order.trackingNumber}
                      </div>
                    )}
                  </div>
                  <button onClick={handleCopyLink} className={styles.btnSecondary} style={{ padding: '6px 10px', fontSize: '12px' }}>
                    <Copy size={13} />
                    <span>{copiedLink ? 'Copied Tracking Link!' : 'Copy Tracking Link'}</span>
                  </button>
                </div>
              </div>

              {/* Vertical Delivery Timeline */}
              <div style={{ paddingLeft: '8px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Delivery Milestone Timeline
                </h4>
                {order.timeline.map((step, idx) => {
                  const isLast = idx === order.timeline.length - 1;
                  return (
                    <div key={step.id} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: isLast ? '0' : '24px' }}>
                      {!isLast && (
                        <div style={{ position: 'absolute', left: '11px', top: '22px', bottom: 0, width: '2px', backgroundColor: 'var(--admin-border)' }} />
                      )}
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isLast ? 'var(--admin-sky-500)' : 'var(--admin-canvas)', border: `2px solid ${isLast ? 'var(--admin-sky-500)' : 'var(--admin-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, color: isLast ? '#fff' : 'var(--admin-muted)' }}>
                        {isLast ? <CheckCircle size={12} /> : <Clock size={12} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)' }}>{step.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>
                            {new Date(step.timestamp).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--admin-muted)' }}>{step.description}</p>
                        {step.location && (
                          <span style={{ fontSize: '11px', color: 'var(--admin-sky-700)', fontWeight: 500, display: 'inline-block', marginTop: '2px' }}>
                            📍 {step.location}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--admin-muted)', margin: 0 }}>
                Communication sent to <strong>{order.customerEmail}</strong> regarding this order.
              </p>
              <div className={styles.card} style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <strong>Order Receipt & Confirmation</strong>
                  <span style={{ color: 'var(--admin-muted)' }}>Automated System</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--admin-muted)' }}>
                  Detailed itemized receipt with Paystack payment verification sent on {new Date(order.createdAt).toLocaleDateString('en-NG')}.
                </p>
              </div>
              <button
                onClick={() => onOpenEmailWithOrder(order)}
                className={styles.btnSky}
                style={{ alignSelf: 'flex-start' }}
              >
                <Mail size={15} />
                <span>Compose New Email to {order.customerName.split(' ')[0]}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
