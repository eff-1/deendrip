'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Trash2, Copy, Save, ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminProduct } from '@/lib/repo/types';
import styles from '@/app/admin/admin-dashboard.module.css';

interface ProductDrawerProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
}

export default function ProductDrawer({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ProductDrawerProps) {
  const isEditing = !!product;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AdminProduct['category']>('tees');
  const [priceNaira, setPriceNaira] = useState('');
  const [compareAtPriceNaira, setCompareAtPriceNaira] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('25');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [tagsInput, setTagsInput] = useState('Streetwear, Faith, Heavyweight');
  const [images, setImages] = useState<string[]>(['/assets/campaign/product-tshirt.webp']);
  const [showVariants, setShowVariants] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Populate form on edit or reset
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setCategory(product.category);
      setPriceNaira((product.priceKobo / 100).toString());
      setCompareAtPriceNaira(product.compareAtPriceKobo ? (product.compareAtPriceKobo / 100).toString() : '');
      setSku(product.sku);
      setStock(product.stock.toString());
      setLowStockThreshold(product.lowStockThreshold.toString());
      setStatus(product.status === 'archived' ? 'draft' : product.status);
      setTagsInput(product.tags.join(', '));
      setImages(product.images.length > 0 ? product.images : ['/assets/campaign/product-tshirt.webp']);
      setIsDirty(false);
    } else {
      // New product defaults or restore draft
      const draft = localStorage.getItem('deendrip_new_product_draft');
      if (draft) {
        try {
          const d = JSON.parse(draft);
          setTitle(d.title || '');
          setDescription(d.description || '');
          setCategory(d.category || 'tees');
          setPriceNaira(d.priceNaira || '');
          setSku(d.sku || '');
        } catch { /* empty */ }
      } else {
        setTitle('');
        setDescription('Engineered from custom 300GSM heavyweight organic cotton with reinforced seams.');
        setCategory('tees');
        setPriceNaira('25000');
        setCompareAtPriceNaira('');
        setSku(`DD-TEE-${Math.floor(100 + Math.random() * 900)}`);
        setStock('30');
      }
      setIsDirty(false);
    }
  }, [product, isOpen]);

  // Autosave draft to localStorage when creating new product
  useEffect(() => {
    if (!product && isOpen && title) {
      localStorage.setItem('deendrip_new_product_draft', JSON.stringify({
        title, description, category, priceNaira, sku
      }));
    }
  }, [title, description, category, priceNaira, sku, product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const priceKobo = Math.round(parseFloat(priceNaira || '0') * 100);
    const compareAtPriceKobo = compareAtPriceNaira ? Math.round(parseFloat(compareAtPriceNaira) * 100) : null;
    const stockNum = parseInt(stock, 10) || 0;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      await onSave({
        title: title.trim(),
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        category,
        priceKobo,
        compareAtPriceKobo,
        sku: sku || `DD-${category.slice(0, 3).toUpperCase()}-001`,
        stock: stockNum,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 10,
        status,
        tags,
        images,
        variants: [
          { id: 'v_s', size: 'S', sku: `${sku}-S`, stockQuantity: Math.floor(stockNum * 0.2) },
          { id: 'v_m', size: 'M', sku: `${sku}-M`, stockQuantity: Math.floor(stockNum * 0.35) },
          { id: 'v_l', size: 'L', sku: `${sku}-L`, stockQuantity: Math.floor(stockNum * 0.3) },
          { id: 'v_xl', size: 'XL', sku: `${sku}-XL`, stockQuantity: Math.floor(stockNum * 0.15) },
        ],
      });

      if (!product) {
        localStorage.removeItem('deendrip_new_product_draft');
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.drawerPanel}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--admin-surface)', zIndex: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              {isEditing ? `Edit: ${product.title}` : 'Add New Product'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
              {isDirty ? '● Unsaved changes' : 'All changes saved'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--admin-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
              placeholder="e.g. Sabr Heavyweight Oversized Tee"
              style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
            />
          </div>

          {/* Category & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value as any); setIsDirty(true); }}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              >
                <option value="tees">Tees</option>
                <option value="caps">Caps</option>
                <option value="hoodies-polos">Hoodies & Polos</option>
                <option value="trousers">Trousers</option>
                <option value="tracksuits">Tracksuits</option>
                <option value="shirts">Shirts</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as any); setIsDirty(true); }}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              >
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Pricing Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Price (₦)</label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={priceNaira}
                onChange={(e) => { setPriceNaira(e.target.value); setIsDirty(true); }}
                placeholder="25000"
                style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Compare-at Price (₦)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={compareAtPriceNaira}
                onChange={(e) => { setCompareAtPriceNaira(e.target.value); setIsDirty(true); }}
                placeholder="Optional strike-through"
                style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              />
            </div>
          </div>

          {/* SKU & Stock Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => { setSku(e.target.value); setIsDirty(true); }}
                placeholder="DD-TEE-01"
                style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Total Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => { setStock(e.target.value); setIsDirty(true); }}
                style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Low Stock Alert</label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => { setLowStockThreshold(e.target.value); setIsDirty(true); }}
                style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', resize: 'vertical' }}
            />
          </div>

          {/* Image preview / Mock uploader */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Images</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--admin-border)', position: 'relative' }}>
                <Image src={images[0]} alt="Preview" fill sizes="64px" style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
                Primary campaign asset selected.
              </div>
            </div>
          </div>

          {/* Variants Section (Collapsible) */}
          <div style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowVariants(!showVariants)}
              style={{ width: '100%', padding: '12px 14px', background: 'var(--admin-canvas)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)' }}
            >
              <span>Size Variants (S, M, L, XL)</span>
              {showVariants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showVariants && (
              <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--admin-muted)' }}>
                Stock will be automatically distributed across S (20%), M (35%), L (30%), and XL (15%) when saved.
              </div>
            )}
          </div>

          {/* SEO Section (Collapsible) */}
          <div style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              style={{ width: '100%', padding: '12px 14px', background: 'var(--admin-canvas)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)' }}
            >
              <span>Search Engine Optimization (SEO)</span>
              {showSeo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showSeo && (
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Meta title (defaults to product title)"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                />
                <textarea
                  rows={2}
                  placeholder="Meta description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                />
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
            <button
              type="submit"
              disabled={isSaving}
              className={styles.btnSky}
              style={{ flex: 1 }}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving…' : isEditing ? 'Update Product' : 'Create Product'}</span>
            </button>

            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${product.title}?`)) {
                    onDelete(product.id);
                    onClose();
                  }
                }}
                className={styles.btnSecondary}
                style={{ color: '#EF4444' }}
                title="Delete product"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
