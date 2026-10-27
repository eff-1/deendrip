import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Deen Drip | Fashion That Speaks Deen · #NoDeenNoDrip',
  description: 'The story and philosophy behind DEENDRIP. Nigerian Islamic streetwear built on the belief that your style and faith can coexist.',
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-12) 0 var(--space-24) 0' }}>
      <div className="container" style={{ maxWidth: '980px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span className="section-tag" style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>
            [ 01 // BRAND MANIFESTO ]
          </span>
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            margin: 'var(--space-3) 0 var(--space-4) 0',
            color: 'var(--text-primary)'
          }}>
            Fashion That Speaks Deen.
          </h1>
          <div style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            #NoDeenNoDrip
          </div>
        </div>

        {/* ── Main Campaign Visual ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
          marginBottom: 'var(--space-12)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <Image
            src="/assets/campaign/hero-campaign-aw24.webp"
            alt="Deen Drip Streetwear Campaign - Dunya Busy Dirty But We Look Clean"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 980px"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* ── Editorial Narrative ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>

          {/* Section 1: Who We Are */}
          <section>
            <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 'var(--space-2)' }}>
              01 // WHO WE ARE
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
              Your Style and Your Faith Can Coexist.
            </h2>
            <p style={{ fontSize: '1.08rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>DEENDRIP</strong> is a Nigerian Islamic streetwear movement built on a simple conviction: you should never have to choose between genuine street style and authentic devotion to Allah.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              We are more than just a clothing label. We are a cultural movement inspired by the desire to bring Deen into everyday fashion — creating pieces that reflect our identity as Muslims while fully embracing the creativity, comfort, and bold expression of contemporary streetwear.
            </p>
          </section>

          {/* Section 2: Our Story (Challenging the Stigma) */}
          <section style={{
            padding: 'var(--space-8)',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--accent-primary)'
          }}>
            <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 'var(--space-2)' }}>
              02 // THE GENESIS & STORY
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
              Challenging The Assumptions of Piety.
            </h2>
            <p style={{ fontSize: '1.02rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              DEENDRIP was born out of a glaring gap in Nigeria’s fashion landscape: the lack of widely recognizable, home-grown Islamic streetwear that allows Muslims to express their faith through modern aesthetics.
            </p>
            <p style={{ fontSize: '1.02rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              We also noticed how people are too often judged simply by what they wear. A person wearing a graphic tee, a trucker cap, or oversized casual streetwear can be unfairly perceived as less religious, less moral, or less conscious of their faith.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-primary)', fontWeight: 600 }}>
              We reject that premise entirely. Clothing alone does not define a person’s level of faith, character, or relationship with Allah. A Muslim can appreciate streetwear, dress casually with creative edge, and still strive fiercely to live by the teachings of Islam.
            </p>
            <p style={{ fontSize: '1.02rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--space-4)', margin: 0 }}>
              This inspired DEENDRIP: a brand that challenges these assumptions and gives Muslims the confidence to wear their identity with pride — without feeling forced to choose between personal style and their Deen.
            </p>
          </section>

          {/* Section 3: Our Inspiration (DEEN Squad) */}
          <section>
            <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 'var(--space-2)' }}>
              03 // THE SONIC BLUEPRINT
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
              Wearable Reminders Inspired by DEEN Squad.
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Our creative journey draws profound inspiration from <strong>DEEN Squad</strong>, the pioneering Islamic musical duo whose lyrics carry reminders, hard lessons, and spiritual messages that resonate deeply with youth worldwide.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              Many of our designs translate that same energy — transforming meaningful lyrics and Quranic reminders into wearable expressions of faith. Through our cuts and graphics, we aim to make those reminders part of your daily routine: not just words you hear, but armor you wear.
            </p>
          </section>

          {/* Section 4: What We Stand For (4 Pillars) */}
          <section>
            <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 'var(--space-2)' }}>
              04 // WHAT WE STAND FOR
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 'var(--space-6)', letterSpacing: '-0.02em' }}>
              Four Pillars of The Movement.
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-5)'
            }}>
              <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.85rem' }}>01 / FAITH</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 'var(--space-2) 0', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Unapologetic Purpose</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  Clothing designed with spiritual intention, reminding believers of their purpose wherever they walk.
                </p>
              </div>

              <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.85rem' }}>02 / MODESTY</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 'var(--space-2) 0', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Street & Gym Cuts</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  Boxy drop-shoulder tees, relaxed cargo pants, and structured fits honoring Islamic modesty guidelines.
                </p>
              </div>

              <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.85rem' }}>03 / INTEGRITY</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 'var(--space-2) 0', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Heavyweight Standard</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  280–400 GSM luxury combed cottons, custom 3D puff embroidery, and durability made to last.
                </p>
              </div>

              <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)' }}>
                <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.85rem' }}>04 / COMMUNITY</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 'var(--space-2) 0', color: 'var(--text-primary)', textTransform: 'uppercase' }}>No Pietymeter</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  We don't measure anyone's piety. We foster a community where Muslims express themselves without judgment.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: The Vision & Closing Banner */}
          <div style={{
            padding: 'var(--space-10) var(--space-8)',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--text-inverse)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            border: '1px solid var(--border-dark)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--sky-400)', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              OUR VISION
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: 'var(--space-3) 0 var(--space-4) 0', letterSpacing: '-0.03em' }}>
              Nigeria To The Global Ummah.
            </h2>
            <p style={{ maxWidth: '640px', margin: '0 auto var(--space-6) auto', color: '#94a3b8', fontSize: '1.02rem', lineHeight: '1.7' }}>
              To establish DEENDRIP as the defining name in Islamic streetwear across Nigeria and beyond — a brand that makes faith-inspired fashion accessible, meaningful, and relevant to a new generation.
            </p>
            <div style={{
              display: 'inline-block',
              padding: 'var(--space-4) var(--space-6)',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: 'var(--space-8)'
            }}>
              <p style={{ fontFamily: 'var(--font-family-mono)', color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, margin: 0, letterSpacing: '0.06em' }}>
                Wear your style. Remember your purpose. Stay connected to your Deen.
              </p>
              <span style={{ color: 'var(--sky-400)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.1em' }}>
                #NoDeenNoDrip
              </span>
            </div>
            <div>
              <Link href="/shop" className="btn btn-sky" style={{ padding: '0.85rem 2rem', fontSize: '0.85rem' }}>
                Shop The Latest Drop ↗
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
