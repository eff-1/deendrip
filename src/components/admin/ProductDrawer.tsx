'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Plus, Trash2, Save, ChevronDown, ChevronUp, UploadCloud, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { AdminProduct } from '@/lib/repo/types';
import { compressAndSanitizeImage, formatBytes, type OptimizedImageResult } from '@/lib/imageOptimizer';
import styles from '@/app/admin/admin-dashboard.module.css';

interface ProductDrawerProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
}

interface ImageUploadItem {
  url: string;
  originalSize?: number;
  compressedSize?: number;
  savingsPercent?: number;
}

export default function ProductDrawer({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ProductDrawerProps) {
  const isEditing = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AdminProduct['category']>('tees');
  const [priceNaira, setPriceNaira] = useState('');
  const [compareAtPriceNaira, setCompareAtPriceNaira] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('30');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [tagsInput, setTagsInput] = useState('Streetwear, Faith, Heavyweight');

  // Images state
  const [imageItems, setImageItems] = useState<ImageUploadItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Size variants stock
  const [variantSizes, setVariantSizes] = useState([
    { size: 'S', stock: 6 },
    { size: 'M', stock: 10 },
    { size: 'L', stock: 10 },
    { size: 'XL', stock: 4 },
  ]);
  const [showVariants, setShowVariants] = useState(false);

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

      const existingImages = product.images.map((img) => ({ url: img }));
      setImageItems(existingImages.length > 0 ? existingImages : [{ url: '/assets/campaign/product-tshirt.webp' }]);

      if (product.variants && product.variants.length > 0) {
        setVariantSizes(
          product.variants.map((v) => ({
            size: v.size,
            stock: v.stockQuantity || 0,
          }))
        );
      } else {
        const totalStock = product.stock || 30;
        setVariantSizes([
          { size: 'S', stock: Math.floor(totalStock * 0.2) },
          { size: 'M', stock: Math.floor(totalStock * 0.35) },
          { size: 'L', stock: Math.floor(totalStock * 0.3) },
          { size: 'XL', stock: Math.floor(totalStock * 0.15) },
        ]);
      }
      setIsDirty(false);
    } else {
      // New product defaults
      setTitle('');
      setDescription('Engineered from 100% premium heavyweight cotton with signature embroidered typography and structured streetwear drape.');
      setCategory('tees');
      setPriceNaira('25000');
      setCompareAtPriceNaira('');
      setSku(`DD-TEE-${Math.floor(100 + Math.random() * 900)}`);
      setStock('30');
      setImageItems([]);
      setVariantSizes([
        { size: 'S', stock: 6 },
        { size: 'M', stock: 10 },
        { size: 'L', stock: 10 },
        { size: 'XL', stock: 4 },
      ]);
      setIsDirty(false);
    }
  }, [product, isOpen]);

  // Keep total stock in sync with sum of variants
  useEffect(() => {
    const total = variantSizes.reduce((sum, v) => sum + (v.stock || 0), 0);
    setStock(total.toString());
  }, [variantSizes]);

  if (!isOpen) return null;

  // Handle image files selection & compression
  const processImageFiles = async (files: FileList | File[]) => {
    setIsCompressing(true);
    try {
      const results: ImageUploadItem[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        try {
          const optimized: OptimizedImageResult = await compressAndSanitizeImage(file, {
            maxDimension: 1200,
            quality: 0.82,
          });
          results.push({
            url: optimized.dataUrl,
            originalSize: optimized.originalSizeBytes,
            compressedSize: optimized.compressedSizeBytes,
            savingsPercent: optimized.savingsPercent,
          });
        } catch (err) {
          console.error('Error compressing image:', err);
        }
      }
      if (results.length > 0) {
        setImageItems((prev) => [...prev, ...results]);
        setIsDirty(true);
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      await processImageFiles(e.dataTransfer.files);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImageItems((prev) => [...prev, { url: imageUrlInput.trim() }]);
    setImageUrlInput('');
    setIsDirty(true);
  };

  const handleRemoveImage = (index: number) => {
    setImageItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleSetPrimary = (index: number) => {
    setImageItems((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const priceKobo = Math.round(parseFloat(priceNaira || '0') * 100);
    const compareAtPriceKobo = compareAtPriceNaira ? Math.round(parseFloat(compareAtPriceNaira) * 100) : null;
    const stockNum = parseInt(stock, 10) || 0;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const finalImages = imageItems.map((item) => item.url);
    if (finalImages.length === 0) {
      finalImages.push('/assets/campaign/product-tshirt.webp');
    }

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
        images: finalImages,
        variants: variantSizes.map((v) => ({
          id: `var_${sku}_${v.size}`,
          size: v.size,
          sku: `${sku}-${v.size}`,
          stockQuantity: v.stock,
          priceKobo,
        })),
      });

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
              {isEditing ? `Edit: ${product.title}` : 'Add New Product to Store'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
              {isDirty ? '● Unsaved changes' : 'Synchronized with live store catalog'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--admin-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, overflowY: 'auto' }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
              placeholder="e.g. Sahari Line Heavyweight Hoodie - Washed Black"
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
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Store Visibility</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as any); setIsDirty(true); }}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              >
                <option value="active">Active (Visible in Storefront)</option>
                <option value="draft">Draft (Hidden from Storefront)</option>
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
                placeholder="e.g. 30000 (strike-through)"
                style={{ width: '100%', padding: '9px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              />
            </div>
          </div>

          {/* SKU & Low Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Base SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => { setSku(e.target.value); setIsDirty(true); }}
                placeholder="DD-TEE-01"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => { setLowStockThreshold(e.target.value); setIsDirty(true); }}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>Description & Fit Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
              placeholder="Fabric weight, garment fit, care instructions..."
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', resize: 'vertical' }}
            />
          </div>

          {/* SQUOOSH-ENABLED IMAGE UPLOADER */}
          <div style={{ border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--admin-canvas)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} />
                  <span>Product Images</span>
                  <span style={{ fontSize: '10px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--admin-sky-500)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    ⚡ Squoosh Auto-Compress
                  </span>
                </label>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--admin-muted)' }}>
                  Images are automatically compressed & sanitized (EXIF stripped) down to ~90KB WebP for instant loading and zero server bloat.
                </p>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? '2px dashed var(--admin-sky-500)' : '2px dashed var(--admin-border)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(14, 165, 233, 0.05)' : 'var(--admin-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: '14px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files) processImageFiles(e.target.files);
                }}
              />
              <UploadCloud size={28} style={{ color: 'var(--admin-sky-500)', margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {isCompressing ? 'Compressing & sanitizing image...' : 'Drop high-res images here, or browse device'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '4px' }}>
                Supports PNG, JPEG, WebP. High megabyte files are automatically shrunk.
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {imageItems.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                {imageItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      border: index === 0 ? '2px solid var(--admin-sky-500)' : '1px solid var(--admin-border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--admin-surface)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ width: '100%', height: '110px', position: 'relative', backgroundColor: 'var(--admin-canvas)' }}>
                      <Image src={item.url} alt={`Product ${index + 1}`} fill sizes="130px" style={{ objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(0, 0, 0, 0.65)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                      {index === 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '4px',
                            background: 'var(--admin-sky-500)',
                            color: '#fff',
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '2px 5px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Primary
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '6px 8px', fontSize: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--admin-surface)' }}>
                      {item.savingsPercent ? (
                        <span style={{ color: '#10B981', fontWeight: 700 }}>
                          {item.savingsPercent}% saved
                        </span>
                      ) : (
                        <span style={{ color: 'var(--admin-muted)' }}>Image #{index + 1}</span>
                      )}
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          style={{ background: 'none', border: 'none', color: 'var(--admin-sky-500)', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Make Primary
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Direct URL input fallback */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Or paste external image URL..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                style={{ flex: 1, padding: '7px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className={styles.btnSecondary}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Size Variants & Stock Distribution */}
          <div style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowVariants(!showVariants)}
              style={{ width: '100%', padding: '12px 14px', background: 'var(--admin-canvas)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--admin-text)' }}
            >
              <span>Size Variants & Inventory ({stock} total units)</span>
              {showVariants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showVariants && (
              <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', backgroundColor: 'var(--admin-surface)' }}>
                {variantSizes.map((v, i) => (
                  <div key={v.size} style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Size {v.size}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => {
                        const newStock = parseInt(e.target.value, 10) || 0;
                        setVariantSizes((prev) => {
                          const copy = [...prev];
                          copy[i].stock = newStock;
                          return copy;
                        });
                        setIsDirty(true);
                      }}
                      style={{ width: '100%', padding: '6px', fontSize: '13px', textAlign: 'center', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                    />
                  </div>
                ))}
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
              <span>{isSaving ? 'Saving to Store Catalog…' : isEditing ? 'Update Live Product' : 'Publish Product to Store'}</span>
            </button>

            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${product.title}? This will cleanly delete all variants and images with zero database remnants.`)) {
                    onDelete(product.id);
                    onClose();
                  }
                }}
                className={styles.btnSecondary}
                style={{ color: '#EF4444' }}
                title="Delete product completely"
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
