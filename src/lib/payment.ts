import crypto from 'node:crypto';
import { getDb, calculateDeliveryFee } from './db';

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

export interface CalculatedOrder {
  subtotalKobo: number;
  deliveryFeeKobo: number;
  totalKobo: number;
  verifiedItems: Array<{
    productId: string;
    variantId: string;
    productNameSnapshot: string;
    variantNameSnapshot: string;
    unitPriceKoboSnapshot: number;
    quantity: number;
    subtotalKobo: number;
  }>;
}

/**
 * AUTHORITATIVE SERVER-SIDE PRICE AND INVENTORY VALIDATION
 * Prevents any client-side tampering with prices, discounts, or stock counts.
 * Uses DB-backed delivery zone configuration — not hardcoded values.
 */
export function validateAndCalculateOrder(
  items: Array<{ variantId: string; quantity: number }>,
  deliveryState: string,
  deliveryCity: string = '',
  deliveryAddress: string = ''
): CalculatedOrder {
  const db = getDb();

  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  let subtotalKobo = 0;
  const verifiedItems: CalculatedOrder['verifiedItems'] = [];
  const itemsForWeight: Array<{ category?: string; name?: string; quantity: number }> = [];

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error('Invalid item quantity');
    }

    const row = db.prepare(`
      SELECT 
        v.id as variant_id,
        v.product_id,
        v.size,
        v.color,
        v.stock_quantity,
        v.price_override_kobo,
        p.name as product_name,
        p.category,
        p.price_kobo as product_price_kobo,
        p.sale_price_kobo,
        p.is_published
      FROM product_variants v
      JOIN products p ON v.product_id = p.id
      WHERE v.id = ?
    `).get(item.variantId) as {
      variant_id: string;
      product_id: string;
      size: string;
      color: string | null;
      stock_quantity: number;
      price_override_kobo: number | null;
      product_name: string;
      category: string;
      product_price_kobo: number;
      sale_price_kobo: number | null;
      is_published: number;
    } | undefined;

    if (!row) {
      throw new Error(`Item variant ${item.variantId} does not exist`);
    }

    if (row.is_published !== 1) {
      throw new Error(`Product ${row.product_name} is currently unavailable`);
    }

    if (row.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${row.product_name} (Size: ${row.size}). Available: ${row.stock_quantity}`);
    }

    // Price resolution: variant override > sale price > base price
    const unitPriceKobo = row.price_override_kobo !== null
      ? row.price_override_kobo
      : (row.sale_price_kobo !== null ? row.sale_price_kobo : row.product_price_kobo);

    const itemSubtotalKobo = unitPriceKobo * item.quantity;
    subtotalKobo += itemSubtotalKobo;

    verifiedItems.push({
      productId: row.product_id,
      variantId: row.variant_id,
      productNameSnapshot: row.product_name,
      variantNameSnapshot: `Size: ${row.size}${row.color ? ` / ${row.color}` : ''}`,
      unitPriceKoboSnapshot: unitPriceKobo,
      quantity: item.quantity,
      subtotalKobo: itemSubtotalKobo,
    });

    itemsForWeight.push({
      category: row.category,
      name: row.product_name,
      quantity: item.quantity,
    });
  }

  // Calculate delivery fee using exact rate cards (Abuja, Benin, Lagos tiers)
  let totalWeightKg = 1.0;
  try {
    const { calculateCartTotalWeightKg } = require('./shipping');
    totalWeightKg = calculateCartTotalWeightKg(itemsForWeight);
  } catch {
    totalWeightKg = 1.0;
  }

  const deliveryFeeKobo = calculateDeliveryFee(deliveryState, subtotalKobo, deliveryCity, deliveryAddress, totalWeightKg);
  const totalKobo = subtotalKobo + deliveryFeeKobo;

  return {
    subtotalKobo,
    deliveryFeeKobo,
    totalKobo,
    verifiedItems,
  };
}

/**
 * Verify Paystack / Gateway Webhook Signature using HMAC-SHA512
 */
export function verifyWebhookSignature(payload: string, signature: string, secretKey: string): boolean {
  if (!signature || !secretKey) return false;
  const hash = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
