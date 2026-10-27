import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Returns & Exchange Policy | Deen Drip',
  description: 'Deen Drip 7-day exchange and returns policy for unworn streetwear garments.',
};

export default function ReturnsPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <span className="section-tag">[ CUSTOMER SATISFACTION ]</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Returns & Exchanges
        </h1>

        <div style={{ padding: 'var(--space-4) var(--space-6)', backgroundColor: 'var(--sky-50)', border: '1px solid var(--sky-200)', borderRadius: 'var(--radius-xs)', marginBottom: 'var(--space-8)', fontSize: '0.85rem', color: 'var(--sky-700)' }}>
          <strong>Draft Business Policy:</strong> Outlines customer rights and quality assurance standards. Subject to final review and approval by Deen Drip management.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              1. 7-Day Exchange Window
            </h2>
            <p>
              We want you to feel confident in every piece. If you need a different size or received an incorrect item, you may request an exchange within <strong>seven (7) days</strong> of receiving your parcel.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              2. Return Eligibility Criteria
            </h2>
            <p>To be accepted for return or exchange, garments must satisfy the following strict requirements:</p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Unworn, unwashed, and free of perfumes, body odors, and makeup marks.</li>
              <li>All original swing tags, neck labels, and packaging intact.</li>
              <li>Headwear (caps and beanies) must not show signs of forehead wear or sweatband staining.</li>
              <li>Sale or archive drop clearance items marked "Final Sale" cannot be refunded.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              3. Damaged or Defective Items
            </h2>
            <p>
              Every garment undergoes three points of quality control before leaving our Lagos facility. In the unlikely event that you receive a defective garment or print error, contact us within 48 hours of delivery with photographic evidence. We will arrange a courier pickup and dispatch an immediate replacement at zero cost to you.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              4. How to Initiate an Exchange
            </h2>
            <p>
              Email <strong>orders@deendrip.com</strong> with your order reference number (e.g. <code>DD-84912-X</code>), photos of the item, and the replacement size required. Our customer service team will respond within 24 hours with return instructions.
            </p>
          </section>

          <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-6)' }}>
            <Link href="/contact" className="btn btn-sky btn-sm">
              Contact Returns Desk ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
