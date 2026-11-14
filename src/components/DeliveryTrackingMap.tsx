'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './DeliveryTrackingMap.module.css';

interface DeliveryTrackingMapProps {
  orderReference: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  fulfillmentStatus: string;
  deliveryFeeKobo: number;
  trackingReference?: string | null;
}

export default function DeliveryTrackingMap({
  orderReference,
  deliveryAddress,
  deliveryCity,
  deliveryState,
  fulfillmentStatus,
  deliveryFeeKobo,
  trackingReference,
}: DeliveryTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Step index for fulfillment timeline
  const statusLower = (fulfillmentStatus || 'pending').toLowerCase();
  let activeStep = 1;
  if (statusLower === 'processing') activeStep = 2;
  if (statusLower === 'shipped' || statusLower === 'dispatched') activeStep = 3;
  if (statusLower === 'delivered') activeStep = 4;

  const isLagos = deliveryState.toLowerCase().includes('lagos');

  useEffect(() => {
    if (!apiKey || !mapContainerRef.current || typeof window === 'undefined') return;

    if (window.google?.maps) {
      initMap();
      return;
    }

    // Check if script already exists
    if (!document.getElementById('google-maps-tracking-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-tracking-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [apiKey]);

  const initMap = () => {
    if (!mapContainerRef.current || !window.google?.maps || mapInitialized) return;

    try {
      // Lagos Deen Drip Fulfillment Hub coordinates (approx Lekki/Ikeja)
      const hubLocation = { lat: 6.4549, lng: 3.4246 };

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: hubLocation,
        zoom: isLagos ? 12 : 7,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#161920' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#161920' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#232936' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1f2c' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
        ],
      });

      // Hub Marker
      new window.google.maps.Marker({
        position: hubLocation,
        map,
        title: 'Deen Drip Lagos Hub',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#00ffd5',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });

      // Geocode destination if available
      const geocoder = new window.google.maps.Geocoder();
      const fullDestination = `${deliveryAddress}, ${deliveryCity}, ${deliveryState}, Nigeria`;

      geocoder.geocode({ address: fullDestination }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const destLocation = results[0].geometry.location;

          new window.google.maps.Marker({
            position: destLocation,
            map,
            title: 'Delivery Destination',
          });

          // Draw delivery route line
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(hubLocation);
          bounds.extend(destLocation);
          map.fitBounds(bounds);

          new window.google.maps.Polyline({
            path: [hubLocation, destLocation],
            geodesic: true,
            strokeColor: '#00ffd5',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map,
          });
        }
      });

      setMapInitialized(true);
    } catch {
      // Fallback to editorial visualizer
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Deen Drip Dispatch Support, I would like to track my order #${orderReference} shipping to ${deliveryCity}, ${deliveryState}.`
  );

  return (
    <div className={styles.trackingContainer}>
      <div className={styles.headerRow}>
        <div className={styles.headerInfo}>
          <span className={styles.badge}>Live Delivery Tracking</span>
          <h2 className={styles.heading}>Dispatch & Transit Hub</h2>
          <p className={styles.subtext}>
            Origin: <strong>Deen Drip Lagos Studio Hub</strong> → Destination: <strong>{deliveryCity}, {deliveryState}</strong>
          </p>
          {trackingReference && (
            <p style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--accent-primary, #00ffd5)' }}>
              Waybill / Handover: <strong>{trackingReference}</strong>
            </p>
          )}
        </div>

        <a
          href={`https://wa.me/2348000000000?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.dispatchChatBtn}
        >
          <span>Chat with Dispatch</span>
          <span>💬</span>
        </a>
      </div>

      {/* 4-Step Interactive Fulfillment Progress */}
      <div className={styles.timeline}>
        <div className={`${styles.timelineStep} ${activeStep >= 1 ? styles.stepDone : ''}`}>
          <div className={styles.stepCircle}>{activeStep > 1 ? '✓' : '1'}</div>
          <div className={styles.stepLabel}>Order Placed</div>
        </div>

        <div className={styles.timelineConnector} />

        <div className={`${styles.timelineStep} ${activeStep >= 2 ? styles.stepDone : ''}`}>
          <div className={styles.stepCircle}>{activeStep > 2 ? '✓' : '2'}</div>
          <div className={styles.stepLabel}>Quality Check & Packed</div>
        </div>

        <div className={styles.timelineConnector} />

        <div className={`${styles.timelineStep} ${activeStep >= 3 ? styles.stepDone : ''}`}>
          <div className={styles.stepCircle}>{activeStep > 3 ? '✓' : '3'}</div>
          <div className={styles.stepLabel}>In Transit with Courier</div>
        </div>

        <div className={styles.timelineConnector} />

        <div className={`${styles.timelineStep} ${activeStep >= 4 ? styles.stepDone : ''}`}>
          <div className={styles.stepCircle}>4</div>
          <div className={styles.stepLabel}>Delivered</div>
        </div>
      </div>

      {/* Map or Editorial Route Visualizer */}
      <div className={styles.mapCard}>
        {apiKey ? (
          <div ref={mapContainerRef} className={styles.googleMapFrame} />
        ) : (
          <div className={styles.editorialRouteVisual}>
            <div className={styles.routeHeader}>
              <span className={styles.pulseDot} />
              <span>Real-Time Logistics Route Monitor</span>
            </div>

            <div className={styles.routeNodes}>
              <div className={styles.routeNode}>
                <div className={styles.nodeIcon}>🏢</div>
                <div className={styles.nodeMeta}>
                  <strong>Lagos Hub Central</strong>
                  <span>Main Fulfillment Center</span>
                </div>
              </div>

              <div className={styles.transitTrack}>
                <div className={styles.transitBar} />
                <div className={styles.transitRider}>🚚</div>
              </div>

              <div className={styles.routeNode}>
                <div className={styles.nodeIcon}>📍</div>
                <div className={styles.nodeMeta}>
                  <strong>{deliveryCity || deliveryState}</strong>
                  <span>{deliveryAddress}</span>
                </div>
              </div>
            </div>

            <div className={styles.routeFooter}>
              <span>Estimated Delivery: {isLagos ? '1–2 Business Days' : '3–5 Business Days'}</span>
              <span>Courier Handover: Active Tamper-Proof Seal</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
