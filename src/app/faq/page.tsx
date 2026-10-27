import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Frequently Asked Questions | Deen Drip',
  description: 'Answers to common questions regarding Deen Drip sizing, fabrics, payments, delivery, and pre-orders.',
};

export default function FaqPage() {
  const faqs = [
    {
      q: 'How does Deen Drip clothing fit?',
      a: 'All our tops and tees feature a relaxed, boxy drop-shoulder streetwear fit. They are cut generously across the chest and shoulders for a relaxed drape that respects modesty. If you prefer a more tailored or fitted look, we recommend ordering one size down from your usual size.',
    },
    {
      q: 'What is GSM and why does it matter?',
      a: 'GSM stands for Grams per Square Meter — the standard measurement of fabric density and weight. Ordinary commercial t-shirts are typically 140–180 GSM. Deen Drip tees are custom knitted at 280–300 GSM, and our sweatshirts reach 400 GSM. This gives them a substantial luxury drape that does not cling to the body and maintains structure after washing.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all Nigerian bank cards (Mastercard, Visa, Verve), direct bank transfers, and USSD via our secured Paystack payment gateway integration. All transactions are processed in Nigerian Naira (₦).',
    },
    {
      q: 'How long will delivery take?',
      a: 'Lagos orders typically arrive within 1–2 business days. Nationwide interstate orders take 3–5 business days. You will receive active SMS and WhatsApp tracking updates when your parcel is on the move.',
    },
    {
      q: 'Do you offer free delivery?',
      a: 'Yes! All Lagos deliveries qualify for 100% FREE shipping whenever your order subtotal is ₦85,000 or more.',
    },
    {
      q: 'What should I do if an item is sold out?',
      a: 'Our limited-run drops frequently sell out due to capped batch production. You can follow our official Instagram channel and sign up for restock notifications on the product detail page.',
    },
    {
      q: 'Can I cancel or modify my order after placing it?',
      a: 'Because our Lagos warehouse dispatches orders quickly, please message us immediately via WhatsApp or email orders@deendrip.com within 2 hours of placing your order if you need to adjust size or address.',
    },
  ];

  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <span className="section-tag">[ HELP CENTER ]</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 'var(--space-8)' }}>
          Everything you need to know about our products, sizing, delivery, and shopping experience.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)' }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {faq.q}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-12)', padding: 'var(--space-8)', backgroundColor: 'var(--sky-50)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--sky-200)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Still have questions?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--sky-700)', marginBottom: '1.25rem' }}>
            Our customer support desk is ready to assist you Monday through Saturday.
          </p>
          <Link href="/contact" className="btn btn-sky btn-sm">
            Contact Support Team ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
