'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './vouchers.module.css';

interface VoucherItem {
  id: string;
  code: string;
  category: string;
  badge: string;
  discount: string;
  description: string;
  minSpend: string;
  expiry: string;
}

const ACTIVE_VOUCHERS: VoucherItem[] = [
  {
    id: 'voucher-1',
    code: 'FREESHIP',
    category: 'Logistics Drop',
    badge: 'AUTO-APPLIED ₦85K+',
    discount: 'FREE LAGOS DELIVERY',
    description: 'Tracked door-to-door delivery across all Lagos State zones on qualifying orders ₦85,000 and above.',
    minSpend: 'Min. spend: ₦85,000',
    expiry: 'AW-26 Drop Season',
  },
  {
    id: 'voucher-2',
    code: 'DEEN10',
    category: 'Storewide Privilege',
    badge: '10% STOREWIDE',
    discount: '10% OFF ENTIRE DROP',
    description: '10% reduction applied across all heavyweight tees, custom truckers, denim cargo pants and essentials.',
    minSpend: 'No minimum cart total',
    expiry: 'Official Release',
  },
  {
    id: 'voucher-3',
    code: 'DRIPVIP',
    category: 'VIP Reward',
    badge: '₦5,000 REDUCTION',
    discount: '₦5,000 VIP REWARD',
    description: 'Instant ₦5,000 price drop automatically deducted on high-tier curated bags of ₦100,000 or more.',
    minSpend: 'Min. spend: ₦100,000',
    expiry: 'Limited Edition Drop',
  },
];

export default function VouchersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2200);
  };

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <span className="section-tag">[ OFFICIAL PROMO DROPS & REWARDS ]</span>
          <h1 className={styles.title}>Vouchers & Promo Drops</h1>
          <p className={styles.subtitle}>
            Official Deen Drip redemption codes and logistics privileges. Tap any code box to copy directly to your clipboard and apply at checkout.
          </p>
        </div>

        {/* 3 Active Vouchers Grid */}
        <div className={styles.voucherGrid}>
          {ACTIVE_VOUCHERS.map(v => (
            <div key={v.id} className={styles.voucherCard}>
              <div>
                <div className={styles.cardTop}>
                  <span className={styles.categoryTag}>{v.category}</span>
                  <span className={styles.badge}>
                    {v.badge}
                  </span>
                </div>

                <div className={styles.discountValue}>{v.discount}</div>
                <p className={styles.description}>{v.description}</p>
              </div>

              <div>
                {/* Clickable Code Box */}
                <div
                  className={styles.codeBox}
                  onClick={() => handleCopy(v.code)}
                  title={`Click to copy ${v.code}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCopy(v.code);
                    }
                  }}
                >
                  <span className={styles.codeText}>{v.code}</span>
                  <span
                    className={`${styles.copyLabel} ${
                      copiedCode === v.code ? styles.copyLabelCopied : ''
                    }`}
                  >
                    {copiedCode === v.code ? 'COPIED ✓' : 'TAP TO COPY ↗'}
                  </span>
                </div>

                <div className={styles.cardFooter}>
                  <span>{v.minSpend}</span>
                  <span>{v.expiry}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How to Redeem */}
        <div className={styles.redeemSection}>
          <h3 className={styles.redeemTitle}>How to Apply Your Voucher</h3>
          <div className={styles.stepsGrid}>
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepText}>
                <h4>Copy Code</h4>
                <p>Tap any voucher code above to copy it instantly to your clipboard.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepText}>
                <h4>Select Fits</h4>
                <p>Add your preferred heavyweight tees, truckers, or denim cargo pants to your bag.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepText}>
                <h4>Checkout</h4>
                <p>Enter the code during checkout or enjoy automatic free Lagos delivery on orders ₦85,000+.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.ctaRow}>
          <Link href="/shop" className="btn btn-sky btn-lg">
            Shop Latest AW-26 Drops →
          </Link>
          <Link href="/checkout" className="btn btn-outline btn-lg">
            Go to Checkout ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
