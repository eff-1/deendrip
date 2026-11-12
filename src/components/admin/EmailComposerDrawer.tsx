'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Eye, FileText, ChevronDown } from 'lucide-react';
import type { AdminCustomer, AdminOrder, EmailTemplate } from '@/lib/repo/types';
import { generateAiDraft, sendEmailDraft } from '@/lib/repo';
import styles from '@/app/admin/admin-dashboard.module.css';

interface EmailComposerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: EmailTemplate[];
  customers: AdminCustomer[];
  initialRecipient?: AdminCustomer | AdminOrder | null;
  onSentSuccess?: (msg: string) => void;
}

export default function EmailComposerDrawer({
  isOpen,
  onClose,
  templates,
  customers,
  initialRecipient,
  onSentSuccess,
}: EmailComposerDrawerProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [aiGoal, setAiGoal] = useState<'shipping_update' | 'thank_you' | 'review_request' | 'win_back' | 'delay_apology'>('review_request');

  useEffect(() => {
    if (initialRecipient) {
      if ('segment' in initialRecipient) {
        setSelectedCustomer(initialRecipient as AdminCustomer);
      } else {
        // Was an order
        const found = customers.find(c => c.email.toLowerCase() === initialRecipient.customerEmail.toLowerCase());
        if (found) setSelectedCustomer(found);
        else {
          setSelectedCustomer({
            id: 'temp',
            name: initialRecipient.customerName,
            email: initialRecipient.customerEmail,
            phone: initialRecipient.customerPhone,
            city: initialRecipient.deliveryCity,
            state: initialRecipient.deliveryState,
            totalOrders: 1,
            totalSpentKobo: initialRecipient.totalKobo,
            segment: 'new',
            tags: [],
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }
  }, [initialRecipient, customers, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tplId: string) => {
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  };

  const insertMergeTag = (tag: string) => {
    setBody(prev => `${prev} ${tag} `);
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await generateAiDraft({
        goal: aiGoal,
        customerName: selectedCustomer ? selectedCustomer.name : 'Valued Collector',
        orderNumber: '10482',
        productName: 'Deen Drip Classic Arch Tee',
      });
      setSubject(res.subject);
      setBody(res.body);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSend = async () => {
    if (!selectedCustomer || !subject || !body) return;
    setIsSending(true);
    try {
      await sendEmailDraft({
        to: selectedCustomer.email,
        subject,
        body,
      });
      if (onSentSuccess) {
        onSentSuccess(`Email sent to ${selectedCustomer.email}`);
      }
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  // Replace merge tags for live recipient preview
  const renderPreviewContent = (text: string) => {
    if (!selectedCustomer) return text;
    const fName = selectedCustomer.name.split(' ')[0];
    return text
      .replace(/{{first_name}}/g, fName)
      .replace(/{{order_id}}/g, '10482')
      .replace(/{{tracking_link}}/g, 'https://track.deendrip.shop/GIG-NG-10482')
      .replace(/{{product_name}}/g, 'Deen Drip Classic Arch Tee')
      .replace(/{{store_name}}/g, 'Deen Drip')
      .replace(/{{discount_code}}/g, 'SABR15');
  };

  return (
    <div className={styles.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.drawerPanel}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--admin-surface)', zIndex: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Personalized Email Composer</h3>
            <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Personalized customer touchpoints</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--admin-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
          {/* Recipient Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Recipient (Customer)</label>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const found = customers.find(c => c.id === e.target.value);
                if (found) setSelectedCustomer(found);
              }}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
            >
              {customers.slice(0, 30).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) — {c.segment.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* AI Draft Bar */}
          <div style={{ background: 'var(--admin-sky-100)', border: '1px solid var(--admin-sky-300)', padding: '12px 14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-sky-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} />
                <span>AI Email Generator</span>
              </span>
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={isGeneratingAi}
                className={styles.btnSky}
                style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}
              >
                {isGeneratingAi ? 'Writing…' : 'Generate Draft ✨'}
              </button>
            </div>
            <select
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value as any)}
              style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
            >
              <option value="review_request">Ask for Product Review & Fit Feedback</option>
              <option value="shipping_update">Live Courier Tracking & Dispatch Notice</option>
              <option value="thank_you">Personalized Thank-You Note</option>
              <option value="win_back">Win-Back Inactive Collector (with 15% code)</option>
              <option value="delay_apology">Logistics Delay Escalation & Apology</option>
            </select>
          </div>

          {/* Templates Quick Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Or Start from Seeded Template</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className={styles.btnSecondary}
                  style={{ fontSize: '11px', padding: '4px 8px', height: '28px' }}
                >
                  <FileText size={11} />
                  <span>{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Salam Amaka — Your Deen Drip order is on the move"
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
            />
          </div>

          {/* Merge Tags Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)' }}>Message Body</label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={styles.btnSecondary}
                style={{ fontSize: '11px', padding: '3px 8px', height: '24px' }}
              >
                <Eye size={12} />
                <span>{showPreview ? 'Edit Raw' : 'Live Preview'}</span>
              </button>
            </div>

            {/* Merge Tag Chips */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {['{{first_name}}', '{{order_id}}', '{{tracking_link}}', '{{product_name}}', '{{store_name}}', '{{discount_code}}'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertMergeTag(tag)}
                  style={{ fontSize: '10px', fontFamily: 'monospace', padding: '2px 6px', background: 'var(--admin-canvas)', border: '1px solid var(--admin-border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--admin-muted)' }}
                >
                  + {tag}
                </button>
              ))}
            </div>

            {showPreview ? (
              <div style={{ border: '1px solid var(--admin-sky-500)', borderRadius: '8px', padding: '14px', background: 'var(--admin-surface)', minHeight: '160px', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.6' }}>
                <div style={{ fontSize: '12px', color: 'var(--admin-muted)', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--admin-border)' }}>
                  Preview for <strong>{selectedCustomer?.name}</strong> ({selectedCustomer?.email}):
                </div>
                <strong>{renderPreviewContent(subject)}</strong>
                <p style={{ marginTop: '8px' }}>{renderPreviewContent(body)}</p>
              </div>
            ) : (
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email here or insert merge tags above…"
                style={{ width: '100%', padding: '12px', fontSize: '13px', lineHeight: '1.5', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', resize: 'vertical' }}
              />
            )}
          </div>

          {/* Send Action */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !subject || !body}
              className={styles.btnSky}
              style={{ flex: 1 }}
            >
              <Send size={15} />
              <span>{isSending ? 'Dispatching…' : `Send to ${selectedCustomer ? selectedCustomer.name.split(' ')[0] : 'Customer'}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
