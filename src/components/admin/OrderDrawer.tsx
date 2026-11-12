'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Printer,
  Mail,
  Truck,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Phone,
  FileText,
} from 'lucide-react';
import type { AdminOrder, FulfillmentStage } from '@/lib/repo/types';
import styles from '@/app/admin/admin-dashboard.module.css';

interface OrderDrawerProps {
  order: AdminOrder | null;
  onClose: () => void;
  onUpdateOrder: (orderId: string, updates: Partial<AdminOrder>) => Promise<void>;
  onSimulateStep: (orderId: string) => Promise<void>;
  onOpenEmailWithOrder: (order: AdminOrder) => void;
}

export default function OrderDrawer({
  order,
  onClose,
  onUpdateOrder,
  onSimulateStep,
  onOpenEmailWithOrder,
}: OrderDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'delivery' | 'messages'>('overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showMarkShippedModal, setShowMarkShippedModal] = useState(false);
  const [carrierInput, setCarrierInput] = useState('GIG Logistics');
  const [trackingNoInput, setTrackingNoInput] = useState('');
  const [sendEmailWithDispatch, setSendEmailWithDispatch] = useState(true);
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!order) return null;

  const handleCopyLink = () => {
    if (order.trackingLink) {
      navigator.clipboard.writeText(order.trackingLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await onSimulateStep(order.id);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const currentNotes = order.notes || [];
    await onUpdateOrder(order.id, { notes: [...currentNotes, newNote.trim()] });
    setNewNote('');
  };

  const handleMarkShipped = async () => {
    setIsUpdating(true);
    const tracking = trackingNoInput.trim() || `GIG-NG-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      await onUpdateOrder(order.id, {
        fulfillmentStatus: 'shipped',
        carrier: carrierInput,
        trackingNumber: tracking,
        trackingLink: `https://track.deendrip.shop/${tracking}`,
      });
      setShowMarkShippedModal(false);
    } finally {
      setIsUpdating(false);
    }
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
              <span className={`${styles.badge} ${order.fulfillmentStatus === 'shipped' ? styles.badgeShipped : styles.badgePending}`}>
                {order.fulfillmentStatus}
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
              {t}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {/* Printable Packing Slip Modal View */}
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
                  Print
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Customer</span>
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
                    WhatsApp ↗
                  </a>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Shipping Destination</span>
                <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: '1.5' }}>
                  <div>{order.deliveryAddress}</div>
                  <div style={{ color: 'var(--admin-muted)' }}>{order.deliveryCity}, {order.deliveryState}</div>
                </div>
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
                    <span style={{ color: 'var(--admin-muted)' }}>Shipping Fee</span>
                    <span className={styles.tabular}>{order.deliveryFeeKobo === 0 ? 'FREE' : formatNgn(order.deliveryFeeKobo)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--admin-border)', fontWeight: 700, fontSize: '15px' }}>
                    <span>Total Paid</span>
                    <span className={styles.tabular} style={{ color: 'var(--admin-sky-700)' }}>{formatNgn(order.totalKobo)}</span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              {order.fulfillmentStatus !== 'delivered' && order.fulfillmentStatus !== 'cancelled' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {order.fulfillmentStatus !== 'shipped' && (
                    <button
                      onClick={() => setShowMarkShippedModal(true)}
                      className={styles.btnSky}
                      style={{ flex: 1 }}
                    >
                      <Truck size={16} />
                      <span>Mark as Shipped</span>
                    </button>
                  )}
                  {order.fulfillmentStatus === 'shipped' && (
                    <button
                      onClick={() => onUpdateOrder(order.id, { fulfillmentStatus: 'delivered' })}
                      className={styles.btnPrimary}
                      style={{ flex: 1 }}
                    >
                      <CheckCircle size={16} />
                      <span>Confirm Delivered</span>
                    </button>
                  )}
                </div>
              )}

              {/* Mark Shipped Sheet/Modal */}
              {showMarkShippedModal && (
                <div style={{ background: 'var(--admin-canvas)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Dispatch Order & Assign Courier</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>Logistics Carrier</label>
                      <select
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontSize: '13px' }}
                      >
                        <option value="GIG Logistics">GIG Logistics</option>
                        <option value="Fez Delivery">Fez Delivery</option>
                        <option value="DHL Express">DHL Express</option>
                        <option value="Speedaf Express">Speedaf Express</option>
                        <option value="In-House Lagos Rider">In-House Lagos Rider</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>Waybill / Tracking Number</label>
                      <input
                        type="text"
                        value={trackingNoInput}
                        onChange={(e) => setTrackingNoInput(e.target.value)}
                        placeholder="e.g. GIG-NG-889201"
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontSize: '13px' }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sendEmailWithDispatch}
                        onChange={(e) => setSendEmailWithDispatch(e.target.checked)}
                      />
                      <span>Auto-email customer dispatch notice with tracking link</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button onClick={handleMarkShipped} disabled={isUpdating} className={styles.btnSky} style={{ flex: 1, padding: '7px' }}>
                        {isUpdating ? 'Saving…' : 'Save & Dispatch'}
                      </button>
                      <button onClick={() => setShowMarkShippedModal(false)} className={styles.btnSecondary} style={{ padding: '7px 12px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Notes */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Internal Staff Notes</span>
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
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add operational note…"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    style={{ flex: 1, padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                  />
                  <button onClick={handleAddNote} className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '12px' }}>
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

          {/* 3. DELIVERY TAB */}
          {activeTab === 'delivery' && (
            <div>
              {/* Delay Banner if Delayed */}
              {order.isDelayed && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <AlertCircle size={18} />
                  <span><strong>Transit Alert:</strong> This shipment has been in courier transit for over 3 days without delivery confirmation.</span>
                </div>
              )}

              {/* Tracking Details Header */}
              <div className={styles.card} style={{ padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Assigned Courier</span>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{order.carrier || 'Not yet dispatched'}</div>
                    {order.trackingNumber && (
                      <div style={{ fontSize: '12px', color: 'var(--admin-muted)', marginTop: '2px' }}>
                        Waybill: <strong>{order.trackingNumber}</strong>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {order.trackingLink && (
                      <button onClick={handleCopyLink} className={styles.btnSecondary} style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <Copy size={13} />
                        <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    )}
                    <button
                      onClick={handleSimulate}
                      disabled={isSimulating || order.fulfillmentStatus === 'delivered'}
                      className={styles.btnSecondary}
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      title="Advance to next courier update stage"
                    >
                      <RotateCcw size={13} />
                      <span>{isSimulating ? 'Simulating…' : 'Simulate Next Update'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vertical Delivery Timeline */}
              <div style={{ paddingLeft: '8px' }}>
                {order.timeline.map((step, idx) => {
                  const isLast = idx === order.timeline.length - 1;
                  return (
                    <div key={step.id} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: isLast ? '0' : '24px' }}>
                      {/* Vertical line */}
                      {!isLast && (
                        <div style={{ position: 'absolute', left: '11px', top: '22px', bottom: 0, width: '2px', backgroundColor: 'var(--admin-border)' }} />
                      )}
                      {/* Node Icon */}
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isLast ? 'var(--admin-sky-500)' : 'var(--admin-canvas)', border: `2px solid ${isLast ? 'var(--admin-sky-500)' : 'var(--admin-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, color: isLast ? '#fff' : 'var(--admin-muted)' }}>
                        {isLast ? <CheckCircle size={12} /> : <Clock size={12} />}
                      </div>
                      {/* Step Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)' }}>{step.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <span style={{ color: 'var(--admin-muted)' }}>Delivered</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--admin-muted)' }}>
                  Detailed itemized receipt with Paystack payment confirmation.
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
