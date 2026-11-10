/**
 * DEEN DRIP SHIPPING & LOGISTICS ENGINE
 * 
 * Supports:
 * 1. Within Lagos Delivery (Zoned by area / any place inserted, with free delivery over ₦85,000)
 * 2. South West & Near Cities (Benin Rate Card: SW States, Ilorin, Warri, Benin City)
 * 3. Abuja, Northern, Eastern & South-South States (Abuja Rate Card: North, East, SS, Asaba)
 * 4. Weight-based progressive tier calculation (0.5kg up to 10kg+)
 */

export type ShippingZoneType = 'lagos' | 'south_west_benin' | 'abuja_north_east_ss';

export interface WeightTier {
  maxKg: number;
  amountNaira: number;
}

// -------------------------------------------------------------
// Zone 1: Abuja, Northern, Eastern & South-South States (Abuja Table)
// -------------------------------------------------------------
export const ABUJA_ZONE_TIERS: WeightTier[] = [
  { maxKg: 0.5, amountNaira: 14500 },
  { maxKg: 1.0, amountNaira: 14500 },
  { maxKg: 1.5, amountNaira: 14500 },
  { maxKg: 2.0, amountNaira: 14500 },
  { maxKg: 2.5, amountNaira: 16500 },
  { maxKg: 3.0, amountNaira: 19000 },
  { maxKg: 3.5, amountNaira: 21000 },
  { maxKg: 4.0, amountNaira: 23000 },
  { maxKg: 4.5, amountNaira: 25000 },
  { maxKg: 5.0, amountNaira: 27000 },
  { maxKg: 5.5, amountNaira: 29000 },
  { maxKg: 6.0, amountNaira: 31000 },
  { maxKg: 6.5, amountNaira: 33000 },
  { maxKg: 7.0, amountNaira: 35500 },
  { maxKg: 7.5, amountNaira: 38000 },
  { maxKg: 8.0, amountNaira: 40000 },
  { maxKg: 8.5, amountNaira: 44000 },
  { maxKg: 9.0, amountNaira: 46000 },
  { maxKg: 9.5, amountNaira: 48000 },
  { maxKg: 10.0, amountNaira: 52000 },
];

// -------------------------------------------------------------
// Zone 2: South West, Ilorin, Warri & Benin (Benin Table)
// -------------------------------------------------------------
export const BENIN_ZONE_TIERS: WeightTier[] = [
  { maxKg: 0.5, amountNaira: 7500 },
  { maxKg: 1.0, amountNaira: 7500 },
  { maxKg: 1.5, amountNaira: 7500 },
  { maxKg: 2.0, amountNaira: 7500 },
  { maxKg: 2.5, amountNaira: 9500 },
  { maxKg: 3.0, amountNaira: 12000 },
  { maxKg: 3.5, amountNaira: 14000 },
  { maxKg: 4.0, amountNaira: 16500 },
  { maxKg: 4.5, amountNaira: 18500 },
  { maxKg: 5.0, amountNaira: 20800 },
  { maxKg: 5.5, amountNaira: 22900 },
  { maxKg: 6.0, amountNaira: 25000 },
  { maxKg: 6.5, amountNaira: 27000 },
  { maxKg: 7.0, amountNaira: 29000 },
  { maxKg: 7.5, amountNaira: 31000 },
  { maxKg: 8.0, amountNaira: 33000 },
  { maxKg: 8.5, amountNaira: 35000 },
  { maxKg: 9.0, amountNaira: 38000 },
  { maxKg: 9.5, amountNaira: 40000 },
  { maxKg: 10.0, amountNaira: 42000 },
];

// -------------------------------------------------------------
// Lagos Intra-City Delivery Tiers (by Area / Any Place Inserted)
// -------------------------------------------------------------
export interface LagosAreaZone {
  name: string;
  keywords: string[];
  amountNaira: number;
  description: string;
}

export const LAGOS_AREA_ZONES: LagosAreaZone[] = [
  {
    name: 'Lagos Island / Lekki Corridor',
    keywords: ['lekki', 'ikoyi', 'victoria island', 'vi', 'oniru', 'marina', 'cms', 'banana island', 'osapa', 'jakande', 'chevron'],
    amountNaira: 3500,
    description: 'Ikoyi, Victoria Island, Lekki Phase 1, Oniru, Chevron',
  },
  {
    name: 'Lagos Mainland Urban',
    keywords: ['ikeja', 'yaba', 'surulere', 'gbagada', 'maryland', 'ilupeju', 'magodo', 'ogudu', 'anthony', 'ojota', 'mushin', 'shomolu', 'bariga', 'ebute metta', 'alapere', 'ketu', 'festac', 'mile 2', 'apapa'],
    amountNaira: 3000,
    description: 'Ikeja, Yaba, Surulere, Gbagada, Maryland, Magodo, Festac',
  },
  {
    name: 'Lekki Suburbs & Ajah Axis',
    keywords: ['ajah', 'sangotedo', 'abraham adesanya', 'awoyaya', 'lakowe', 'bogije', 'eleko', 'vgc', 'ikate', 'ilasan'],
    amountNaira: 4500,
    description: 'Ajah, Sangotedo, Abraham Adesanya, Awoyaya, Lakowe',
  },
  {
    name: 'Lagos Outskirts & Extended Borders',
    keywords: ['ikorodu', 'epe', 'badagry', 'alimosho', 'egbeda', 'ipaja', 'ijegun', 'igando', 'lasu', 'iba', 'sango', 'ojodu berger', 'mowe', 'ibafo'],
    amountNaira: 5500,
    description: 'Ikorodu, Epe, Badagry, Alimosho, Egbeda, Ipaja, Berger',
  },
];

export const LAGOS_DEFAULT_FEE_NAIRA = 3500;
export const LAGOS_FREE_DELIVERY_THRESHOLD_KOBO = 8500000; // ₦85,000

// -------------------------------------------------------------
// State & City Classification Lists
// -------------------------------------------------------------

// Group 2: South West States (Oyo, Ogun, Osun, Ondo, Ekiti) + Special Cities (Ilorin, Warri, Benin)
export const SOUTH_WEST_STATES = ['Oyo', 'Ogun', 'Osun', 'Ondo', 'Ekiti'];
export const BENIN_SPECIAL_CITIES = ['Benin', 'Benin City', 'Warri', 'Ilorin'];

// Group 1: All Northern States
export const NORTHERN_STATES = [
  'Abuja (FCT)',
  'Kano',
  'Kaduna',
  'Katsina',
  'Sokoto',
  'Kebbi',
  'Zamfara',
  'Jigawa',
  'Bauchi',
  'Gombe',
  'Adamawa',
  'Borno',
  'Yobe',
  'Taraba',
  'Niger',
  'Plateau',
  'Nasarawa',
  'Benue',
  'Kogi',
];

// Group 1: All Eastern States (South East)
export const EASTERN_STATES = [
  'Abia',
  'Anambra',
  'Ebonyi',
  'Enugu',
  'Imo',
];

// Group 1: All South-South States (Except Warri & Benin handled separately)
export const SOUTH_SOUTH_STATES = [
  'Rivers',
  'Akwa Ibom',
  'Cross River',
  'Bayelsa',
  'Delta', // Delta contains Asaba (Group 1) and Warri (Group 2)
  'Edo',   // Edo contains Benin (Group 2) and other parts
];

// Complete list of Nigerian States for Checkout Dropdowns
export const ALL_NIGERIAN_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Ogun',
  'Oyo',
  'Osun',
  'Ondo',
  'Ekiti',
  'Edo (Benin / Central)',
  'Delta (Warri / Asaba)',
  'Kwara (Ilorin)',
  'Rivers (Port Harcourt)',
  'Kano',
  'Kaduna',
  'Anambra',
  'Enugu',
  'Abia',
  'Imo',
  'Akwa Ibom',
  'Plateau',
  'Katsina',
  'Niger',
  'Benue',
  'Nasarawa',
  'Kogi',
  'Cross River',
  'Bayelsa',
  'Ebonyi',
  'Bauchi',
  'Gombe',
  'Adamawa',
  'Borno',
  'Sokoto',
  'Kebbi',
  'Zamfara',
  'Jigawa',
  'Yobe',
  'Taraba',
];

// -------------------------------------------------------------
// Product Category Weight Estimates (in KG)
// -------------------------------------------------------------
export function getEstimatedItemWeightKg(category?: string, productName?: string): number {
  const cat = (category || '').toLowerCase();
  const name = (productName || '').toLowerCase();

  if (cat === 'caps' || name.includes('cap') || name.includes('trucker') || name.includes('snapback')) {
    return 0.18;
  }
  if (cat === 'hoodies-polos' || name.includes('hoodie') || name.includes('jalab')) {
    return 0.90;
  }
  if (cat === 'trousers' || name.includes('cargo') || name.includes('pant') || name.includes('jean')) {
    return 0.65;
  }
  if (cat === 'tracksuits' || name.includes('tracksuit') || name.includes('set')) {
    return 1.10;
  }
  if (cat === 'shirts' || name.includes('jacket') || name.includes('jersey')) {
    return 0.50;
  }
  // Standard Graphic Tees / T-Shirts (280 GSM)
  return 0.35;
}

/**
 * Compute total cart weight from items
 */
export function calculateCartTotalWeightKg(items: Array<{ category?: string; name?: string; quantity: number }>): number {
  if (!items || items.length === 0) return 0.5;
  const total = items.reduce((sum, item) => {
    const weight = getEstimatedItemWeightKg(item.category, item.name);
    return sum + (weight * item.quantity);
  }, 0);
  return Math.max(0.5, Math.round(total * 10) / 10);
}

// -------------------------------------------------------------
// Core Zone Resolver
// -------------------------------------------------------------
export function resolveShippingZone(state: string, city: string = ''): ShippingZoneType {
  const stateClean = state.trim().toLowerCase();
  const cityClean = city.trim().toLowerCase();

  // 1. Within Lagos
  if (stateClean.includes('lagos')) {
    return 'lagos';
  }

  // 2. Special city overrides for Benin Rate Card
  // Warri, Benin, Ilorin
  if (
    cityClean.includes('warri') ||
    cityClean.includes('benin') ||
    cityClean.includes('ilorin') ||
    stateClean.includes('benin') ||
    stateClean.includes('warri') ||
    stateClean.includes('ilorin')
  ) {
    return 'south_west_benin';
  }

  // Asaba specifically belongs to Group 1 (Abuja Table)
  if (cityClean.includes('asaba')) {
    return 'abuja_north_east_ss';
  }

  // 3. South West States -> Benin Rate Card
  for (const sw of SOUTH_WEST_STATES) {
    if (stateClean.includes(sw.toLowerCase())) {
      return 'south_west_benin';
    }
  }

  // If Kwara State -> Benin Rate Card (Ilorin is in Kwara)
  if (stateClean.includes('kwara')) {
    return 'south_west_benin';
  }

  // If Edo State and no specific city -> defaults to Benin Rate Card
  if (stateClean.includes('edo')) {
    return 'south_west_benin';
  }

  // If Delta State and no specific city:
  // If city is Warri -> already handled above (Benin card)
  // Otherwise Delta (including Asaba) -> Abuja card
  if (stateClean.includes('delta')) {
    return 'abuja_north_east_ss';
  }

  // 4. All other states (North, East, South-South, Abuja) -> Abuja Table
  return 'abuja_north_east_ss';
}

// -------------------------------------------------------------
// Rate Lookup by Weight
// -------------------------------------------------------------
export function getWeightTierAmountNaira(tiers: WeightTier[], weightKg: number): number {
  const roundedWeight = Math.ceil(weightKg * 2) / 2; // round up to nearest 0.5kg
  const tier = tiers.find(t => t.maxKg >= roundedWeight);

  if (tier) {
    return tier.amountNaira;
  }

  // Over 10kg: base 10kg rate + increment per additional 0.5kg
  const maxTier = tiers[tiers.length - 1];
  const excessKg = roundedWeight - maxTier.maxKg;
  const extraSteps = Math.ceil(excessKg / 0.5);
  const stepRate = tiers === ABUJA_ZONE_TIERS ? 2500 : 1800;
  return maxTier.amountNaira + (extraSteps * stepRate);
}

// -------------------------------------------------------------
// Lagos Area Fee Resolver
// -------------------------------------------------------------
export function resolveLagosDeliveryFeeNaira(locationText: string = ''): { amountNaira: number; matchedZone: string } {
  const text = locationText.toLowerCase();

  for (const zone of LAGOS_AREA_ZONES) {
    for (const kw of zone.keywords) {
      if (text.includes(kw)) {
        return { amountNaira: zone.amountNaira, matchedZone: zone.name };
      }
    }
  }

  // Default Lagos fee if no specific keyword matched ("any place inserted")
  return { amountNaira: LAGOS_DEFAULT_FEE_NAIRA, matchedZone: 'Standard Lagos Urban' };
}

// -------------------------------------------------------------
// Master Shipping Fee Calculation
// -------------------------------------------------------------
export interface ShippingCalculationParams {
  state: string;
  city?: string;
  address?: string;
  subtotalKobo: number;
  totalWeightKg: number;
}

export interface ShippingCalculationResult {
  zone: ShippingZoneType;
  zoneLabel: string;
  deliveryFeeKobo: number;
  deliveryFeeNaira: number;
  isFreeDelivery: boolean;
  weightKg: number;
  weightBracketLabel: string;
  notes: string;
}

export function calculateOrderShipping({
  state,
  city = '',
  address = '',
  subtotalKobo,
  totalWeightKg,
}: ShippingCalculationParams): ShippingCalculationResult {
  const zone = resolveShippingZone(state, city);
  const roundedWeight = Math.max(0.5, Math.ceil(totalWeightKg * 2) / 2);

  if (zone === 'lagos') {
    // Check free delivery threshold
    if (subtotalKobo >= LAGOS_FREE_DELIVERY_THRESHOLD_KOBO) {
      return {
        zone: 'lagos',
        zoneLabel: 'Lagos Fast Track (Free Delivery Promo)',
        deliveryFeeKobo: 0,
        deliveryFeeNaira: 0,
        isFreeDelivery: true,
        weightKg: roundedWeight,
        weightBracketLabel: `${roundedWeight} KG`,
        notes: 'Qualifies for Free Lagos Delivery (Orders over ₦85,000)',
      };
    }

    const { amountNaira, matchedZone } = resolveLagosDeliveryFeeNaira(`${city} ${address}`);
    return {
      zone: 'lagos',
      zoneLabel: `Lagos (${matchedZone})`,
      deliveryFeeKobo: amountNaira * 100,
      deliveryFeeNaira: amountNaira,
      isFreeDelivery: false,
      weightKg: roundedWeight,
      weightBracketLabel: `${roundedWeight} KG`,
      notes: `Lagos intra-city delivery for ${matchedZone}`,
    };
  }

  if (zone === 'south_west_benin') {
    const amountNaira = getWeightTierAmountNaira(BENIN_ZONE_TIERS, roundedWeight);
    return {
      zone: 'south_west_benin',
      zoneLabel: 'South West, Ilorin, Warri & Benin (Direct Interstate Dispatch)',
      deliveryFeeKobo: amountNaira * 100,
      deliveryFeeNaira: amountNaira,
      isFreeDelivery: false,
      weightKg: roundedWeight,
      weightBracketLabel: `${roundedWeight} KG Tier`,
      notes: `Courier Interstate Dispatch (2–4 business days)`,
    };
  }

  // Abuja, North, East, South-South
  const amountNaira = getWeightTierAmountNaira(ABUJA_ZONE_TIERS, roundedWeight);
  return {
    zone: 'abuja_north_east_ss',
    zoneLabel: 'Abuja, Northern, Eastern & South-South States (Interstate Logistics)',
    deliveryFeeKobo: amountNaira * 100,
    deliveryFeeNaira: amountNaira,
    isFreeDelivery: false,
    weightKg: roundedWeight,
    weightBracketLabel: `${roundedWeight} KG Tier`,
    notes: `Courier Priority Interstate Dispatch (3–5 business days)`,
  };
}
