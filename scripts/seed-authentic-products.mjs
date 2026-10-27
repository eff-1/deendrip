import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'deendrip.db');
const db = new DatabaseSync(dbPath);

const products = [
  {
    id: 'prod-deendrip-tshirt',
    slug: 'deendrip-tshirt',
    name: 'Deendrip T-Shirt',
    description: 'Signature Deendrip Heavyweight Tee featuring custom chest embroidery, layered split hem, and premium structured streetwear drape. Available in Black and Grey.',
    category: 'tees',
    price_kobo: 1800000, // ₦18,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: '100% Premium Heavyweight Combed Cotton',
      fit: 'Relaxed boxy street fit with contrast layered hem',
      weight: '280 GSM Heavyweight',
      care: ['Machine wash cold inside out', 'Hang dry only', 'Iron low on reverse side'],
      features: ['Custom notch V-collar with white insert', 'Contrast white double-layer bottom hem', 'Embroidered Deendrip script on chest', 'Split hem detailing']
    }),
    images: [
      { id: 'img-dd-tshirt-1', url: '/assets/products/deendrip-tshirt.jpeg', alt: 'Deendrip T-Shirt Black - Front view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-dd-tshirt-2', url: '/assets/products/deendrip-shirt_bck.jpeg', alt: 'Deendrip T-Shirt Black - Back view', isPrimary: 0, isAlternate: 1, sort: 1 },
      { id: 'img-dd-tshirt-3', url: '/assets/products/deendrip-tshirt-grey-front.jpg', alt: 'Deendrip T-Shirt Grey edition - Front', isPrimary: 0, isAlternate: 0, sort: 2 },
      { id: 'img-dd-tshirt-4', url: '/assets/products/deendrip-tshirt-grey-back.jpg', alt: 'Deendrip T-Shirt Grey edition - Back', isPrimary: 0, isAlternate: 0, sort: 3 }
    ],
    variants: [
      { id: 'var-dd-tee-m', size: 'M (Black)', stock: 15, sku: 'DD-TSHIRT-BLK-M' },
      { id: 'var-dd-tee-l', size: 'L (Black)', stock: 20, sku: 'DD-TSHIRT-BLK-L' },
      { id: 'var-dd-tee-xl', size: 'XL (Black)', stock: 10, sku: 'DD-TSHIRT-BLK-XL' },
      { id: 'var-dd-tee-gry-l', size: 'Large (Grey)', stock: 20, sku: 'DD-TSHIRT-GRY-L', priceOverrideKobo: 2000000 }
    ]
  },
  {
    id: 'prod-black-honeycomb-cap',
    slug: 'black-honeycomb-baseball-cap',
    name: 'Black Honeycomb Baseball Cap',
    description: 'Structured Black Honeycomb textured baseball cap with curved brim, hexagonal ventilated weave, metallic Deendrip rear adjuster, and modern streetwear crown.',
    category: 'caps',
    price_kobo: 1200000, // ₦12,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'Engineered Honeycomb Ripstop Poly-Cotton',
      fit: 'Structured 6-Panel Low Crown Baseball Cap',
      weight: 'Lightweight Breathable',
      care: ['Spot clean with damp cloth', 'Do not submerge', 'Air dry only'],
      features: ['Hexagonal micro-mesh honeycomb texture', 'Pre-curved rigid visor', 'Embossed metallic buckle strapback', 'Moisture-wicking inner sweatband']
    }),
    images: [
      { id: 'img-honeycomb-1', url: '/assets/products/honeycomb-baseball-cap.jpeg', alt: 'Black Honeycomb Baseball Cap - Studio front view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-honeycomb-2', url: '/assets/products/honeycomb-baseball-cap_models.jpg', alt: 'Black Honeycomb Baseball Cap - Models editorial shot', isPrimary: 0, isAlternate: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-honeycomb-os', size: 'ONE SIZE', stock: 12, sku: 'DD-CAP-HNC-BLK' }
    ]
  },
  {
    id: 'prod-hard-truckers-green',
    slug: 'hard-truckers-green',
    name: 'Hard Truckers Green',
    description: 'Heavy-duty structured hard trucker cap featuring rigid buckram crown, deep forest green visor, breathable poly mesh back, and 3D Deendrip front badge. 1 pc available.',
    category: 'caps',
    price_kobo: 1200000, // ₦12,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'Rigid Twill Visor & Structured Poly Mesh Back',
      fit: 'High-Crown Structured Hard Trucker',
      weight: 'Heavyweight Cap',
      features: ['Rigid hard-foam buckram front', 'Forest green reinforced stitch brim', 'Adjustable 7-hole snapback', 'High breathability rear mesh', '1 pc exclusive unit']
    }),
    images: [
      { id: 'img-hard-trk-1', url: '/assets/products/hard-truckers.jpeg', alt: 'Hard Truckers Green - Front flat view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-hard-trk-2', url: '/assets/products/hard-truckers_model_male.png', alt: 'Hard Truckers Green worn by male model', isPrimary: 0, isAlternate: 1, sort: 1 },
      { id: 'img-hard-trk-3', url: '/assets/products/hard-truckers_model_fem.png', alt: 'Hard Truckers Green worn by female model', isPrimary: 0, isAlternate: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-hard-trk-os', size: 'ONE SIZE (1 pc only)', stock: 1, sku: 'DD-TRK-HRD-GRN' }
    ]
  },
  {
    id: 'prod-foam-truckers',
    slug: 'foam-truckers',
    name: 'Foam Truckers',
    description: 'Classic two-tone foam trucker cap with comfortable padded foam crown, breathable mesh back panels, and adjustable snapback closure. 1 pc each.',
    category: 'caps',
    price_kobo: 500000, // ₦5,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'Padded Polyester Foam Crown with Breathable Mesh',
      fit: '5-Panel High Crown Structured Foam Trucker',
      weight: 'Lightweight Foam',
      features: ['Structured foam front panel', 'Breathable mesh back', 'Adjustable plastic snapback', '1 pc each limited release']
    }),
    images: [
      { id: 'img-foam-trk-1', url: '/assets/products/foam-truckers.jpeg', alt: 'Foam Truckers - Front flat lay', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-foam-trk-2', url: '/assets/products/foam-truckers_male_model.jpeg', alt: 'Foam Truckers worn by male model', isPrimary: 0, isAlternate: 1, sort: 1 },
      { id: 'img-foam-trk-3', url: '/assets/products/foam-truckers_fem_model.png', alt: 'Foam Truckers worn by female model', isPrimary: 0, isAlternate: 0, sort: 2 }
    ],
    variants: [
      { id: 'var-foam-trk-os', size: 'ONE SIZE (1 pc each)', stock: 1, sku: 'DD-TRK-FOAM-OS' }
    ]
  },
  {
    id: 'prod-palestine-knight-snapback',
    slug: 'palestine-knight-snapback',
    name: 'Palestine Knight Snapback Cap',
    description: 'Exclusive Palestine Knight emblem foam trucker cap with two-tone crown, heritage Palestine flag crest, and soft breathable mesh. 1 pc each.',
    category: 'caps',
    price_kobo: 500000, // ₦5,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'Padded Foam Front with Breathable Poly Mesh Back',
      fit: '5-Panel High Crown Snapback Trucker',
      weight: 'Lightweight Foam',
      features: ['Palestine flag knight silhouette crest', 'Classic burgundy/white two-tone colorway', 'Snapback adjustable fit', '1 pc each limited piece']
    }),
    images: [
      { id: 'img-pal-snap-1', url: '/assets/products/palestine-knight-snapback.jpeg', alt: 'Palestine Knight Snapback Cap - Flat lay', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-pal-snap-2', url: '/assets/products/palestine-knight-snapback_model_male.jpeg', alt: 'Palestine Knight cap male editorial', isPrimary: 0, isAlternate: 1, sort: 1 },
      { id: 'img-pal-snap-3', url: '/assets/products/palestine-knight-snapback_model_fem.jpeg', alt: 'Palestine Knight cap female editorial', isPrimary: 0, isAlternate: 0, sort: 2 },
      { id: 'img-pal-snap-4', url: '/assets/products/palestine-bat-trucker-model-male.jpg', alt: 'Palestine Knight cap male model studio', isPrimary: 0, isAlternate: 0, sort: 3 },
      { id: 'img-pal-snap-5', url: '/assets/products/palestine-bat-trucker-model-female.jpg', alt: 'Palestine Knight cap worn by female model with grey hijab', isPrimary: 0, isAlternate: 0, sort: 4 }
    ],
    variants: [
      { id: 'var-pal-knight-os', size: 'ONE SIZE (1 pc each)', stock: 1, sku: 'DD-CAP-PAL-KNIGHT' }
    ]
  },
  {
    id: 'prod-multi-colored-trucker',
    slug: 'multi-colored-foam-truckers',
    name: 'Multi Colored Foam Truckers',
    description: 'Vibrant signature Deen Drip multi-colored foam truckers featuring bold purple and white high crown, drop logo embroidery, and mesh back panels. 1 pc each available.',
    category: 'caps',
    price_kobo: 800000, // ₦8,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'High-density Foam crown with Poly Mesh',
      fit: '5-Panel High Crown Foam Trucker',
      weight: 'Foam Trucker',
      features: ['Royal purple visor and mesh panels', 'Clean white foam front with Deen Drip calligraphy', 'Adjustable snapback closure', '1 pc each limited release']
    }),
    images: [
      { id: 'img-purp-trk-1', url: '/assets/products/purple-foam-trucker-front.jpg', alt: 'Multi Colored Foam Truckers Purple - Studio flat view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-purp-trk-2', url: '/assets/products/purple-foam-trucker-model-female.png', alt: 'Purple foam trucker worn by female model with grey hijab', isPrimary: 0, isAlternate: 1, sort: 1 },
      { id: 'img-purp-trk-3', url: '/assets/products/purple-foam-trucker-model-male.jpg', alt: 'Purple foam trucker worn by male model', isPrimary: 0, isAlternate: 0, sort: 2 },
      { id: 'img-purp-trk-4', url: '/assets/products/multi-colored-foam-truckers.jpg', alt: 'Multi colored foam truckers edition 1', isPrimary: 0, isAlternate: 0, sort: 3 },
      { id: 'img-purp-trk-5', url: '/assets/products/multi-colored-foam-truckers_model_male.jpeg', alt: 'Multi colored trucker edition 1 male model', isPrimary: 0, isAlternate: 0, sort: 4 },
      { id: 'img-purp-trk-6', url: '/assets/products/multi-colored-foam-truckers_model_fem.jpeg', alt: 'Multi colored trucker edition 1 female model', isPrimary: 0, isAlternate: 0, sort: 5 },
      { id: 'img-purp-trk-7', url: '/assets/products/multi-colored-foam-truckers2.jpg', alt: 'Multi colored foam truckers edition 2', isPrimary: 0, isAlternate: 0, sort: 6 },
      { id: 'img-purp-trk-8', url: '/assets/products/multi-colored-foam-truckers2_model_male.jpeg', alt: 'Multi colored trucker edition 2 male model', isPrimary: 0, isAlternate: 0, sort: 7 },
      { id: 'img-purp-trk-9', url: '/assets/products/multi-colored-foam-truckers2_model_fem.jpeg', alt: 'Multi colored trucker edition 2 female model', isPrimary: 0, isAlternate: 0, sort: 8 }
    ],
    variants: [
      { id: 'var-purp-trk-os', size: 'Purple Edition (1 pc)', stock: 1, sku: 'DD-TRK-MC-PURP' },
      { id: 'var-mc1-trk-os', size: 'Colorway 1 (1 pc)', stock: 1, sku: 'DD-TRK-MC-CW1' },
      { id: 'var-mc2-trk-os', size: 'Colorway 2 (1 pc)', stock: 1, sku: 'DD-TRK-MC-CW2' }
    ]
  },
  {
    id: 'prod-palestine-long-sleeve',
    slug: 'palestine-long-sleeve-mint-aqua',
    name: 'Palestine Long Sleeve Mint Aqua',
    description: 'Exclusive Mint Aqua heavyweight long sleeve t-shirt with Palestine typographic iconography, ribbed cuffs, and heavyweight streetwear drop. 1 pc only.',
    category: 'tees',
    price_kobo: 2200000, // ₦22,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: '100% Combed Heavy Cotton (Mint Aqua)',
      fit: 'Boxy Long Sleeve with Fitted Ribbed Cuffs',
      weight: '260 GSM',
      care: ['Machine wash cold inside out', 'Hang dry only'],
      features: ['Mint aqua colorway', 'Palestine heritage chest artwork', '1 pc exclusive unit in stock']
    }),
    images: [
      { id: 'img-pal-ls-1', url: '/assets/products/palestine-long-sleeve_front.jpeg', alt: 'Palestine Long Sleeve Mint Aqua - Front view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-pal-ls-2', url: '/assets/products/palestine-long-sleeve_bck.jpeg', alt: 'Palestine Long Sleeve Mint Aqua - Back view', isPrimary: 0, isAlternate: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-pal-ls-l', size: 'Mint Aqua (1 pc only)', stock: 1, sku: 'DD-LS-PAL-AQUA' }
    ]
  },
  {
    id: 'prod-palestine-kuffi-tshirt',
    slug: 'palestine-kuffi-tshirt',
    name: 'Palestine Kuffi T-Shirt',
    description: 'Deen Drip Palestine Kuffi Heavyweight T-Shirt blending traditional Kuffiyeh woven heritage with modern streetwear silhouette. Available in Grey, Blue, Brown, and Chocolate Brown. 2 available.',
    category: 'tees',
    price_kobo: 2000000, // ₦20,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: '100% Heavyweight Ringspun Cotton',
      fit: 'Oversized Street Cut with Dropped Shoulders',
      weight: '280 GSM',
      care: ['Machine wash cold inside out', 'Line dry recommended'],
      features: ['Palestine Kuffiyeh chest & back graphics', 'Screen printed with water-based durable inks', '2 pieces available total']
    }),
    images: [
      { id: 'img-kuffi-tee-1', url: '/assets/products/palestine-kuffi-tshirt-_frt_grey.jpeg', alt: 'Palestine Kuffi T-Shirt Grey - Front', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-kuffi-tee-2', url: '/assets/products/palestine-kuffi-tshirt-_bck_grey.jpeg', alt: 'Palestine Kuffi T-Shirt Grey - Back', isPrimary: 0, isAlternate: 1, sort: 1 },
      { id: 'img-kuffi-tee-3', url: '/assets/products/palestine-kuffi-tshirt-_frn_blu.jpeg', alt: 'Palestine Kuffi T-Shirt Blue - Front', isPrimary: 0, isAlternate: 0, sort: 2 },
      { id: 'img-kuffi-tee-4', url: '/assets/products/palestine-kuffi-tshirt-_bck_blu.jpeg', alt: 'Palestine Kuffi T-Shirt Blue - Back', isPrimary: 0, isAlternate: 0, sort: 3 },
      { id: 'img-kuffi-tee-5', url: '/assets/products/palestine-kuffi-tshirt-_frn_brn.jpeg', alt: 'Palestine Kuffi T-Shirt Brown - Front', isPrimary: 0, isAlternate: 0, sort: 4 },
      { id: 'img-kuffi-tee-6', url: '/assets/products/palestine-kuffi-tshirt-_bck_brn.jpeg', alt: 'Palestine Kuffi T-Shirt Brown - Back', isPrimary: 0, isAlternate: 0, sort: 5 },
      { id: 'img-kuffi-tee-7', url: '/assets/products/palestine-kuffi-tshirt-_frnt_chocolate-brown.jpeg', alt: 'Palestine Kuffi T-Shirt Chocolate Brown - Front', isPrimary: 0, isAlternate: 0, sort: 6 },
      { id: 'img-kuffi-tee-8', url: '/assets/products/palestine-kuffi-tshirt-_bck_chocolate-brown.jpeg', alt: 'Palestine Kuffi T-Shirt Chocolate Brown - Back', isPrimary: 0, isAlternate: 0, sort: 7 },
      { id: 'img-kuffi-tee-9', url: '/assets/products/palestine-kuffi-tshirt_brw.jpeg', alt: 'Palestine Kuffi T-Shirt Brown flat lay', isPrimary: 0, isAlternate: 0, sort: 8 }
    ],
    variants: [
      { id: 'var-kuffi-gry-l', size: 'Grey (1 available)', stock: 1, sku: 'DD-KUF-TEE-GRY-L' },
      { id: 'var-kuffi-blu-l', size: 'Blue (1 available)', stock: 1, sku: 'DD-KUF-TEE-BLU-L' },
      { id: 'var-kuffi-brn-l', size: 'Brown (Available)', stock: 1, sku: 'DD-KUF-TEE-BRN-L' },
      { id: 'var-kuffi-choc-l', size: 'Chocolate Brown (Available)', stock: 1, sku: 'DD-KUF-TEE-CHOC-L' }
    ]
  },
  {
    id: 'prod-palestine-kuffi-shirt-orange',
    slug: 'palestine-kuffi-shirt-orange',
    name: 'Palestine Kuffi Shirt Orange',
    description: 'Statement burnt orange button-down streetwear shirt featuring traditional Palestine Kuffiyeh motif, clean chest pocket, and relaxed tailored resort collar. 1 available.',
    category: 'shirts',
    price_kobo: 2000000, // ₦20,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'Breathable Cotton-Linen Blend',
      fit: 'Relaxed Resort Streetwear Shirt',
      weight: 'Light-Medium Weight',
      care: ['Hand wash or delicate machine wash', 'Hang dry'],
      features: ['Burnt orange statement colorway', 'Intricate Palestine Kuffiyeh contrast pattern', 'Casual camp collar', '1 available only']
    }),
    images: [
      { id: 'img-kuffi-shrt-org-1', url: '/assets/products/palestine-kuffi-shirt-orange_frnt.jpeg', alt: 'Palestine Kuffi Shirt Orange - Front view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-kuffi-shrt-org-2', url: '/assets/products/palestine-kuffi-shirt-orange_bck.jpeg', alt: 'Palestine Kuffi Shirt Orange - Back view', isPrimary: 0, isAlternate: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-kuffi-shrt-org-l', size: 'Orange Resort Cut (1 available)', stock: 1, sku: 'DD-SHRT-KUF-ORG-L' }
    ]
  },
  {
    id: 'prod-foam-truckers-black-green',
    slug: 'deendrip-foam-truckers-black-green',
    name: 'Deendrip Foam Truckers (Black & Green)',
    description: 'Structured 5-panel foam trucker hat featuring custom leopard-patterned breathable mesh back, 3D puff embroidered Deendrip Arabic-street calligraphy on the foam front, and adjustable snapback closure.',
    category: 'caps',
    price_kobo: 800000, // ₦8,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'High-density Foam crown with Leopard Pattern Mesh',
      fit: '5-Panel High Crown Structured Trucker',
      weight: 'Foam Mesh',
      features: ['3D puff Deendrip front embroidery', 'Leopard mesh rear panels', 'Braid cord brim accent', 'Adjustable snapback strap']
    }),
    images: [
      { id: 'img-trk-leo-1', url: '/assets/products/deendrip-foam-trucker-leopard.jpg', alt: 'Deendrip Foam Truckers Black & Green - Side profile view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-trk-leo-2', url: '/assets/products/deendrip-foam-truckers_side.png', alt: 'Deendrip Foam Trucker high-res side angle', isPrimary: 0, isAlternate: 1, sort: 1 },
      { id: 'img-trk-leo-3', url: '/assets/products/deendrip-foam-tuckers.png', alt: 'Deendrip Foam Trucker high-res front graphic', isPrimary: 0, isAlternate: 0, sort: 2 },
      { id: 'img-trk-leo-4', url: '/assets/products/deendrip-cap-black-rack.png', alt: 'Deendrip Trucker Caps collection rack view', isPrimary: 0, isAlternate: 0, sort: 3 }
    ],
    variants: [
      { id: 'var-trk-leo-os', size: 'ONE SIZE', stock: 15, sku: 'DD-TRK-LEO-OS' }
    ]
  },
  {
    id: 'prod-baseball-jersey-green',
    slug: 'baseball-jersey-green',
    name: 'Baseball Jersey Green',
    description: 'Vintage collegiate cut Baseball Jersey in Forest Green with ribbed gold and white contrast sleeve banding, split raglan seams, No Deen No Drip chest script, and breathable performance double-knit mesh.',
    category: 'tees',
    price_kobo: 2000000, // ₦20,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'Breathable Performance Double-Knit Mesh',
      fit: 'Oversized boxy baseball silhouette',
      weight: 'Technical Mesh',
      care: ['Machine wash cold gentle', 'Hang dry', 'Do not iron on trims'],
      features: ['Ribbed striped collar and sleeve bands', 'Raglan yoke cut', 'No Deen No Drip front typography', 'Drop shoulder street profile']
    }),
    images: [
      { id: 'img-jersey-front', url: '/assets/products/baseball-jersey-green.jpeg', alt: 'Baseball Jersey Green - Front view with No Deen No Drip print', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-jersey-back', url: '/assets/products/baseball-jersey-green_bck.jpeg', alt: 'Baseball Jersey Green - Back view', isPrimary: 0, isAlternate: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-jersey-m', size: 'M', stock: 15, sku: 'DD-BSB-GRN-M' },
      { id: 'var-jersey-l', size: 'L', stock: 20, sku: 'DD-BSB-GRN-L' },
      { id: 'var-jersey-xl', size: 'XL', stock: 10, sku: 'DD-BSB-GRN-XL' }
    ]
  },
  {
    id: 'prod-cargo-pants-multicolor',
    slug: 'multi-colored-jean-cargo-pants',
    name: 'Multi Colored Jean Cargo Pants',
    description: 'Deendrip Multi-colored patterned denim cargo pants featuring 6 tactical pockets, contrast white drawstring waistband, relaxed wide-leg street drape, and signature Deendrip script embroidery on the left thigh.',
    category: 'trousers',
    price_kobo: 2200000, // ₦22,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: 'Heavyweight Patterned Denim Twill',
      fit: 'Relaxed wide-leg cargo silhouette',
      weight: 'Heavy Denim',
      care: ['Machine wash cold inside out', 'Do not bleach', 'Hang dry'],
      features: ['6-pocket cargo utility layout', 'Contrast white drawstring elastic waist', 'Embroidered signature Deendrip script', 'Reinforced knee panels']
    }),
    images: [
      { id: 'img-cargo-1', url: '/assets/products/jean-cargo-pants.jpeg', alt: 'Multi Colored Jean Cargo Pants - Front view', isPrimary: 1, isAlternate: 0, sort: 0 },
      { id: 'img-cargo-2', url: '/assets/products/jean-cargo-pants_bck.jpeg', alt: 'Multi Colored Jean Cargo Pants - Back view', isPrimary: 0, isAlternate: 1, sort: 1 }
    ],
    variants: [
      { id: 'var-cargo-m', size: 'M (30-32)', stock: 10, sku: 'DD-CARGO-MC-M' },
      { id: 'var-cargo-l', size: 'L (32-34)', stock: 15, sku: 'DD-CARGO-MC-L' },
      { id: 'var-cargo-xl', size: 'XL (34-36)', stock: 5, sku: 'DD-CARGO-MC-XL' }
    ]
  },
  {
    id: 'prod-hoodie-jalab-brown',
    slug: 'hoodie-jalab-brown',
    name: 'Hoodie Jalab Brown',
    description: 'Pre-orders only: Modern streetwear hooded jalabiya in deep earthy brown heavyweight cotton with kangaroo pouch pocket, tonal Deen Drip chest embroidery, and side movement vents.',
    category: 'hoodies-polos',
    price_kobo: 4000000, // ₦40,000
    is_published: 1,
    is_featured: 1,
    is_new_drop: 1,
    details_json: JSON.stringify({
      material: '450 GSM Heavyweight Brushed Cotton Fleece',
      fit: 'Full-Length Streetwear Hooded Jalabiya with Side Slits',
      weight: 'Ultra-Heavyweight Luxury Fleece',
      care: ['Machine wash cold gentle', 'Hang dry only', 'Do not tumble dry'],
      features: ['Integrated double-lined streetwear hood', 'Spacious kangaroo pouch pocket', 'Deep side vents for comfort and movement', 'Pre-orders only allocation']
    }),
    images: [
      { id: 'img-jalab-brn-1', url: '/assets/products/hoodie-jalab-brown.jpg', alt: 'Hoodie Jalab Brown - Editorial studio full view', isPrimary: 1, isAlternate: 0, sort: 0 }
    ],
    variants: [
      { id: 'var-jalab-m', size: 'M (Pre-Order)', stock: 10, sku: 'DD-JALAB-BRN-M' },
      { id: 'var-jalab-l', size: 'L (Pre-Order)', stock: 10, sku: 'DD-JALAB-BRN-L' },
      { id: 'var-jalab-xl', size: 'XL (Pre-Order)', stock: 10, sku: 'DD-JALAB-BRN-XL' }
    ]
  }
];

db.exec('BEGIN TRANSACTION');
try {
  db.exec('DELETE FROM order_items');
  db.exec('DELETE FROM product_variants');
  db.exec('DELETE FROM product_images');
  db.exec('DELETE FROM products');

  const insertProd = db.prepare(`
    INSERT INTO products (id, slug, name, description, category, price_kobo, is_published, is_featured, is_new_drop, details_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImg = db.prepare(`
    INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, is_alternate, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVar = db.prepare(`
    INSERT INTO product_variants (id, product_id, size, stock_quantity, sku, price_override_kobo)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  for (const p of products) {
    insertProd.run(p.id, p.slug, p.name, p.description, p.category, p.price_kobo, p.is_published, p.is_featured, p.is_new_drop, p.details_json, now);
    for (const img of p.images) {
      insertImg.run(img.id, p.id, img.url, img.alt, img.isPrimary, img.isAlternate, img.sort);
    }
    for (const v of p.variants) {
      insertVar.run(v.id, p.id, v.size, v.stock, v.sku, v.priceOverrideKobo || null);
    }
  }

  db.exec('COMMIT');
  console.log(`Successfully migrated ${products.length} authentic Deen Drip products with complete images and clean titles!`);
} catch (e) {
  db.exec('ROLLBACK');
  console.error('Migration failed:', e);
  process.exit(1);
}
