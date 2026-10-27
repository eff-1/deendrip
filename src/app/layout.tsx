import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://deendrip.com'),
  title: 'Deen Drip | Faith-Driven Streetwear & Apparel',
  description: 'Contemporary Muslim-inspired streetwear intertwining faith, cultural identity, and premium heavyweight construction. Designed in Nigeria for the worldwide movement.',
  keywords: ['Deen Drip', 'streetwear', 'Muslim streetwear', 'faith fashion', 'Lagos fashion', 'heavyweight tee', 'caps', 'Islamic streetwear'],
  openGraph: {
    title: 'Deen Drip | Faith-Driven Streetwear',
    description: 'Contemporary apparel grounded in identity, faith, and street culture.',
    url: 'https://deendrip.com',
    siteName: 'Deen Drip',
    images: [
      {
        url: '/assets/campaign/hero-architectural-brutalist.webp',
        width: 1200,
        height: 630,
        alt: 'Deen Drip AW-26 Campaign',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deen Drip | Faith-Driven Streetwear',
    description: 'Contemporary apparel grounded in identity, faith, and street culture.',
    images: ['/assets/campaign/hero-architectural-brutalist.webp'],
  },
  icons: {
    icon: '/assets/brand/deen-drip-logo-black.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('deendrip_theme_v1');
                  if (stored === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main style={{ flexGrow: 1 }}>{children}</main>
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
