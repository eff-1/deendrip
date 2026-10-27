import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getProducts } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Deen Drip',
    };
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return {
    title: `${product.name} | Deen Drip Streetwear`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Deen Drip`,
      description: product.description.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage.imageUrl, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get similar products: prefer same category first, then fill with other authentic drops
  const allProducts = getProducts();
  const sameCategory = allProducts.filter(p => p.id !== product.id && p.category === product.category);
  const otherProducts = allProducts.filter(p => p.id !== product.id && p.category !== product.category);
  const similarProducts = [...sameCategory, ...otherProducts].slice(0, 8);

  return <ProductDetailClient product={product} similarProducts={similarProducts} />;
}
