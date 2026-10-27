import type { Category } from './types';

export interface SeedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  priceKobo: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNewDrop: boolean;
  details: {
    material: string;
    fit: string;
    weight: string;
    care?: string[];
    features: string[];
  };
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string;
    isPrimary: boolean;
    isAlternate: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id: string;
    size: string;
    color?: string;
    stockQuantity: number;
    sku: string;
  }>;
}

export const initialProducts: SeedProduct[] = [
  {
    "id": "prod-deendrip-vt-shirt-black",
    "slug": "deendrip-vt-shirt-black",
    "name": "Deendrip vt-shirt black",
    "description": "Deendrip signature V-neck notch cut tee in washed black featuring clean embroidered typography and structured streetwear drape.",
    "category": "tees",
    "priceKobo": 2000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "100% Premium Heavyweight Cotton",
      "fit": "Large boxy street fit with notch collar",
      "weight": "Heavyweight",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Custom V-notch collar",
        "Embroidered signature Deendrip script",
        "Structured shoulder drape"
      ]
    },
    "images": [
      {
        "id": "img-dd-v-blk-1",
        "imageUrl": "/assets/products/deendrip-vt-shirt-black.jpeg",
        "altText": "Deendrip vt-shirt black - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-dd-v-blk-2",
        "imageUrl": "/assets/products/deendri-vt-shirt-black-bck.jpeg",
        "altText": "Deendrip vt-shirt black - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-dd-v-blk-l",
        "size": "Large",
        "color": "Washed Black",
        "stockQuantity": 15,
        "sku": "DD-VTSHIRT-BLK-L"
      }
    ]
  },
  {
    "id": "prod-deendrip-tshirt-grey",
    "slug": "deendrip-tshirt-grey",
    "name": "Deendrip Tshirt Grey",
    "description": "Premium quality Deendrip tee with custom notch neckline and contrast white underlayer accents. Features clean white embroidered Deendrip signature script on the chest and structured street drape.",
    "category": "tees",
    "priceKobo": 2000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "100% Premium Heavyweight Cotton",
      "fit": "Large boxy street fit with contrast layered hem",
      "weight": "Premium Quality",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Custom notch V-collar with white insert",
        "Contrast white double-layer bottom hem",
        "Embroidered Deendrip script",
        "Split hem detailing"
      ]
    },
    "images": [
      {
        "id": "img-dd-t-gry-1",
        "imageUrl": "/assets/products/deendrip-tshirt-grey.jpg",
        "altText": "Deendrip Tshirt Grey - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-dd-t-gry-2",
        "imageUrl": "/assets/products/deendrip-tshirt-grey-bck.jpg",
        "altText": "Deendrip Tshirt Grey - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-dd-t-gry-l",
        "size": "Large",
        "color": "Heather Grey",
        "stockQuantity": 15,
        "sku": "DD-TSHIRT-GRY-L"
      }
    ]
  },
  {
    "id": "prod-sahari-line-hoodie-jalab-black",
    "slug": "sahari-line-hoodie-jalab-black",
    "name": "Sahari Line Hoodie Jalab - Black",
    "description": "The pinnacle of modest streetwear luxury in deep obsidian black. The Sahari Line Hoodie Jalab seamlessly merges an elongated traditional Jalabiya flowing silhouette with ultra-heavyweight 450 GSM street hoodie construction. Crafted with custom split side-hems, a deep structured double-lined hood, and subtle Deendrip embroidered insignia.",
    "category": "hoodies-polos",
    "priceKobo": 4000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "450 GSM Heavyweight Combed Cotton & Fleece Blend",
      "fit": "Elongated streetwear Jalabiya drape with dropped shoulders",
      "weight": "450 GSM Ultra-Heavyweight",
      "care": [
        "Machine wash cold gentle cycle",
        "Hang dry in shade",
        "Do not tumble dry",
        "Warm iron on reverse"
      ],
      "features": [
        "Flowing Jalabiya elongated silhouette",
        "Deep architectural double-layered hood",
        "Reinforced split side-hem vents for fluid movement",
        "Concealed kangaroo dual side pockets",
        "High-density tonal embroidered chest crest"
      ]
    },
    "images": [
      {
        "id": "img-sh-hd-blk-1",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-black.jpeg",
        "altText": "Sahari Line Hoodie Jalab Black - Garment Flat Lay",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-sh-hd-blk-2",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-black-model.jpg",
        "altText": "Sahari Line Hoodie Jalab Black - On Model Editorial View",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-sh-hd-blk-m",
        "size": "M",
        "color": "Midnight Black",
        "stockQuantity": 10,
        "sku": "DD-SAHARI-BLK-M"
      },
      {
        "id": "var-sh-hd-blk-l",
        "size": "L",
        "color": "Midnight Black",
        "stockQuantity": 15,
        "sku": "DD-SAHARI-BLK-L"
      },
      {
        "id": "var-sh-hd-blk-xl",
        "size": "XL",
        "color": "Midnight Black",
        "stockQuantity": 10,
        "sku": "DD-SAHARI-BLK-XL"
      }
    ]
  },
  {
    "id": "prod-sahari-line-hoodie-jalab-light-blue",
    "slug": "sahari-line-hoodie-jalab-light-blue",
    "name": "Sahari Line Hoodie Jalab - Light Blue",
    "description": "Contemporary sky palette meets traditional fluid silhouette. The Sahari Line Hoodie Jalab in Light Blue features a relaxed boxy cut with elongated Jalabiya split-hem vents, double-layered hood, and soft contrast drape engineered for standout daily wear.",
    "category": "hoodies-polos",
    "priceKobo": 4000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "450 GSM Heavyweight Combed Cotton & Fleece Blend",
      "fit": "Elongated streetwear Jalabiya drape with dropped shoulders",
      "weight": "450 GSM Ultra-Heavyweight",
      "care": [
        "Machine wash cold gentle cycle",
        "Hang dry in shade",
        "Do not tumble dry",
        "Warm iron on reverse"
      ],
      "features": [
        "Flowing Jalabiya elongated silhouette",
        "Deep architectural double-layered hood",
        "Reinforced split side-hem vents for fluid movement",
        "Concealed kangaroo dual side pockets",
        "High-density tonal embroidered chest crest"
      ]
    },
    "images": [
      {
        "id": "img-sh-hd-lbl-1",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-light-blue.jpeg",
        "altText": "Sahari Line Hoodie Jalab Light Blue - Garment Flat Lay",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-sh-hd-lbl-2",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-light-blue-model.jpg",
        "altText": "Sahari Line Hoodie Jalab Light Blue - On Model Editorial View",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-sh-hd-lbl-m",
        "size": "M",
        "color": "Light Blue",
        "stockQuantity": 8,
        "sku": "DD-SAHARI-LBL-M"
      },
      {
        "id": "var-sh-hd-lbl-l",
        "size": "L",
        "color": "Light Blue",
        "stockQuantity": 12,
        "sku": "DD-SAHARI-LBL-L"
      },
      {
        "id": "var-sh-hd-lbl-xl",
        "size": "XL",
        "color": "Light Blue",
        "stockQuantity": 8,
        "sku": "DD-SAHARI-LBL-XL"
      }
    ]
  },
  {
    "id": "prod-sahari-line-hoodie-jalab-olive-green",
    "slug": "sahari-line-hoodie-jalab-olive-green",
    "name": "Sahari Line Hoodie Jalab - Olive Green",
    "description": "Earthy tactical tone tailored into an architectural Jalabiya street cut. Features heavyweight 450 GSM combed cotton fleece, reinforced side seam openings for fluid movement, and deep kangaroo pocket accents in rich muted olive.",
    "category": "hoodies-polos",
    "priceKobo": 4000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "450 GSM Heavyweight Combed Cotton & Fleece Blend",
      "fit": "Elongated streetwear Jalabiya drape with dropped shoulders",
      "weight": "450 GSM Ultra-Heavyweight",
      "care": [
        "Machine wash cold gentle cycle",
        "Hang dry in shade",
        "Do not tumble dry",
        "Warm iron on reverse"
      ],
      "features": [
        "Flowing Jalabiya elongated silhouette",
        "Deep architectural double-layered hood",
        "Reinforced split side-hem vents for fluid movement",
        "Concealed kangaroo dual side pockets",
        "High-density tonal embroidered chest crest"
      ]
    },
    "images": [
      {
        "id": "img-sh-hd-olv-1",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-olive-green.jpeg",
        "altText": "Sahari Line Hoodie Jalab Olive Green - Garment Flat Lay",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-sh-hd-olv-2",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-olive-green-model.jpg",
        "altText": "Sahari Line Hoodie Jalab Olive Green - On Model Editorial View",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-sh-hd-olv-m",
        "size": "M",
        "color": "Olive Green",
        "stockQuantity": 8,
        "sku": "DD-SAHARI-OLV-M"
      },
      {
        "id": "var-sh-hd-olv-l",
        "size": "L",
        "color": "Olive Green",
        "stockQuantity": 12,
        "sku": "DD-SAHARI-OLV-L"
      },
      {
        "id": "var-sh-hd-olv-xl",
        "size": "XL",
        "color": "Olive Green",
        "stockQuantity": 8,
        "sku": "DD-SAHARI-OLV-XL"
      }
    ]
  },
  {
    "id": "prod-sahari-line-hoodie-jalab-off-white",
    "slug": "sahari-line-hoodie-jalab-off-white",
    "name": "Sahari Line Hoodie Jalab - Off-White",
    "description": "Minimalist ivory refinement. Clean, pristine off-white fleece cut in the signature Sahari Jalabiya silhouette with dropped shoulders, heavyweight ribbing, and subtle tone-on-tone embroidery across the chest.",
    "category": "hoodies-polos",
    "priceKobo": 4000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "450 GSM Heavyweight Combed Cotton & Fleece Blend",
      "fit": "Elongated streetwear Jalabiya drape with dropped shoulders",
      "weight": "450 GSM Ultra-Heavyweight",
      "care": [
        "Machine wash cold gentle cycle",
        "Hang dry in shade",
        "Do not tumble dry",
        "Warm iron on reverse"
      ],
      "features": [
        "Flowing Jalabiya elongated silhouette",
        "Deep architectural double-layered hood",
        "Reinforced split side-hem vents for fluid movement",
        "Concealed kangaroo dual side pockets",
        "High-density tonal embroidered chest crest"
      ]
    },
    "images": [
      {
        "id": "img-sh-hd-wht-1",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-off-white.jpeg",
        "altText": "Sahari Line Hoodie Jalab Off-White - Garment Flat Lay",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-sh-hd-wht-2",
        "imageUrl": "/assets/products/sahari-line-hoodie-jalab-off-white-model.jpg",
        "altText": "Sahari Line Hoodie Jalab Off-White - On Model Editorial View",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-sh-hd-wht-m",
        "size": "M",
        "color": "Off-White",
        "stockQuantity": 8,
        "sku": "DD-SAHARI-WHT-M"
      },
      {
        "id": "var-sh-hd-wht-l",
        "size": "L",
        "color": "Off-White",
        "stockQuantity": 12,
        "sku": "DD-SAHARI-WHT-L"
      },
      {
        "id": "var-sh-hd-wht-xl",
        "size": "XL",
        "color": "Off-White",
        "stockQuantity": 8,
        "sku": "DD-SAHARI-WHT-XL"
      }
    ]
  },
  {
    "id": "prod-hoodie-essential",
    "slug": "hoodie-essential",
    "name": "Essential Streetwear Hoodie",
    "description": "The everyday luxury streetwear staple. Cut from 380 GSM brushed fleece cotton with a relaxed drop-shoulder profile, tonal drawstring hood, deep kangaroo pouch, and durable ribbed cuffs and hem. Engineered for ultimate comfort and clean layering.",
    "category": "hoodies-polos",
    "priceKobo": 1600000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "100% Combed Heavy Cotton Brushed Fleece",
      "fit": "Relaxed street boxy silhouette with drop shoulders",
      "weight": "380 GSM Heavy Fleece",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only",
        "Iron on low heat"
      ],
      "features": [
        "Brushed fleece interior for soft warmth",
        "Custom drop shoulder streetwear pattern",
        "Spacious kangaroo front pocket",
        "Heavyweight 2x2 ribbed cuffs and waistband",
        "Full front, back, and model lookbook views"
      ]
    },
    "images": [
      {
        "id": "img-hd-ess-1",
        "imageUrl": "/assets/products/hoodie-essential-front.jpeg",
        "altText": "Essential Streetwear Hoodie - Front View",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-hd-ess-2",
        "imageUrl": "/assets/products/hoodie-essential-bck.jpeg",
        "altText": "Essential Streetwear Hoodie - Back View",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-hd-ess-3",
        "imageUrl": "/assets/products/hoodie-essential-model.jpeg",
        "altText": "Essential Streetwear Hoodie - On Model Editorial View",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-hd-ess-m",
        "size": "M",
        "color": "Black",
        "stockQuantity": 15,
        "sku": "DD-HOOD-ESS-M"
      },
      {
        "id": "var-hd-ess-l",
        "size": "L",
        "color": "Black",
        "stockQuantity": 20,
        "sku": "DD-HOOD-ESS-L"
      },
      {
        "id": "var-hd-ess-xl",
        "size": "XL",
        "color": "Black",
        "stockQuantity": 15,
        "sku": "DD-HOOD-ESS-XL"
      }
    ]
  },
  {
    "id": "prod-hoodie-jalab-brown",
    "slug": "hoodie-jalab-brown",
    "name": "Hoodie jalab brown",
    "description": "Pre orders only. Groundbreaking fusion of the traditional Jalabiya silhouette with heavyweight street hoodie tailoring. Custom dropped shoulders, deep hood, and flowing split-hem lines in rich earth brown.",
    "category": "hoodies-polos",
    "priceKobo": 4000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "400 GSM Combed Fleece & Technical Cotton Blend",
      "fit": "Full length relaxed Jalabiya hoodie cut",
      "weight": "400 GSM",
      "care": [
        "Machine wash cold gentle",
        "Hang dry only"
      ],
      "features": [
        "Deep street hood",
        "Jalabiya length profile",
        "Dual side seam pockets",
        "Pre-orders only allocation"
      ]
    },
    "images": [
      {
        "id": "img-hd-jlb-1",
        "imageUrl": "/assets/products/hoodie-jalab-brown.jpeg",
        "altText": "Hoodie jalab brown - Flat lay view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-hd-jlb-2",
        "imageUrl": "/assets/products/hoodie-jalab-brown-model.jpeg",
        "altText": "Hoodie jalab brown - Model on street",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-hd-jlb-3",
        "imageUrl": "/assets/products/hoodie-jalab-brown-model2.jpeg",
        "altText": "Hoodie jalab brown - Model hood up view",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-hd-jlb-pre",
        "size": "Pre-Order (M - XL)",
        "color": "Earth Brown",
        "stockQuantity": 50,
        "sku": "DD-JALAB-BRN-PRE"
      }
    ]
  },
  {
    "id": "prod-palestine-kuffi-shirt-orange",
    "slug": "palestine-kuffi-shirt-orange",
    "name": "Palestine kuffi shirt orange",
    "description": "Statement street shirt in vibrant sunset orange featuring authentic woven Keffiyeh geometric patterns and structured boxy drape. Strictly 1 piece available.",
    "category": "shirts",
    "priceKobo": 2000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Woven Jacquard Cotton Twill",
      "fit": "Relaxed boxy resort streetwear cut",
      "weight": "Woven Cotton",
      "care": [
        "Machine wash cold gentle",
        "Hang dry only"
      ],
      "features": [
        "Full button front",
        "Authentic Palestinian Keffiyeh pattern",
        "Revere Cuban collar",
        "Limited 1-piece drop"
      ]
    },
    "images": [
      {
        "id": "img-pal-sh-org-1",
        "imageUrl": "/assets/products/palestine-kuffi-shirt-orange-frnt.jpeg",
        "altText": "Palestine kuffi shirt orange - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-pal-sh-org-2",
        "imageUrl": "/assets/products/palestine-kuffi-shirt-orange-bck.jpeg",
        "altText": "Palestine kuffi shirt orange - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-pal-sh-org-l",
        "size": "L",
        "color": "Sunset Orange",
        "stockQuantity": 1,
        "sku": "DD-KUF-SH-ORG-L"
      }
    ]
  },
  {
    "id": "prod-baseball-jersey-green",
    "slug": "baseball-jersey-green",
    "name": "Baseball jersey green",
    "description": "Vintage collegiate cut Baseball Jersey in Forest Green with ribbed gold and white contrast sleeve banding, split raglan seams, and breathable performance double-knit mesh. Strictly 1 piece available.",
    "category": "tees",
    "priceKobo": 2000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Breathable Performance Double-Knit Mesh",
      "fit": "Oversized boxy baseball silhouette",
      "weight": "Technical Mesh",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Ribbed striped collar and sleeve bands",
        "Raglan yoke cut",
        "Drop shoulder street profile",
        "Strictly 1 piece available"
      ]
    },
    "images": [
      {
        "id": "img-bsb-grn-1",
        "imageUrl": "/assets/products/baseball-jersey-green.jpeg",
        "altText": "Baseball jersey green - Front view with No Deen No Drip print",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-bsb-grn-2",
        "imageUrl": "/assets/products/baseball-jersey-green-bck.jpeg",
        "altText": "Baseball jersey green - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-bsb-grn-1pc",
        "size": "1 PC (L)",
        "color": "Forest Green",
        "stockQuantity": 1,
        "sku": "DD-BSB-GRN-1PC"
      }
    ]
  },
  {
    "id": "prod-palestine-kuffi-tshirt-brown",
    "slug": "palestine-kuffi-tshirt-brown",
    "name": "Palestine kuffi Tshirt brown",
    "description": "Heavyweight cotton tee in deep chocolate brown featuring heritage Keffiyeh border motifs and signature Deendrip typography. Only 2 pieces available.",
    "category": "tees",
    "priceKobo": 2000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "100% Combed Cotton Heavyweight",
      "fit": "Boxy streetwear silhouette",
      "weight": "240 GSM",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Authentic Keffiyeh border details",
        "Signature chest lettering",
        "Contrast collar ribbing",
        "Strictly 2 pieces available"
      ]
    },
    "images": [
      {
        "id": "img-pal-t-brn-1",
        "imageUrl": "/assets/products/palestine-kuffi-tshirt-frn-brn.jpeg",
        "altText": "Palestine kuffi Tshirt brown - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-pal-t-brn-2",
        "imageUrl": "/assets/products/palestine-kuffi-tshirt-bck-brn.jpeg",
        "altText": "Palestine kuffi Tshirt brown - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-pal-t-brn-l",
        "size": "L",
        "color": "Chocolate Brown",
        "stockQuantity": 2,
        "sku": "DD-KUF-TEE-BRN"
      }
    ]
  },
  {
    "id": "prod-palestine-long-sleeve",
    "slug": "palestine-long-sleeve",
    "name": "Palestine long sleeve",
    "description": "Long-sleeve heavyweight streetwear tee with Palestine commemorative typography and ornate Keffiyeh geometric sleeve prints in vibrant multi-color.",
    "category": "tees",
    "priceKobo": 2200000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "100% Heavyweight Ringspun Cotton",
      "fit": "Relaxed drop-shoulder long-sleeve cut",
      "weight": "260 GSM",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Keffiyeh pattern sleeve print",
        "Ribbed wrist cuffs",
        "Commemorative chest print"
      ]
    },
    "images": [
      {
        "id": "img-pal-ls-1",
        "imageUrl": "/assets/products/palestine-long-sleeve-front.jpeg",
        "altText": "Palestine long sleeve - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-pal-ls-2",
        "imageUrl": "/assets/products/palestine-long-sleeve-bck.jpeg",
        "altText": "Palestine long sleeve - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-pal-ls-l",
        "size": "L",
        "color": "Multi-Color",
        "stockQuantity": 8,
        "sku": "DD-PAL-LS-L"
      }
    ]
  },
  {
    "id": "prod-multi-colored-foam-truckers-style-2",
    "slug": "multi-colored-foam-truckers-style-2",
    "name": "Multi colored foam truckers - Style 2",
    "description": "Limited edition high-crown foam trucker hat in vibrant multi-color split panels with breathable mesh back and signature Deendrip typography patch.",
    "category": "caps",
    "priceKobo": 800000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Polyester Foam Crown & Breathable Mesh",
      "fit": "Structured high crown with adjustable snapback",
      "weight": "Lightweight",
      "care": [
        "Spot clean only"
      ],
      "features": [
        "Padded sweatband",
        "Custom puff print patch",
        "Adjustable snapback closure"
      ]
    },
    "images": [
      {
        "id": "img-mc-trk2-1",
        "imageUrl": "/assets/products/multi-colored-foam-truckers2.jpg",
        "altText": "Multi colored foam truckers Style 2 - Flat cap",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-mc-trk2-2",
        "imageUrl": "/assets/products/multi-colored-foam-truckers2-model-male.jpeg",
        "altText": "Multi colored foam truckers Style 2 - Male model",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-mc-trk2-3",
        "imageUrl": "/assets/products/multi-colored-foam-truckers2-model-fem.jpeg",
        "altText": "Multi colored foam truckers Style 2 - Female model",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-mc-trk2-os",
        "size": "One Size Fits All",
        "color": "Multi Style 2",
        "stockQuantity": 25,
        "sku": "DD-TRK-MC2-OS"
      }
    ]
  },
  {
    "id": "prod-multi-colored-foam-truckers-style-1",
    "slug": "multi-colored-foam-truckers-style-1",
    "name": "Multi colored foam truckers - Style 1",
    "description": "Heritage street high-crown foam trucker cap in bold contrast blocked colorways with breathable rear mesh and custom Deendrip insignia embroidery.",
    "category": "caps",
    "priceKobo": 800000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Foam front panel with high-grade nylon mesh back",
      "fit": "Classic trucker profile with curved brim",
      "weight": "Lightweight",
      "care": [
        "Spot clean only"
      ],
      "features": [
        "Snapback closure",
        "Puff embroidered script",
        "Breathable air mesh"
      ]
    },
    "images": [
      {
        "id": "img-mc-trk1-1",
        "imageUrl": "/assets/products/multi-colored-foam-truckers.jpg",
        "altText": "Multi colored foam truckers Style 1 - Flat cap",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-mc-trk1-2",
        "imageUrl": "/assets/products/multi-colored-foam-truckers-model-male.jpeg",
        "altText": "Multi colored foam truckers Style 1 - Male model",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-mc-trk1-3",
        "imageUrl": "/assets/products/multi-colored-foam-truckers-model-fem.jpeg",
        "altText": "Multi colored foam truckers Style 1 - Female model",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-mc-trk1-os",
        "size": "One Size Fits All",
        "color": "Multi Style 1",
        "stockQuantity": 25,
        "sku": "DD-TRK-MC1-OS"
      }
    ]
  },
  {
    "id": "prod-foam-truckers",
    "slug": "foam-truckers",
    "name": "Foam truckers",
    "description": "Essential monochrome foam trucker with black mesh and stark white puff script embroidery. Clean, versatile, and built for daily wear.",
    "category": "caps",
    "priceKobo": 500000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Padded Foam Panel with Ventilated Mesh Back",
      "fit": "Structured high crown with curved bill",
      "weight": "Lightweight",
      "care": [
        "Spot clean only"
      ],
      "features": [
        "Monochrome colorway",
        "Snapback adjustable sizing",
        "Contrast embroidered logo"
      ]
    },
    "images": [
      {
        "id": "img-fm-trk-1",
        "imageUrl": "/assets/products/foam-truckers.jpeg",
        "altText": "Foam truckers - Cap view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-fm-trk-2",
        "imageUrl": "/assets/products/foam-truckers-male-model.jpeg",
        "altText": "Foam truckers - Male model view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-fm-trk-3",
        "imageUrl": "/assets/products/foam-truckers-fem-model.png",
        "altText": "Foam truckers - Female model view",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-fm-trk-os",
        "size": "One Size Fits All",
        "color": "Black/White",
        "stockQuantity": 30,
        "sku": "DD-TRK-FOAM-OS"
      }
    ]
  },
  {
    "id": "prod-palestine-knight-foam-trucker",
    "slug": "palestine-knight-snapback",
    "name": "Palestine Knight Foam Trucker",
    "description": "Collector-grade snapback cap featuring embroidered Palestinian equestrian iconography and high-density script stitching across a structured crown.",
    "category": "caps",
    "priceKobo": 500000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Heavyweight Cotton Twill / Foam Blend",
      "fit": "Structured 5-panel crown with flat bill",
      "weight": "Midweight",
      "care": [
        "Spot clean only"
      ],
      "features": [
        "Embroidered knight crest",
        "Green underbrim contrast",
        "Adjustable snapback strap"
      ]
    },
    "images": [
      {
        "id": "img-pal-knt-1",
        "imageUrl": "/assets/products/palestine-knight-snapback.jpeg",
        "altText": "Palestine Knight Snapback - Cap view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-pal-knt-2",
        "imageUrl": "/assets/products/palestine-knight-snapback-model-male.jpeg",
        "altText": "Palestine Knight Snapback - Male model view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-pal-knt-3",
        "imageUrl": "/assets/products/palestine-knight-snapback-model-fem.jpeg",
        "altText": "Palestine Knight Snapback - Female model view",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-pal-knt-os",
        "size": "One Size Fits All",
        "color": "Knight Edition",
        "stockQuantity": 20,
        "sku": "DD-CAP-KNT-OS"
      }
    ]
  },
  {
    "id": "prod-hard-truckers",
    "slug": "hard-truckers",
    "name": "Hard truckers",
    "description": "Heavy structured hard trucker with reinforced buckram crown, laser-etched metal eyelets, and premium thick chain-stitch embroidery.",
    "category": "caps",
    "priceKobo": 1200000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Heavy Reinforced Canvas & Structured Mesh",
      "fit": "Firm high-profile crown with pre-curved visor",
      "weight": "Heavyweight Structured",
      "care": [
        "Spot clean only"
      ],
      "features": [
        "Firm buckram front panels",
        "High-density chain stitch",
        "Premium matte snap closure"
      ]
    },
    "images": [
      {
        "id": "img-hrd-trk-1",
        "imageUrl": "/assets/products/hard-truckers.jpeg",
        "altText": "Hard truckers - Cap view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-hrd-trk-2",
        "imageUrl": "/assets/products/hard-truckers-model-male.png",
        "altText": "Hard truckers - Male model view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-hrd-trk-3",
        "imageUrl": "/assets/products/hard-truckers-model-fem.png",
        "altText": "Hard truckers - Female model view",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-hrd-trk-os",
        "size": "One Size Fits All",
        "color": "Charcoal Hard",
        "stockQuantity": 20,
        "sku": "DD-TRK-HARD-OS"
      }
    ]
  },
  {
    "id": "prod-honeycomb-baseball-cap",
    "slug": "honeycomb-baseball-cap",
    "name": "Honeycomb baseball cap",
    "description": "Architectural streetwear dad cap constructed with textured geometric honeycomb breathable fabric and subtle tonal 3D rubberized logo.",
    "category": "caps",
    "priceKobo": 1200000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "Micro-Honeycomb Textured Technical Poly",
      "fit": "Unstructured low-profile dad cap fit",
      "weight": "Lightweight Breathable",
      "care": [
        "Spot clean only"
      ],
      "features": [
        "Textured honeycomb weave",
        "Tonal matte metal clasp strap",
        "Moisture-wicking inner band"
      ]
    },
    "images": [
      {
        "id": "img-hcb-cap-1",
        "imageUrl": "/assets/products/honeycomb-baseball-cap.jpeg",
        "altText": "Honeycomb baseball cap - Cap view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-hcb-cap-2",
        "imageUrl": "/assets/products/honeycomb-baseball-cap-models.jpg",
        "altText": "Honeycomb baseball cap - Models editorial view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-hcb-cap-os",
        "size": "One Size Fits All",
        "color": "Honeycomb Black",
        "stockQuantity": 15,
        "sku": "DD-CAP-HCB-OS"
      }
    ]
  },
  {
    "id": "prod-multi-colored-jean-cargo-pants-style-1",
    "slug": "multi-colored-jean-cargo-pants-style-1",
    "name": "Multi colored Jean cargo pants - Style 1",
    "description": "Wide-leg artisanal denim cargo trousers featuring asymmetric contrast paneling, oversized utility accordion pockets, and adjustable ankle cinch toggles.",
    "category": "trousers",
    "priceKobo": 2200000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "13.5oz Rigid Cotton Denim & Cotton Twill",
      "fit": "Relaxed wide-leg cargo silhouette",
      "weight": "13.5oz Denim",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Multi-panel contrast denim blocking",
        "6 utility cargo pockets",
        "Reinforced knee darting",
        "Adjustable hem drawcords"
      ]
    },
    "images": [
      {
        "id": "img-mc-jnc-1-1",
        "imageUrl": "/assets/products/multi-colored-jean-cargo-pants.jpeg",
        "altText": "Multi colored Jean cargo pants Style 1 - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-mc-jnc-1-2",
        "imageUrl": "/assets/products/multi-colored-jean-cargo-pants-side.jpeg",
        "altText": "Multi colored Jean cargo pants Style 1 - Side pocket view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-mc-jnc-1-3",
        "imageUrl": "/assets/products/multi-colored-jean-cargo-pants-bck.jpeg",
        "altText": "Multi colored Jean cargo pants Style 1 - Back pocket view",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-mc-jnc1-32",
        "size": "32",
        "color": "Denim Style 1",
        "stockQuantity": 5,
        "sku": "DD-CRG-MC1-32"
      },
      {
        "id": "var-mc-jnc1-34",
        "size": "34",
        "color": "Denim Style 1",
        "stockQuantity": 5,
        "sku": "DD-CRG-MC1-34"
      },
      {
        "id": "var-mc-jnc1-36",
        "size": "36",
        "color": "Denim Style 1",
        "stockQuantity": 4,
        "sku": "DD-CRG-MC1-36"
      }
    ]
  },
  {
    "id": "prod-multi-colored-jean-cargo-pants-style-2",
    "slug": "multi-colored-jean-cargo-pants-style-2",
    "name": "Multi colored Jean cargo pants - Style 2",
    "description": "Alternative colorway wide-leg denim cargo pants with tactical utility cargo pockets, heavy-duty metal rivets, and engineered streetwear taper.",
    "category": "trousers",
    "priceKobo": 2200000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "13.5oz Cotton Denim with Contrast Canvas Panels",
      "fit": "Straight wide-leg cut with articulated knees",
      "weight": "13.5oz Denim",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Asymmetrical pocket styling",
        "Heavyweight YKK zipper fly",
        "Custom branded shank button"
      ]
    },
    "images": [
      {
        "id": "img-mc-jnc-2-1",
        "imageUrl": "/assets/products/multi-colored-jean-cargo-pants2.jpeg",
        "altText": "Multi colored Jean cargo pants Style 2 - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-mc-jnc-2-2",
        "imageUrl": "/assets/products/multi-colored-jean-cargo-pants-side2.jpeg",
        "altText": "Multi colored Jean cargo pants Style 2 - Side detail view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      },
      {
        "id": "img-mc-jnc-2-3",
        "imageUrl": "/assets/products/multi-colored-jean-cargo-pants-bck2.jpeg",
        "altText": "Multi colored Jean cargo pants Style 2 - Back view",
        "isPrimary": false,
        "isAlternate": false,
        "sortOrder": 2
      }
    ],
    "variants": [
      {
        "id": "var-mc-jnc2-32",
        "size": "32",
        "color": "Denim Style 2",
        "stockQuantity": 4,
        "sku": "DD-CRG-MC2-32"
      },
      {
        "id": "var-mc-jnc2-34",
        "size": "34",
        "color": "Denim Style 2",
        "stockQuantity": 5,
        "sku": "DD-CRG-MC2-34"
      },
      {
        "id": "var-mc-jnc2-36",
        "size": "36",
        "color": "Denim Style 2",
        "stockQuantity": 4,
        "sku": "DD-CRG-MC2-36"
      }
    ]
  },
  {
    "id": "prod-palestine-kuffi-tshirt-blue",
    "slug": "palestine-kuffi-tshirt-blue",
    "name": "Palestine kuffi Tshirt blue",
    "description": "Heavyweight street tee in deep ocean blue accented with intricate Keffiyeh border patterns and Deendrip typography. Only 2 pieces available.",
    "category": "tees",
    "priceKobo": 2000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "100% Combed Cotton Heavyweight",
      "fit": "Boxy streetwear silhouette",
      "weight": "240 GSM",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Keffiyeh lattice border accents",
        "Contrast ribbed neckline",
        "Only 2 pieces available"
      ]
    },
    "images": [
      {
        "id": "img-pal-t-blu-1",
        "imageUrl": "/assets/products/palestine-kuffi-tshirt-frn-blu.jpeg",
        "altText": "Palestine kuffi Tshirt blue - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-pal-t-blu-2",
        "imageUrl": "/assets/products/palestine-kuffi-tshirt-bck-blu.jpeg",
        "altText": "Palestine kuffi Tshirt blue - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-pal-t-blu-l",
        "size": "L",
        "color": "Ocean Blue",
        "stockQuantity": 2,
        "sku": "DD-KUF-TEE-BLU"
      }
    ]
  },
  {
    "id": "prod-palestine-kuffi-tshirt-grey",
    "slug": "palestine-kuffi-tshirt-grey",
    "name": "Palestine kuffi Tshirt grey",
    "description": "Heavyweight street tee in cool heather grey accented with heritage Keffiyeh border graphics and signature Deendrip motifs. Only 2 pieces available.",
    "category": "tees",
    "priceKobo": 2000000,
    "isPublished": true,
    "isFeatured": true,
    "isNewDrop": true,
    "details": {
      "material": "100% Combed Cotton Heavyweight",
      "fit": "Boxy streetwear silhouette",
      "weight": "240 GSM",
      "care": [
        "Machine wash cold inside out",
        "Hang dry only"
      ],
      "features": [
        "Keffiyeh lattice border accents",
        "Contrast ribbed neckline",
        "Only 2 pieces available"
      ]
    },
    "images": [
      {
        "id": "img-pal-t-gry-1",
        "imageUrl": "/assets/products/palestine-kuffi-tshirt-frt-grey.jpeg",
        "altText": "Palestine kuffi Tshirt grey - Front view",
        "isPrimary": true,
        "isAlternate": false,
        "sortOrder": 0
      },
      {
        "id": "img-pal-t-gry-2",
        "imageUrl": "/assets/products/palestine-kuffi-tshirt-bck-grey.jpeg",
        "altText": "Palestine kuffi Tshirt grey - Back view",
        "isPrimary": false,
        "isAlternate": true,
        "sortOrder": 1
      }
    ],
    "variants": [
      {
        "id": "var-pal-t-gry-l",
        "size": "L",
        "color": "Heather Grey",
        "stockQuantity": 2,
        "sku": "DD-KUF-TEE-GRY"
      }
    ]
  }
];
