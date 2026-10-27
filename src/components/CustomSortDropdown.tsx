'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './CustomSortDropdown.module.css';

interface SortOption {
  value: string;
  label: string;
  sublabel?: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'featured', label: 'Featured Drops', sublabel: 'Curated by Deen Drip' },
  { value: 'newest', label: 'Newest Arrivals', sublabel: 'Freshly released' },
  { value: 'price-low', label: 'Price: Low to High', sublabel: 'Affordable first' },
  { value: 'price-high', label: 'Price: High to Low', sublabel: 'Exclusive first' },
];

interface CustomSortDropdownProps {
  currentSort: string;
}

export default function CustomSortDropdown({ currentSort }: CustomSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedOption = SORT_OPTIONS.find(opt => opt.value === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (value === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    const query = params.toString();
    const targetUrl = query ? `/shop?${query}` : '/shop';
    router.push(targetUrl, { scroll: false });
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.prefixLabel}>Sort:</span>
        <span className={styles.currentValue}>{selectedOption.label}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.menu} role="listbox">
          <div className={styles.menuHeader}>SORT CATALOGUE</div>
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === selectedOption.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <div className={styles.optionContent}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.sublabel && (
                    <span className={styles.optionSublabel}>{option.sublabel}</span>
                  )}
                </div>
                {isSelected && (
                  <svg
                    className={styles.checkIcon}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
