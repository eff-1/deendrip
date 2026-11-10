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
      id: 'sahari-line',
      title: 'Sahari Line Hoodie Jalab',
      tagline: '450 GSM Ultra-Heavyweight · 4 Colorways',
      description: 'The signature elongated Jalabiya-meets-hoodie silhouette in Midnight Black, Light Blue, Olive Green, and Off-White. Premium fleece, architectural hood, split side-hem vents.',
      image: '/assets/products/sahari-line-hoodie-jalab-black.jpeg',
      link: '/shop?category=hoodies-polos',
      itemsCount: '4 Colorways',
    },
    {
      id: 'palestine-kuffi',
      title: 'Palestine Kuffi Collection',
      tagline: 'Shirts, Tees & Long Sleeves',
      description: 'Heritage Keffiyeh-patterned streetwear across orange button-down shirts, heavyweight tees in brown, blue, grey, and chocolate, plus long-sleeve graphic prints.',
      image: '/assets/products/palestine-kuffi-shirt-orange-frnt.jpeg',
      link: '/shop?category=tees',
      itemsCount: '7 Pieces',
    },
    {
      id: 'caps-archive',
      title: 'Headwear Archive',
      tagline: 'Foam Truckers, Snapbacks & Script Caps',
      description: 'Multi-colored foam truckers, Palestine Knight snapbacks, hard truckers, honeycomb baseball caps, and hand-finished 3D script embroidery.',
      image: '/assets/products/multi-colored-foam-truckers.jpg',
      link: '/shop?category=caps',
      itemsCount: '8 Styles',
    },
    {
      id: 'essential-hoodies',
      title: 'Essential Streetwear Hoodie',
      tagline: '380 GSM Brushed Fleece',
      description: 'The everyday luxury staple. Drop-shoulder profile, tonal drawstring hood, deep kangaroo pouch, and durable ribbed cuffs. Also features the brown Hoodie Jalab.',
      image: '/assets/products/hoodie-essential-front.jpeg',
      link: '/shop?category=hoodies-polos',
      itemsCount: '3 Pieces',
    },
    {
      id: 'cargo-pants',
      title: 'Jean Cargo & Utility Pants',
      tagline: 'Multi-Colored Denim Cargo',
      description: 'Statement multi-colored jean cargo pants in two distinct styles with side pocket detailing and relaxed streetwear fit.',
      image: '/assets/products/multi-colored-jean-cargo-pants.jpeg',
      link: '/shop?category=trousers',
      itemsCount: '2 Styles',
    },
    {
      id: 'graphic-tees',
      title: 'Deendrip Signature Tees',
      tagline: 'V-Notch & Grey Script Series',
      description: 'Premium V-notch cut black tee and contrast grey tee with embroidered Deendrip signature script and structured street drape.',
      image: '/assets/products/deendrip-vt-shirt-black.jpeg',
      link: '/shop?category=tees',
      itemsCount: '2 Designs',
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="container">
          <span className="section-tag">COLLECTIONS</span>
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
                <Link href={col.link} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Explore Drop →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
