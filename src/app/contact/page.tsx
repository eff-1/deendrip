'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <span className="section-tag">[ DIRECT ASSISTANCE ]</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Contact Deen Drip
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 'var(--space-10)' }}>
          Have a question about an order, sizing, or upcoming drop? Reach out to our team directly.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 'var(--space-10)' }}>
          {/* Contact Form */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-8)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--sky-100)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Message Received
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Thank you for reaching out. A customer support representative will reply to <strong>{email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '1.5rem' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Order Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderRef}
                    onChange={e => setOrderRef(e.target.value)}
                    placeholder="e.g. DD-84912-X"
                    style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we assist you?"
                    style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-sky" style={{ height: '48px', marginTop: '0.5rem' }}>
                  Send Message ↗
                </button>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                Customer Care & Orders
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                <strong>Email:</strong> orders@deendrip.com
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                <strong>Inquiries:</strong> hello@deendrip.com
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                <strong>WhatsApp / Phone:</strong> +234 801 234 5678
              </p>
            </div>

            <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                Fulfillment Hub
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                Lagos, Nigeria<br />
                Operating Hours: Monday – Saturday<br />
                9:00 AM – 6:00 PM (WAT)
              </p>
            </div>

            <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: 'var(--radius-xs)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-vibrant)', marginBottom: '0.5rem' }}>
                Brand Collaboration
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                For wholesale, press, and brand collaborations, please write with your portfolio to <strong>collabs@deendrip.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
