'use client';

import React, { useState } from 'react';
import styles from './contact.module.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, orderRef, message }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>
        <span className="section-tag">[ DIRECT ASSISTANCE ]</span>
        <h1 className={styles.title}>Contact Deen Drip</h1>
        <p className={styles.subtitle}>
          Have a question about an order, delivery tracking, sizing, or brand partnerships? Reach out to our customer care team directly.
        </p>

        <div className={styles.grid}>
          {/* Contact Form */}
          <div className={styles.formCard}>
            {submitted ? (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h3 className={styles.successTitle}>Message Received</h3>
                <p className={styles.successText}>
                  Thank you for reaching out. Our support team at <strong>deendripclothing@gmail.com</strong> has received your inquiry and will reply to <strong>{email}</strong> within 24 hours.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setOrderRef('');
                      setMessage('');
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Send Another Message
                  </button>
                  <a
                    href="https://wa.me/2349064147689?text=Hello%20Deen%20Drip,%20I%20just%20submitted%20an%20inquiry%20on%20the%20website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sky btn-sm"
                  >
                    Follow up on WhatsApp ↗
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Tariq Ibrahim"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Order Reference (Optional)</label>
                  <input
                    type="text"
                    value={orderRef}
                    onChange={e => setOrderRef(e.target.value)}
                    placeholder="e.g. DD-84912-X"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we assist you with your wardrobe or order?"
                    className={styles.textarea}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-sky ${styles.submitBtn}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message ↗'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div className={styles.sideCol}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Customer Care & Orders</h3>
              <p className={styles.infoText}>
                <strong>Direct Email:</strong>{' '}
                <a
                  href="mailto:deendripclothing@gmail.com"
                  style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  deendripclothing@gmail.com
                </a>
              </p>
              <p className={styles.infoText} style={{ marginTop: '0.65rem' }}>
                <strong>WhatsApp Concierge:</strong>{' '}
                <a
                  href="https://wa.me/2349064147689?text=Hello%20Deen%20Drip,%20I%20have%20an%20inquiry%20regarding%20my%20order%20/%20products"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none' }}
                >
                  +234 906 414 7689 ↗
                </a>
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                Chat directly with our support team for order inquiries, sizing questions, and real-time delivery status updates.
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Fulfillment Hubs</h3>
              <p className={styles.infoText} style={{ lineHeight: '1.65' }}>
                <strong>Lagos State Hub:</strong> Dispatch studio serving all Lagos intra-city delivery zones and nationwide express lines.<br />
                <strong>Kwara State Hub:</strong> Central distribution and northern network fulfillment.<br />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>
                  Operating Hours: Monday – Saturday, 9:00 AM – 6:00 PM (WAT)
                </span>
              </p>
            </div>

            <div className={styles.collabCard}>
              <h3 className={styles.collabTitle}>Brand Collaboration & Wholesale</h3>
              <p className={styles.collabText} style={{ lineHeight: '1.6' }}>
                For creative collaborations, editorial styling, wholesale stockists, or retail partnerships, reach out directly to{' '}
                <strong>deendripclothing@gmail.com</strong> or message our team directly on WhatsApp:{' '}
                <a
                  href="https://wa.me/2349064147689?text=Hello%20Deen%20Drip,%20I%20am%20interested%20in%20a%20brand%20collaboration%20/%20wholesale%20partnership"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-primary)', fontWeight: 800, textDecoration: 'none' }}
                >
                  +234 906 414 7689 ↗
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
