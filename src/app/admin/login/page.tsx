'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoSrc = theme === 'dark'
    ? '/assets/brand/deen-drip-logo-white.png'
    : '/assets/brand/deen-drip-logo-black.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-6)' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg-card)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Image
            src={logoSrc}
            alt="Deen Drip"
            width={140}
            height={50}
            style={{ margin: '0 auto var(--space-3) auto', objectFit: 'contain' }}
          />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Staff Admin Portal
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Authorised personnel only. All access is logged.
          </p>
        </div>

        {error && (
          <div role="alert" style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-xs)', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="admin-email" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem', outline: 'none', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="admin-password" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem', outline: 'none', width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn btn-sky"
            style={{ width: '100%', marginTop: '0.5rem', height: '48px' }}
          >
            {loading ? 'Authenticating…' : 'Sign In to Portal'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Contact the store owner if you need access or a password reset.
        </p>
      </div>
    </div>
  );
}
