import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Delivery Policy | Deen Drip',
  description: 'Deen Drip weight-based delivery fees, Abuja/Benin rate cards, Lagos area dispatch, and real-time tracking.',
};

export default function ShippingPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <span className="section-tag">[ FULFILLMENT & LOGISTICS ]</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Shipping & Delivery
        </h1>

        <div style={{ padding: 'var(--space-4) var(--space-6)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', marginBottom: 'var(--space-8)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>Lagos Hub Dispatch:</strong> All orders are packaged with custom Deen Drip dust-bags and tamper-proof security tags from our Lagos fulfillment studio. Free delivery automatically activates on Lagos orders over ₦85,000.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          
          {/* Section 1: Lagos Delivery */}
          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              1. Within Lagos Delivery & Area Pricing
            </h2>
            <p>
              We operate our central dispatch hub in Lagos. Rates are automatically calculated based on your destination neighborhood:
            </p>
            
            <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                    <th style={{ padding: '10px 14px' }}>Lagos Hub Zone</th>
                    <th style={{ padding: '10px 14px' }}>Coverage Areas</th>
                    <th style={{ padding: '10px 14px' }}>Delivery Rate</th>
                    <th style={{ padding: '10px 14px' }}>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>Mainland Urban</td>
                    <td style={{ padding: '10px 14px' }}>Ikeja, Yaba, Surulere, Gbagada, Maryland, Magodo, Ogudu, Festac</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent-primary)', fontWeight: 700 }}>₦3,000</td>
                    <td style={{ padding: '10px 14px' }}>1–2 Days</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>Island & Lekki</td>
                    <td style={{ padding: '10px 14px' }}>Ikoyi, Victoria Island, Lekki Phase 1, Oniru, Marina, Chevron</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent-primary)', fontWeight: 700 }}>₦3,500</td>
                    <td style={{ padding: '10px 14px' }}>1–2 Days</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>Lekki Suburbs</td>
                    <td style={{ padding: '10px 14px' }}>Ajah, Sangotedo, Abraham Adesanya, Awoyaya, Lakowe, VGC</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent-primary)', fontWeight: 700 }}>₦4,500</td>
                    <td style={{ padding: '10px 14px' }}>1–2 Days</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>Lagos Outskirts</td>
                    <td style={{ padding: '10px 14px' }}>Ikorodu, Epe, Badagry, Alimosho, Egbeda, Ipaja, Sango Border</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent-primary)', fontWeight: 700 }}>₦5,500</td>
                    <td style={{ padding: '10px 14px' }}>2 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              * <strong>Free Lagos Shipping Promo:</strong> All Lagos orders of <strong>₦85,000 and above</strong> automatically receive 100% free delivery.
            </p>
          </section>

          {/* Section 2: Interstate Rates (Zone 2 - Benin Table) */}
          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              2. Zone 2: South West, Ilorin, Warri & Benin
            </h2>
            <p>
              Direct courier dispatch covering: <strong>All South West States</strong> (Oyo, Ogun, Osun, Ondo, Ekiti), plus <strong>Ilorin</strong>, <strong>Warri</strong>, and <strong>Benin City</strong>.
            </p>
            <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                    <th style={{ padding: '8px 12px' }}>Weight (KG)</th>
                    <th style={{ padding: '8px 12px' }}>Amount (NGN)</th>
                    <th style={{ padding: '8px 12px' }}>Weight (KG)</th>
                    <th style={{ padding: '8px 12px' }}>Amount (NGN)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>Up to 2.0 KG (Base)</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦7,500</td>
                    <td style={{ padding: '8px 12px' }}>5.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦20,800</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>2.5 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦9,500</td>
                    <td style={{ padding: '8px 12px' }}>6.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦25,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>3.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦12,000</td>
                    <td style={{ padding: '8px 12px' }}>7.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦29,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>3.5 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦14,000</td>
                    <td style={{ padding: '8px 12px' }}>8.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦33,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>4.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦16,500</td>
                    <td style={{ padding: '8px 12px' }}>9.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦38,000</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>4.5 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦18,500</td>
                    <td style={{ padding: '8px 12px' }}>10.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦42,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Delivery Timeline: 2 to 4 business days from dispatch.
            </p>
          </section>

          {/* Section 3: Interstate Rates (Zone 1 - Abuja Table) */}
          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              3. Zone 1: Abuja, Northern, Eastern & South-South States
            </h2>
            <p>
              Priority interstate logistics covering: <strong>Abuja (FCT)</strong>, <strong>All Northern States</strong> (Kano, Kaduna, Plateau, etc.), <strong>All Eastern States</strong> (Abia, Anambra, Enugu, Imo, Ebonyi), <strong>All South-South States</strong> (Port Harcourt / Rivers, Uyo, Calabar, Bayelsa), and <strong>Asaba</strong>.
            </p>
            <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                    <th style={{ padding: '8px 12px' }}>Weight (KG)</th>
                    <th style={{ padding: '8px 12px' }}>Amount (NGN)</th>
                    <th style={{ padding: '8px 12px' }}>Weight (KG)</th>
                    <th style={{ padding: '8px 12px' }}>Amount (NGN)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>Up to 2.0 KG (Base)</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦14,500</td>
                    <td style={{ padding: '8px 12px' }}>5.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦27,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>2.5 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦16,500</td>
                    <td style={{ padding: '8px 12px' }}>6.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦31,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>3.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦19,000</td>
                    <td style={{ padding: '8px 12px' }}>7.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦35,500</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>3.5 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦21,000</td>
                    <td style={{ padding: '8px 12px' }}>8.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦40,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px 12px' }}>4.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦23,000</td>
                    <td style={{ padding: '8px 12px' }}>9.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦46,000</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>4.5 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦25,000</td>
                    <td style={{ padding: '8px 12px' }}>10.0 KG</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>₦52,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Delivery Timeline: 3 to 5 business days from dispatch.
            </p>
          </section>

          {/* Section 4: Live Tracking & Google Maps Support */}
          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              4. Real-Time Tracking & Google Maps
            </h2>
            <p>
              Every Deen Drip order receives a unique Order Reference code and live interactive route tracking. Customers can track dispatch milestones from our Lagos studio to their doorstep, with direct WhatsApp dispatch support available anytime.
            </p>
          </section>

          <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-6)' }}>
            <p>Have an inquiry about an active shipment?</p>
            <Link href="/contact" className="btn btn-outline-sky btn-sm" style={{ marginTop: '0.5rem' }}>
              Contact Dispatch Support ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
