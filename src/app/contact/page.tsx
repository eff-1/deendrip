'use client';

import React, { useState } from 'react';
import styles from './contact.module.css';

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
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>
        <span className="section-tag">[ DIRECT ASSISTANCE ]</span>
        <h1 className={styles.title}>Contact Deen Drip</h1>
        <p className={styles.subtitle}>
          Have a question about an order, sizing, or upcoming drop? Reach out to our team directly.
        </p>

        <div className={styles.grid}>
          {/* Contact Form */}
          <div className={styles.formCard}>
            {submitted ? (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h3 className={styles.successTitle}>Message Received</h3>
                <p className={styles.successText}>
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
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
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
                    placeholder="How can we assist you?"
                    className={styles.textarea}
                  />
                </div>

                <button type="submit" className={`btn btn-sky ${styles.submitBtn}`}>
                  Send Message ↗
                </button>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div className={styles.sideCol}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Customer Care & Orders</h3>
              <p className={styles.infoText}>
                <strong>Email:</strong> orders@deendrip.com
              </p>
              <p className={styles.infoText}>
                <strong>Inquiries:</strong> hello@deendrip.com
              </p>
              <p className={styles.infoText}>
                <strong>WhatsApp / Phone:</strong> +234 801 234 5678
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Fulfillment Hub</h3>
              <p className={styles.infoText} style={{ lineHeight: '1.6' }}>
                Lagos, Nigeria<br />
                Operating Hours: Monday – Saturday<br />
                9:00 AM – 6:00 PM (WAT)
              </p>
            </div>

            <div className={styles.collabCard}>
              <h3 className={styles.collabTitle}>Brand Collaboration</h3>
              <p className={styles.collabText}>
                For wholesale, press, and brand collaborations, please write with your portfolio to <strong>collabs@deendrip.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
