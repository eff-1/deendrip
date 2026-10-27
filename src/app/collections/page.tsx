import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './collections.module.css';

export const metadata = {
  title: 'Collections | Deen Drip',
  description: 'Curated editorial drops and signature streetwear capsule collections by Deen Drip.',
};

export default function CollectionsPage() {
  const collections = [
    {
      id: 'vol-02',
      title: 'Vol. 02 // Made For The Deen',
      tagline: 'Autumn/Winter 2024 Collection',
      description: 'Our seminal drop celebrating identity, Palestinian solidarity, and uncompromising street silhouettes.',
      image: '/assets/campaign/hero-campaign-aw24.webp',
      link: '/shop',
      itemsCount: '9 Pieces',
    },
    {
      id: 'caps-archive',
      title: 'Headwear Archive',
      tagline: 'Structured & Trucker Series',
      description: 'Hand-finished 3D script embroidery on heavy cotton twill and vintage foam trucker silhouettes.',
      image: '/assets/products/deen-drip-script-cap.webp',
      link: '/shop?category=caps',
      itemsCount: '4 Styles',
    },
    {
      id: 'heavyweight-tees',
      title: 'Heavyweight Graphic Tops',
      tagline: '280–300 GSM Combed Cotton',
      description: 'Boxy drop-shoulder cuts featuring original graffiti prints and spine calligraphy.',
      image: '/assets/products/let-gaza-live-front.webp',
      link: '/shop?category=tees',
      itemsCount: '3 Designs',
    },
    {
      id: 'tracksuits-sets',
      title: 'Utility & Track Sets',
      tagline: 'Nylon Taslan & Organic Fleece',
      description: 'Colorblocked paneling and heavy loopback fleece pants built for modest movement and city living.',
      image: '/assets/products/panelled-tracksuit.webp',
      link: '/shop?category=tracksuits',
      itemsCount: '3 Sets',
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="container">
          <span className="section-tag">[ CAPSULE RELEASES ]</span>
          <h1 className={styles.title}>Deen Drip Collections</h1>
          <p className={styles.subtitle}>
            Every drop is a unified narrative of faith, craftsmanship, and street culture.
          </p>
        </div>
      </header>

      <div className="container">
        <div className={styles.grid}>
          {collections.map(col => (
            <div key={col.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.image}
                />
                <div className={styles.overlay} />
                <span className={styles.countBadge}>{col.itemsCount}</span>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.tagline}>{col.tagline}</span>
                <h2 className={styles.cardTitle}>{col.title}</h2>
                <p className={styles.cardDesc}>{col.description}</p>
                <Link href={col.link} className="btn btn-sky btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Explore Drop ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
