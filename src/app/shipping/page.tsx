import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Delivery Policy | Deen Drip',
  description: 'Deen Drip delivery fees, timelines, Lagos free shipping terms, and nationwide doorstep dispatch.',
};

export default function ShippingPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <span className="section-tag">[ FULFILLMENT & LOGISTICS ]</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Shipping & Delivery
        </h1>

        <div style={{ padding: 'var(--space-4) var(--space-6)', backgroundColor: 'var(--sky-50)', border: '1px solid var(--sky-200)', borderRadius: 'var(--radius-xs)', marginBottom: 'var(--space-8)', fontSize: '0.85rem', color: 'var(--sky-700)' }}>
          <strong>Client Review Notice:</strong> The rates and timelines below represent the confirmed operational baseline. Final delivery partners and fee adjustments will sync automatically as confirmed by Deen Drip management.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              1. Lagos Delivery Coverage & Rates
            </h2>
            <p>
              We operate a central dispatch hub in Lagos, ensuring the fastest fulfillment for all local orders across Lagos Island, Ikoyi, Victoria Island, Lekki, Ikeja, Yaba, Surulere, and surrounding areas.
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Free Delivery:</strong> Orders exceeding <strong>₦85,000</strong> automatically qualify for FREE Lagos delivery.</li>
              <li><strong>Standard Rate:</strong> Orders under ₦85,000 incur a flat dispatch fee of <strong>₦3,500</strong>.</li>
              <li><strong>Delivery Timeline:</strong> 1 to 2 business days from order confirmation.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              2. Nationwide Doorstep Delivery
            </h2>
            <p>
              We ship to all 36 Nigerian states and the Federal Capital Territory (Abuja) through verified interstate logistics partners.
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Nationwide Rate:</strong> Flat fee of <strong>₦6,500</strong> anywhere in Nigeria.</li>
              <li><strong>Delivery Timeline:</strong> 3 to 5 business days from dispatch.</li>
              <li><strong>Tracking:</strong> Real-time SMS and WhatsApp tracking notifications provided upon handover to the courier.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              3. Order Dispatch & Processing
            </h2>
            <p>
              Orders received Monday through Friday before 2:00 PM West Africa Time (WAT) are processed the same day. Orders placed on weekends or public holidays are processed the next business day.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              4. Failed Deliveries & Re-attempt
            </h2>
            <p>
              Our courier will attempt delivery up to two (2) times and contact the phone number provided at checkout. If an order cannot be delivered due to an unreachable recipient or incorrect address, it will return to our Lagos hub. Re-dispatch will incur standard shipping charges.
            </p>
          </section>

          <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-6)' }}>
            <p>Have an urgent inquiry regarding an active shipment?</p>
            <Link href="/contact" className="btn btn-outline-sky btn-sm" style={{ marginTop: '0.5rem' }}>
              Contact Dispatch Support ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
