'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { formatNaira } from '@/lib/formatters';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSelect?: () => void;
  onClose?: () => void;
  autoFocus?: boolean;
}

const searchCache = new Map<string, Product[]>();

export default function SearchBar({ onSelect, onClose, autoFocus }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        if (onClose) onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search query with fast 120ms debounce and in-memory caching
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    if (searchCache.has(trimmed)) {
      setResults(searchCache.get(trimmed) || []);
      setIsOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          const items = data.products || [];
          searchCache.set(trimmed, items);
          setResults(items);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search request error:', err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onSelect) onSelect();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleItemClick = () => {
    setIsOpen(false);
    setQuery('');
    if (onSelect) onSelect();
  };

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <div className={styles.searchBarWrapper}>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search tees, caps, hoodies, tracksuits..."
            className={styles.searchInput}
            aria-label="Search products"
          />

          {query && (
            <button type="button" onClick={handleClear} className={styles.clearBtn} aria-label="Clear search">
              ✕
            </button>
          )}

          <button type="submit" className={styles.searchBtn} aria-label="Submit search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.closeSearchBtn}
            aria-label="Close search"
            title="Close search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>{loading ? 'Searching...' : `Found ${results.length} piece${results.length === 1 ? '' : 's'}`}</span>
          </div>

          {results.length > 0 ? (
            <>
              <ul className={styles.resultsList}>
                {results.map(prod => {
                  const thumb = prod.images.find(img => img.isPrimary) || prod.images[0];
                  return (
                    <li key={prod.id}>
                      <Link href={`/products/${prod.slug}`} onClick={handleItemClick} className={styles.resultItem}>
                        <div className={styles.thumbWrapper}>
                          {thumb ? (
                            <Image
                              src={thumb.imageUrl}
                              alt={prod.name}
                              fill
                              sizes="44px"
                              className={styles.thumbImg}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-secondary)' }} />
                          )}
                        </div>

                        <div className={styles.resultMeta}>
                          <div className={styles.resultName}>{prod.name}</div>
                          <span className={styles.resultCategory}>{prod.category.replace('-', ' ')}</span>
                        </div>

                        <div className={styles.resultPrice}>{formatNaira(prod.priceKobo)}</div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link href={`/shop?q=${encodeURIComponent(query)}`} onClick={handleItemClick} className={styles.viewAllRow}>
                View All Results in Shop →
              </Link>
            </>
          ) : (
            !loading && (
              <div className={styles.emptyResults}>
                No apparel matching &ldquo;{query}&rdquo;.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
