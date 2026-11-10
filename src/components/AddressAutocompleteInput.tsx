'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (details: {
    address: string;
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
  }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: any;
    initDeenDripGoogleMaps?: () => void;
  }
}

export default function AddressAutocompleteInput({
  id = 'deliveryAddress',
  value,
  onChange,
  onPlaceSelected,
  placeholder = 'Street address, house number, apartment/estate',
  required = true,
  className = '',
  disabled = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [hasSelectedGooglePlace, setHasSelectedGooglePlace] = useState(false);

  // Progressive enhancement: Google Maps is a support, not a hard blocker
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || typeof window === 'undefined') return;

    // If Google Maps is already loaded
    if (window.google?.maps?.places) {
      setIsMapsLoaded(true);
      initAutocomplete();
      return;
    }

    // Check if script is already injected
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setIsMapsLoaded(true);
        initAutocomplete();
      });
      return;
    }

    // Dynamically inject script safely
    window.initDeenDripGoogleMaps = () => {
      setIsMapsLoaded(true);
      initAutocomplete();
    };

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initDeenDripGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      // Graceful degradation: silently fall back to standard text input
      console.warn('Google Maps Autocomplete could not be loaded; continuing with standard address input.');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup callback
      if (window.initDeenDripGoogleMaps) {
        delete window.initDeenDripGoogleMaps;
      }
    };
  }, [apiKey]);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ng' },
        fields: ['address_components', 'formatted_address', 'geometry'],
        types: ['address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place || !place.formatted_address) return;

        onChange(place.formatted_address);
        setHasSelectedGooglePlace(true);

        if (onPlaceSelected) {
          let city = '';
          let state = '';

          // Parse address components for city/LGA and state
          if (place.address_components) {
            for (const component of place.address_components) {
              const types = component.types;
              if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
            }
          }

          onPlaceSelected({
            address: place.formatted_address,
            city: city || undefined,
            state: state || undefined,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          });
        }
      });

      autocompleteRef.current = autocomplete;
    } catch {
      // Graceful fallback
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        required={required}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setHasSelectedGooglePlace(false);
          onChange(e.target.value);
        }}
        className={className}
        style={{
          width: '100%',
          paddingRight: isMapsLoaded ? '100px' : '1rem',
        }}
        autoComplete="street-address"
      />

      {/* Optional subtle status indicator */}
      {isMapsLoaded && (
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.7rem',
            color: hasSelectedGooglePlace ? 'var(--accent-primary, #00ffd5)' : 'var(--text-muted, #888)',
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
          title={hasSelectedGooglePlace ? 'Location verified via Google Maps' : 'Google Maps address suggestions active'}
        >
          <span style={{ fontSize: '0.8rem' }}>{hasSelectedGooglePlace ? '✓' : '📍'}</span>
          <span>{hasSelectedGooglePlace ? 'Verified' : 'Maps'}</span>
        </div>
      )}
    </div>
  );
}
