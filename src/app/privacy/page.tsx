import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Deen Drip',
  description: 'Deen Drip customer privacy policy, data protection, and Nigeria Data Protection Regulation (NDPR) adherence.',
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <span className="section-tag">[ PRIVACY & DATA PROTECTION ]</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Privacy Policy
        </h1>

        <div style={{ padding: 'var(--space-4) var(--space-6)', backgroundColor: 'var(--sky-50)', border: '1px solid var(--sky-200)', borderRadius: 'var(--radius-xs)', marginBottom: 'var(--space-8)', fontSize: '0.85rem', color: 'var(--sky-700)' }}>
          <strong>Draft Data Policy:</strong> Demonstrates compliance with the Nigeria Data Protection Act (NDPA) and NDPR standards. Subject to legal ratification.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              1. Information We Collect
            </h2>
            <p>
              When you purchase an item or contact us, we collect the personal information necessary to fulfill your order and provide delivery tracking:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Contact Information:</strong> Full name, email address, and phone number.</li>
              <li><strong>Fulfillment Details:</strong> Delivery address, city, and state.</li>
              <li><strong>Transaction Records:</strong> Authoritative order totals and gateway payment references.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              2. Payment Data Security
            </h2>
            <p>
              <strong>We never store, log, or process sensitive payment card numbers (PANs) or CVVs on our servers.</strong> All payments are processed through PCI-DSS Level 1 compliant gateway providers (such as Paystack). Deen Drip receives only cryptographic settlement tokens and transaction references.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              3. Use of Your Personal Data
            </h2>
            <p>We use your information exclusively to:</p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Process and fulfill orders, including sharing address details with logistics partners.</li>
              <li>Send automated order confirmation receipts and shipping tracking updates.</li>
              <li>Prevent fraudulent transactions and protect our customers.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              4. Data Retention & Deletion
            </h2>
            <p>
              We retain customer order records solely as required for accounting and tax compliance under Nigerian law. You may request the deletion of non-essential marketing information by emailing <strong>privacy@deendrip.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
