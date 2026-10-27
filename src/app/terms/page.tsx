import React from 'react';

export const metadata = {
  title: 'Terms of Service | Deen Drip',
  description: 'Deen Drip online store terms of service, purchasing conditions, and user agreement.',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <span className="section-tag">[ LEGAL & COMPLIANCE ]</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Terms of Service
        </h1>

        <div style={{ padding: 'var(--space-4) var(--space-6)', backgroundColor: 'var(--sky-50)', border: '1px solid var(--sky-200)', borderRadius: 'var(--radius-xs)', marginBottom: 'var(--space-8)', fontSize: '0.85rem', color: 'var(--sky-700)' }}>
          <strong>Draft Legal Baseline:</strong> This document represents the standard operational terms for the Deen Drip digital storefront. Final commercial and legal wording will be ratified by client legal representatives.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              1. General Overview
            </h2>
            <p>
              This website is operated by Deen Drip ("we", "us", or "our"). By visiting our site and purchasing products from us, you engage in our "Service" and agree to be bound by the following terms and conditions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              2. Products and Pricing
            </h2>
            <p>
              All prices are listed in Nigerian Naira (₦). We reserve the right to modify prices or discontinue items without notice. While we make every effort to display accurate colorways and textures of our apparel, actual appearance may vary slightly depending on monitor calibration.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              3. Orders and Authoritative Calculation
            </h2>
            <p>
              All orders are subject to stock availability and server-side payment verification. In the event an item becomes unavailable after payment due to rapid inventory depletion during high-volume drops, we will issue a full refund or offer an equivalent replacement at the customer's discretion.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              4. Intellectual Property
            </h2>
            <p>
              The "Deen Drip" brand name, Arabic calligraphy trademarks, custom typography, lookbook photography, and garment designs are the intellectual property of Deen Drip. Any unauthorized duplication or commercial reproduction is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              5. Governing Law
            </h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
