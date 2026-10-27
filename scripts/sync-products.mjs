import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'deendrip.db');
const db = new DatabaseSync(dbPath);

console.log('Syncing 17 official products to SQLite database...');

// Clean existing products, variants, and product_images
db.exec('PRAGMA foreign_keys = OFF;');
db.exec('DELETE FROM product_images;');
db.exec('DELETE FROM product_variants;');
db.exec('DELETE FROM products;');
db.exec('PRAGMA foreign_keys = ON;');

const now = new Date().toISOString();

const products = [
  {
    id: 'prod-deendrip-vt-shirt-black',
    slug: 'deendrip-vt-shirt-black',
    name: 'Deendrip vt-shirt black',
    description: 'Deendrip signature V-neck notch cut tee in washed black featuring clean embroidered typography and structured streetwear drape.',
    category: 'tees',
    priceKobo: 2000000, // ₦20,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: '100% Premium Heavyweight Cotton',
      fit: 'Large boxy street fit with notch collar',
      weight: 'Heavyweight',
      features: ['Custom V-notch collar', 'Embroidered signature Deendrip script', 'Structured shoulder drape']
    },
    images: [
      { id: 'img-dd-v-blk-1', url: '/assets/products/Deendrip-vt-shirt-black.jpeg', alt: 'Deendrip vt-shirt black - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-dd-v-blk-2', url: '/assets/products/Deendri-vt-shirt-black_bck.jpeg', alt: 'Deendrip vt-shirt black - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-dd-v-blk-l', size: 'Large', stock: 15, sku: 'DD-VTSHIRT-BLK-L' }
    ]
  },
  {
    id: 'prod-deendrip-tshirt-grey',
    slug: 'deendrip-tshirt-grey',
    name: 'Deendrip Tshirt Grey',
    description: 'Premium quality Deendrip tee with custom notch neckline and contrast white underlayer accents. Features clean white embroidered Deendrip signature script on the chest and structured street drape.',
    category: 'tees',
    priceKobo: 2000000, // ₦20,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: '100% Premium Heavyweight Cotton',
      fit: 'Large boxy street fit with contrast layered hem',
      weight: 'Premium Quality',
      features: ['Custom notch V-collar with white insert', 'Contrast white double-layer bottom hem', 'Embroidered Deendrip script', 'Split hem detailing']
    },
    images: [
      { id: 'img-dd-t-gry-1', url: '/assets/products/Deendrip-Tshirt-Grey.jpg', alt: 'Deendrip Tshirt Grey - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-dd-t-gry-2', url: '/assets/products/Deendrip-Tshirt-Grey_bck.jpg', alt: 'Deendrip Tshirt Grey - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-dd-t-gry-l', size: 'Large', stock: 15, sku: 'DD-TSHIRT-GRY-L' }
    ]
  },
  {
    id: 'prod-hoodie-jalab-brown',
    slug: 'hoodie-jalab-brown',
    name: 'Hoodie jalab brown',
    description: 'Pre orders only. Groundbreaking fusion of the traditional Jalabiya silhouette with heavyweight street hoodie tailoring. Custom dropped shoulders, deep hood, and flowing split-hem lines in rich earth brown.',
    category: 'hoodies-polos',
    priceKobo: 4000000, // ₦40,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: '400 GSM Combed Fleece & Technical Cotton Blend',
      fit: 'Full length relaxed Jalabiya hoodie cut',
      weight: '400 GSM',
      features: ['Deep street hood', 'Jalabiya length profile', 'Dual side seam pockets', 'Pre-orders only allocation']
    },
    images: [
      { id: 'img-hd-jlb-1', url: '/assets/products/Hoodie-jalab-brown.jpeg', alt: 'Hoodie jalab brown - Flat lay view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-hd-jlb-2', url: '/assets/products/Hoodie-jalab-brown_model.jpeg', alt: 'Hoodie jalab brown - Model on street', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-hd-jlb-3', url: '/assets/products/Hoodie-jalab-brown_model2.jpeg', alt: 'Hoodie jalab brown - Model hood up view', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-hd-jlb-pre', size: 'Pre-Order (M - XL)', stock: 50, sku: 'DD-JALAB-BRN-PRE' }
    ]
  },
  {
    id: 'prod-palestine-kuffi-shirt-orange',
    slug: 'palestine-kuffi-shirt-orange',
    name: 'Palestine kuffi shirt orange',
    description: 'Statement street shirt in vibrant sunset orange featuring authentic woven Keffiyeh geometric patterns and structured boxy drape. Strictly 1 piece available.',
    category: 'shirts',
    priceKobo: 2000000, // ₦20,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Woven Jacquard Cotton Twill',
      fit: 'Relaxed boxy resort streetwear cut',
      weight: 'Woven Cotton',
      features: ['Full button front', 'Authentic Palestinian Keffiyeh pattern', 'Revere Cuban collar', 'Limited 1-piece drop']
    },
    images: [
      { id: 'img-pal-sh-org-1', url: '/assets/products/Palestine-kuffi-shirt-orange_frnt.jpeg', alt: 'Palestine kuffi shirt orange - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-pal-sh-org-2', url: '/assets/products/Palestine-kuffi-shirt-orange_bck.jpeg', alt: 'Palestine kuffi shirt orange - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-pal-sh-org-l', size: 'L', stock: 1, sku: 'DD-KUF-SH-ORG-L' }
    ]
  },
  {
    id: 'prod-baseball-jersey-green',
    slug: 'baseball-jersey-green',
    name: 'Baseball jersey green',
    description: 'Vintage collegiate cut Baseball Jersey in Forest Green with ribbed gold and white contrast sleeve banding, split raglan seams, and breathable performance double-knit mesh. Strictly 1 piece available.',
    category: 'tees',
    priceKobo: 2000000, // ₦20,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Breathable Performance Double-Knit Mesh',
      fit: 'Oversized boxy baseball silhouette',
      weight: 'Technical Mesh',
      features: ['Ribbed striped collar and sleeve bands', 'Raglan yoke cut', 'Drop shoulder street profile', 'Strictly 1 piece available']
    },
    images: [
      { id: 'img-bsb-grn-1', url: '/assets/products/Baseball-jersey-green.jpeg', alt: 'Baseball jersey green - Front view with No Deen No Drip print', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-bsb-grn-2', url: '/assets/products/Baseball-jersey-green_bck.jpeg', alt: 'Baseball jersey green - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-bsb-grn-1pc', size: '1 PC (L)', stock: 1, sku: 'DD-BSB-GRN-1PC' }
    ]
  },
  {
    id: 'prod-palestine-kuffi-tshirt-brown',
    slug: 'palestine-kuffi-tshirt-brown',
    name: 'Palestine kuffi Tshirt brown',
    description: 'Heavyweight cotton tee in deep chocolate brown featuring heritage Keffiyeh border motifs and signature Deendrip typography. Only 2 pieces available.',
    category: 'tees',
    priceKobo: 2000000, // ₦20,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: '100% Combed Cotton Heavyweight',
      fit: 'Boxy streetwear silhouette',
      weight: '240 GSM',
      features: ['Keffiyeh lattice border accents', 'Contrast ribbed neckline', 'Only 2 pieces available']
    },
    images: [
      { id: 'img-pal-t-brn-1', url: '/assets/products/Palestine-kuffi-Tshirt _frn_brn.jpeg', alt: 'Palestine kuffi Tshirt brown - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-pal-t-brn-2', url: '/assets/products/Palestine-kuffi-Tshirt _bck_brn.jpeg', alt: 'Palestine kuffi Tshirt brown - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-pal-t-brn-l', size: 'L', color: 'Brown', stock: 2, sku: 'DD-KUF-TEE-BRN' }
    ]
  },
  {
    id: 'prod-palestine-long-sleeve',
    slug: 'palestine-long-sleeve-mint-aqua',
    name: 'Palestine long sleeve',
    description: 'Long sleeve streetwear essential in fresh Mint Aqua tone featuring subtle heritage iconography and ribbed cuffs. Strictly 1 piece available.',
    category: 'tees',
    priceKobo: 2200000, // ₦22,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: '100% Combed Ringspun Cotton',
      fit: 'Relaxed street long-sleeve fit',
      weight: '220 GSM',
      features: ['Heavyweight ribbed cuffs', 'Mint Aqua heritage colorway', 'Strictly 1 piece available']
    },
    images: [
      { id: 'img-pal-ls-1', url: '/assets/products/Palestine-long-sleeve_front.jpeg', alt: 'Palestine long sleeve Mint Aqua - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-pal-ls-2', url: '/assets/products/Palestine-long-sleeve_bck.jpeg', alt: 'Palestine long sleeve Mint Aqua - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-pal-ls-1pc', size: 'Mint Aqua (1 PC)', color: 'Mint Aqua', stock: 1, sku: 'DD-PAL-LS-MNT-1PC' }
    ]
  },
  {
    id: 'prod-multi-colored-foam-truckers-style-2',
    slug: 'multi-colored-foam-truckers-style-2',
    name: 'Multi colored foam truckers - Style 2',
    description: 'Vibrant colorblock high-crown foam trucker cap with breathable rear mesh and adjustable snapback closure. Strictly 1 piece available.',
    category: 'caps',
    priceKobo: 800000, // ₦8,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'High-density Structured Foam with Mesh Back',
      fit: '5-Panel High Crown Structured Trucker',
      weight: 'Foam Mesh',
      features: ['Multi-color pattern block', 'Breathable athletic mesh rear', 'Adjustable snapback closure', 'Strictly 1 piece available']
    },
    images: [
      { id: 'img-mc-trk2-1', url: '/assets/products/multi-colored-foam-truckers2.jpg', alt: 'Multi colored foam truckers Style 2 - Flat cap', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-mc-trk2-2', url: '/assets/products/multi-colored-foam-truckers2_model_male.jpeg', alt: 'Multi colored foam truckers Style 2 - Male model', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-mc-trk2-3', url: '/assets/products/multi-colored-foam-truckers2_model_fem.jpeg', alt: 'Multi colored foam truckers Style 2 - Female model', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-mc-trk2-os', size: 'ONE SIZE', stock: 1, sku: 'DD-MC-TRK2-OS' }
    ]
  },
  {
    id: 'prod-multi-colored-foam-truckers-style-1',
    slug: 'multi-colored-foam-truckers-style-1',
    name: 'Multi colored foam truckers - Style 1',
    description: 'Signature multi-colored panel foam trucker cap with breathable rear mesh and custom Deendrip street accents. Strictly 1 piece available.',
    category: 'caps',
    priceKobo: 800000, // ₦8,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'High-density Structured Foam with Mesh Back',
      fit: '5-Panel High Crown Structured Trucker',
      weight: 'Foam Mesh',
      features: ['Signature multicolor front graphics', 'Rear mesh cooling panels', 'Adjustable snapback closure', 'Strictly 1 piece available']
    },
    images: [
      { id: 'img-mc-trk1-1', url: '/assets/products/multi-colored-foam-truckers.jpg', alt: 'Multi colored foam truckers Style 1 - Flat cap', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-mc-trk1-2', url: '/assets/products/multi-colored-foam-truckers_model_male.jpeg', alt: 'Multi colored foam truckers Style 1 - Male model', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-mc-trk1-3', url: '/assets/products/multi-colored-foam-truckers_model_fem.jpeg', alt: 'Multi colored foam truckers Style 1 - Female model', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-mc-trk1-os', size: 'ONE SIZE', stock: 1, sku: 'DD-MC-TRK1-OS' }
    ]
  },
  {
    id: 'prod-foam-truckers',
    slug: 'foam-truckers',
    name: 'Foam truckers',
    description: 'Classic lightweight foam trucker cap with premium mesh ventilation and adjustable snapback closure. Only 1 piece available.',
    category: 'caps',
    priceKobo: 500000, // ₦5,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Lightweight Foam & Poly Mesh',
      fit: 'Classic 5-Panel Trucker',
      weight: 'Lightweight',
      features: ['Foam front crown', 'Breathable mesh back', 'Adjustable snapback', 'Strictly 1 piece available']
    },
    images: [
      { id: 'img-fm-trk-1', url: '/assets/products/foam-truckers.jpeg', alt: 'Foam truckers - Cap front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-fm-trk-2', url: '/assets/products/foam-truckers_male_model.jpeg', alt: 'Foam truckers - Male model rocking cap', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-fm-trk-3', url: '/assets/products/foam-truckers_fem_model.png', alt: 'Foam truckers - Female model rocking cap', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-fm-trk-os', size: 'ONE SIZE', stock: 1, sku: 'DD-FM-TRK-OS' }
    ]
  },
  {
    id: 'prod-palestine-knight-foam-trucker',
    slug: 'palestine-knight-foam-trucker',
    name: 'Palestine Knight Foam Trucker',
    description: 'Palestine Knight edition foam trucker hat with high-profile structured front and breathable rear mesh. Strictly 1 piece available.',
    category: 'caps',
    priceKobo: 500000, // ₦5,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Structured Foam Front with Poly Mesh Rear',
      fit: '5-Panel Structured Trucker Cap',
      weight: 'Structured Foam',
      features: ['Palestine Knight graphic insignia', 'Breathable rear mesh', 'Adjustable snapback strap', 'Strictly 1 piece available']
    },
    images: [
      { id: 'img-pal-knt-1', url: '/assets/products/Palestine-Knight-Snapback.jpeg', alt: 'Palestine Knight Foam Trucker - Cap view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-pal-knt-2', url: '/assets/products/Palestine-Knight-Snapback_model_male.jpeg', alt: 'Palestine Knight Foam Trucker - Male model', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-pal-knt-3', url: '/assets/products/Palestine-Knight-Snapback_model_fem.jpeg', alt: 'Palestine Knight Foam Trucker - Female model', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-pal-knt-os', size: 'ONE SIZE', stock: 1, sku: 'DD-PAL-KNT-OS' }
    ]
  },
  {
    id: 'prod-hard-truckers',
    slug: 'hard-truckers',
    name: 'Hard truckers',
    description: 'Reinforced heavy-buckram hard trucker cap in military forest olive with precision embroidered Deendrip crest and structured crown.',
    category: 'caps',
    priceKobo: 1200000, // ₦12,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Heavy Buckram Structured Cotton Canvas with Industrial Mesh',
      fit: 'Reinforced Deep Crown Profile',
      weight: 'Heavy Structured',
      features: ['Reinforced hard crown buckram', 'Embroidered Deendrip calligraphy', 'Durable double-stitched visor']
    },
    images: [
      { id: 'img-hrd-trk-1', url: '/assets/products/Hard-truckers.jpeg', alt: 'Hard truckers - Front cap view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-hrd-trk-2', url: '/assets/products/Hard-truckers_model_male.png', alt: 'Hard truckers - Male model on street', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-hrd-trk-3', url: '/assets/products/Hard-truckers_model_fem.png', alt: 'Hard truckers - Female model on street', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-hrd-trk-os', size: 'ONE SIZE', stock: 10, sku: 'DD-HRD-TRK-OS' }
    ]
  },
  {
    id: 'prod-honeycomb-baseball-cap',
    slug: 'honeycomb-baseball-cap',
    name: 'Honeycomb baseball cap',
    description: 'Engineered honeycomb textured fabric curved-brim baseball cap with sleek tonal black aesthetic and metal slide strap.',
    category: 'caps',
    priceKobo: 1200000, // ₦12,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Engineered Honeycomb Hex-Weave Polyester',
      fit: '6-Panel Curved Brim Athletic Baseball Cap',
      weight: 'Technical Weave',
      features: ['Hexagonal micro-texture weave', 'Moisture-wicking sweatband', 'Antiqued gunmetal slide closure']
    },
    images: [
      { id: 'img-hcomb-1', url: '/assets/products/Honeycomb-baseball-cap.jpeg', alt: 'Honeycomb baseball cap - Product view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-hcomb-2', url: '/assets/products/Honeycomb-baseball-cap_models.jpg', alt: 'Honeycomb baseball cap - Models wearing cap', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-hcomb-os', size: 'ONE SIZE', stock: 12, sku: 'DD-HCMB-CAP-OS' }
    ]
  },
  {
    id: 'prod-multi-colored-jean-cargo-pants-style-1',
    slug: 'multi-colored-jean-cargo-pants-style-1',
    name: 'Multi colored Jean cargo pants - Style 1',
    description: 'Patterned denim cargo pants Style 01 featuring 6 utility pockets, contrast white drawstring waistband, relaxed wide-leg street drape, and signature Deendrip script embroidery.',
    category: 'trousers',
    priceKobo: 2200000, // ₦22,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Heavyweight Patterned Denim Twill',
      fit: 'Relaxed wide-leg cargo silhouette',
      weight: 'Heavy Denim',
      features: ['6-pocket cargo utility layout', 'Contrast white drawstring elastic waist', 'Embroidered signature Deendrip script', 'Reinforced knee panels']
    },
    images: [
      { id: 'img-cargo1-1', url: '/assets/products/Multi-colored-Jean-cargo-pants.jpeg', alt: 'Multi colored Jean cargo pants Style 1 - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-cargo1-2', url: '/assets/products/Multi-colored-Jean-cargo-pants-side.jpeg', alt: 'Multi colored Jean cargo pants Style 1 - Side angle view', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-cargo1-3', url: '/assets/products/Multi-colored-Jean-cargo-pants-bck.jpeg', alt: 'Multi colored Jean cargo pants Style 1 - Back pocket view', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-cargo1-m', size: 'M (30-32)', stock: 10, sku: 'DD-CRG1-M' },
      { id: 'var-cargo1-l', size: 'L (32-34)', stock: 10, sku: 'DD-CRG1-L' },
      { id: 'var-cargo1-xl', size: 'XL (34-36)', stock: 5, sku: 'DD-CRG1-XL' }
    ]
  },
  {
    id: 'prod-multi-colored-jean-cargo-pants-style-2',
    slug: 'multi-colored-jean-cargo-pants-style-2',
    name: 'Multi colored Jean cargo pants - Style 2',
    description: 'Patterned denim cargo pants Style 02 with custom wash panels, tactical deep flap pockets, and relaxed streetwear fit.',
    category: 'trousers',
    priceKobo: 2200000, // ₦22,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: 'Heavyweight Patterned Denim Twill',
      fit: 'Relaxed wide-leg cargo silhouette',
      weight: 'Heavy Denim',
      features: ['6-pocket cargo utility layout', 'Custom geometric wash pattern', 'Reinforced stitch points', 'Adjustable waist cords']
    },
    images: [
      { id: 'img-cargo2-1', url: '/assets/products/Multi-colored-Jean-cargo-pants2.jpeg', alt: 'Multi colored Jean cargo pants Style 2 - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-cargo2-2', url: '/assets/products/Multi-colored-Jean-cargo-pants-side2.jpeg', alt: 'Multi colored Jean cargo pants Style 2 - Side angle view', isPrimary: 0, isAlt: 1, sort: 1 },
      { id: 'img-cargo2-3', url: '/assets/products/Multi-colored-Jean-cargo-pants-bck2.jpeg', alt: 'Multi colored Jean cargo pants Style 2 - Back view', isPrimary: 0, isAlt: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-cargo2-m', size: 'M (30-32)', stock: 10, sku: 'DD-CRG2-M' },
      { id: 'var-cargo2-l', size: 'L (32-34)', stock: 10, sku: 'DD-CRG2-L' },
      { id: 'var-cargo2-xl', size: 'XL (34-36)', stock: 5, sku: 'DD-CRG2-XL' }
    ]
  },
  {
    id: 'prod-palestine-kuffi-tshirt-blue',
    slug: 'palestine-kuffi-tshirt-blue',
    name: 'Palestine kuffi Tshirt blue',
    description: 'Heavyweight cotton tee in deep Mediterranean Blue featuring heritage Keffiyeh border motifs and signature Deendrip typography. Only 2 pieces available.',
    category: 'tees',
    priceKobo: 2000000, // ₦20,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: '100% Combed Cotton Heavyweight',
      fit: 'Boxy streetwear silhouette',
      weight: '240 GSM',
      features: ['Keffiyeh lattice border accents', 'Contrast ribbed neckline', 'Only 2 pieces available']
    },
    images: [
      { id: 'img-pal-t-blu-1', url: '/assets/products/Palestine-kuffi-Tshirt _frn_blu.jpeg', alt: 'Palestine kuffi Tshirt blue - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-pal-t-blu-2', url: '/assets/products/Palestine-kuffi-Tshirt _bck_blu.jpeg', alt: 'Palestine kuffi Tshirt blue - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-pal-t-blu-l', size: 'L', color: 'Blue', stock: 2, sku: 'DD-KUF-TEE-BLU' }
    ]
  },
  {
    id: 'prod-palestine-kuffi-tshirt-grey',
    slug: 'palestine-kuffi-tshirt-grey',
    name: 'Palestine kuffi Tshirt grey',
    description: 'Heavyweight cotton tee in vintage Heather Grey featuring heritage Keffiyeh border motifs and signature Deendrip typography. Only 2 pieces available.',
    category: 'tees',
    priceKobo: 2000000, // ₦20,000
    isPublished: 1,
    isFeatured: 1,
    isNewDrop: 1,
    details: {
      material: '100% Combed Cotton Heavyweight',
      fit: 'Boxy streetwear silhouette',
      weight: '240 GSM',
      features: ['Keffiyeh lattice border accents', 'Contrast ribbed neckline', 'Only 2 pieces available']
    },
    images: [
      { id: 'img-pal-t-gry-1', url: '/assets/products/Palestine-kuffi-Tshirt _frt_grey.jpeg', alt: 'Palestine kuffi Tshirt grey - Front view', isPrimary: 1, isAlt: 0, sort: 0 },
      { id: 'img-pal-t-gry-2', url: '/assets/products/Palestine-kuffi-Tshirt _bck_grey.jpeg', alt: 'Palestine kuffi Tshirt grey - Back view', isPrimary: 0, isAlt: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-pal-t-gry-l', size: 'L', color: 'Grey', stock: 2, sku: 'DD-KUF-TEE-GRY' }
    ]
  }
];

const insertProduct = db.prepare(`
  INSERT INTO products (id, slug, name, description, category, price_kobo, is_published, is_featured, is_new_drop, details_json, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertImage = db.prepare(`
  INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, is_alternate, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertVariant = db.prepare(`
  INSERT INTO product_variants (id, product_id, size, color, stock_quantity, sku, price_override_kobo)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');

for (const p of products) {
  insertProduct.run(
    p.id,
    p.slug,
    p.name,
    p.description,
    p.category,
    p.priceKobo,
    p.isPublished,
    p.isFeatured,
    p.isNewDrop,
    JSON.stringify(p.details),
    now
  );

  for (const img of p.images) {
    insertImage.run(
      img.id,
      p.id,
      img.url,
      img.alt,
      img.isPrimary,
      img.isAlt,
      img.sort
    );
  }

  for (const v of p.variants) {
    insertVariant.run(
      v.id,
      p.id,
      v.size,
      v.color || null,
      v.stock,
      v.sku,
      null
    );
  }
}

db.exec('COMMIT;');

console.log(`Successfully synced ${products.length} products into SQLite!`);
