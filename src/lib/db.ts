import { initialProducts } from './initialProducts';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { hashPassword, verifyPassword, verifySignedAdminToken } from './auth';
import type { Product, ProductVariant, ProductImage, Order, OrderItem, Category, PaymentStatus, FulfillmentStatus, Customer } from './types';
import { calculateOrderShipping } from './shipping';
import { getTursoClient } from './turso';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const isVercel = Boolean(process.env.VERCEL);
  const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'deendrip.db');

  // On Vercel, copy pre-seeded database to writable /tmp on first execution
  if (isVercel && !fs.existsSync(dbPath)) {
    const bundledDb = path.join(process.cwd(), 'data', 'deendrip.db');
    if (fs.existsSync(bundledDb)) {
      try {
        fs.copyFileSync(bundledDb, dbPath);
      } catch {
        // Fall back to clean init and auto-seed
      }
    }
  }

  dbInstance = new DatabaseSync(dbPath);

  // Enable WAL mode for high performance concurrent reads and writes
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  initSchema(dbInstance);
  seedInitialData(dbInstance);

  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price_kobo INTEGER NOT NULL,
      sale_price_kobo INTEGER,
      is_published INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_new_drop INTEGER NOT NULL DEFAULT 0,
      details_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      is_alternate INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      color TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      sku TEXT UNIQUE NOT NULL,
      price_override_kobo INTEGER,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_reference TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_city TEXT NOT NULL,
      delivery_state TEXT NOT NULL,
      delivery_fee_kobo INTEGER NOT NULL,
      subtotal_kobo INTEGER NOT NULL,
      total_kobo INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      fulfillment_status TEXT NOT NULL DEFAULT 'pending',
      payment_reference TEXT,
      tracking_reference TEXT,
      internal_notes TEXT,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      product_name_snapshot TEXT NOT NULL,
      variant_name_snapshot TEXT NOT NULL,
      unit_price_kobo_snapshot INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal_kobo INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_notes (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'manager',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS webhook_logs (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL,
      processed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_zones (
      id TEXT PRIMARY KEY,
      zone_name TEXT NOT NULL,
      state_match TEXT NOT NULL,
      fee_kobo INTEGER NOT NULL,
      free_threshold_kobo INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      order_ref TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      email_type TEXT NOT NULL,
      order_reference TEXT,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      error_message TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_username ON customers(username);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_ref ON orders(order_reference);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status, fulfillment_status);
    CREATE INDEX IF NOT EXISTS idx_email_logs_ref ON email_logs(order_reference);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(token);
  `);

  // Migrate: add columns if they don't exist (idempotent for existing DBs)
  try { db.exec('ALTER TABLE orders ADD COLUMN tracking_reference TEXT'); } catch { /* already exists */ }
  try { db.exec('ALTER TABLE orders ADD COLUMN internal_notes TEXT'); } catch { /* already exists */ }
  try { db.exec('ALTER TABLE orders ADD COLUMN updated_at TEXT'); } catch { /* already exists */ }
  try { db.exec('ALTER TABLE products ADD COLUMN sale_price_kobo INTEGER'); } catch { /* already exists */ }
  try { db.exec('ALTER TABLE products ADD COLUMN updated_at TEXT'); } catch { /* already exists */ }
}

function seedInitialData(db: DatabaseSync) {
  // Check if products exist
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (countRow.count > 0) {
    // Still seed delivery zones and settings if not present
    seedDeliveryZones(db);
    seedStoreSettings(db);
    return;
  }

  const now = new Date().toISOString();

  // Seed default admin — password must be changed before production
  const { hash, salt } = hashPassword('DeenDripAdmin2026!');
  db.prepare(`
    INSERT OR IGNORE INTO admins (id, email, password_hash, salt, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('admin-1', 'admin@deendrip.com', hash, salt, 'HafTech Lead Admin', 'superadmin', now);

  const productsData = initialProducts;

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

  for (const p of productsData) {
    insertProduct.run(
      p.id,
      p.slug,
      p.name,
      p.description,
      p.category,
      p.priceKobo,
      p.isPublished ? 1 : 0,
      p.isFeatured ? 1 : 0,
      p.isNewDrop ? 1 : 0,
      JSON.stringify(p.details),
      now
    );

    for (const img of p.images) {
      insertImage.run(
        img.id,
        p.id,
        img.imageUrl,
        img.altText,
        img.isPrimary ? 1 : 0,
        img.isAlternate ? 1 : 0,
        img.sortOrder
      );
    }

    for (const v of p.variants) {
      insertVariant.run(
        v.id,
        p.id,
        v.size,
        (v as any).color || null,
        v.stockQuantity,
        v.sku,
        null
      );
    }
  }

  seedDeliveryZones(db);
  seedStoreSettings(db);
}

function seedDeliveryZones(db: DatabaseSync) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM delivery_zones').get() as { c: number }).c;
  if (count > 0) return;
  const now = new Date().toISOString();
  const insertZone = db.prepare(`
    INSERT INTO delivery_zones (id, zone_name, state_match, fee_kobo, free_threshold_kobo, is_active, sort_order, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `);
  insertZone.run('zone-lagos', 'Lagos', 'lagos', 350000, 8500000, 1, now);
  insertZone.run('zone-nationwide', 'Nationwide', '__nationwide__', 650000, null, 2, now);
}

function seedStoreSettings(db: DatabaseSync) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM store_settings').get() as { c: number }).c;
  if (count > 0) return;
  const now = new Date().toISOString();
  const upsert = db.prepare('INSERT OR IGNORE INTO store_settings (key, value, updated_at) VALUES (?, ?, ?)');
  upsert.run('store_name', 'Deen Drip', now);
  upsert.run('announcement_bar', 'FREE delivery on Lagos orders above ₦85,000 · Shop the AW26 Drop', now);
  upsert.run('announcement_bar_enabled', '1', now);
  upsert.run('support_email', 'orders@deendrip.com', now);
  upsert.run('support_phone', '', now);
  upsert.run('instagram_url', 'https://instagram.com/deendrip', now);
  upsert.run('twitter_url', '', now);
  upsert.run('hero_slides', JSON.stringify([
    {
      id: 'slide-1',
      headline: 'Wear Your Deen.',
      subtext: 'A collision of faith, identity, and modern streetwear.',
      ctaLabel: 'Shop the Collection',
      ctaHref: '/shop',
      bgImage: '/assets/campaign/hero-brutalist-concrete-bg.jpg',
      modelImage: '/assets/campaign/hero-models-duo-clean.png',
      isActive: true,
    }
  ]), now);
}

// -------------------------------------------------------------
// Admin Session Management — Serverless & persistent session store
// -------------------------------------------------------------

export async function createAdminSessionAsync(adminId: string, token: string): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const sessId = `sess-${Date.now()}`;

  try {
    // Clean up expired sessions for this admin
    db.prepare('DELETE FROM admin_sessions WHERE admin_id = ? AND expires_at < ?').run(adminId, now);
    db.prepare(`
      INSERT INTO admin_sessions (id, admin_id, token, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessId, adminId, token, now, expiresAt);
  } catch (err) {
    console.error('Local db session insert error:', err);
  }

  const turso = getTursoClient();
  if (turso) {
    try {
      await turso.execute({
        sql: 'INSERT OR REPLACE INTO admin_sessions (id, admin_id, token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
        args: [sessId, adminId, token, now, expiresAt]
      });
    } catch (err) {
      console.error('Turso session sync error:', err);
    }
  }
}

export function createAdminSession(adminId: string, token: string): void {
  void createAdminSessionAsync(adminId, token);
}

export interface SessionAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function validateAdminSession(token: string): SessionAdmin | null {
  if (!token) return null;
  const signed = verifySignedAdminToken(token);
  if (signed) return signed;

  try {
    const db = getDb();
    const now = new Date().toISOString();
    const row = db.prepare(`
      SELECT a.id, a.email, a.name, a.role
      FROM admin_sessions s
      JOIN admins a ON a.id = s.admin_id
      WHERE s.token = ? AND s.expires_at > ?
    `).get(token, now) as SessionAdmin | undefined;
    return row || null;
  } catch {
    return null;
  }
}

export async function validateAdminSessionAsync(token: string): Promise<SessionAdmin | null> {
  if (!token) return null;

  // 1. Fast, stateless cryptographic verification (works seamlessly across all serverless lambdas)
  const signedAdmin = verifySignedAdminToken(token);
  if (signedAdmin) {
    return signedAdmin;
  }

  // 2. Local SQLite session verification
  const local = validateAdminSession(token);
  if (local) return local;

  // 3. Turso cloud database session verification
  const turso = getTursoClient();
  if (!turso) return null;

  try {
    const now = new Date().toISOString();
    const res = await turso.execute({
      sql: `SELECT a.id, a.email, a.name, a.role
            FROM admin_sessions s
            JOIN admins a ON a.id = s.admin_id
            WHERE s.token = ? AND s.expires_at > ?`,
      args: [token, now],
    });

    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    const admin: SessionAdmin = {
      id: String(r.id),
      email: String(r.email),
      name: String(r.name),
      role: String(r.role),
    };

    // Warm local cache so subsequent requests on this container are instant
    try {
      const db = getDb();
      db.prepare(`
        INSERT OR IGNORE INTO admins (id, email, password_hash, salt, name, role, created_at)
        VALUES (?, ?, 'cached', 'cached', ?, ?, ?)
      `).run(admin.id, admin.email, admin.name, admin.role, now);
      db.prepare(`
        INSERT OR REPLACE INTO admin_sessions (id, admin_id, token, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(`sess-warm-${Date.now()}`, admin.id, token, now, new Date(Date.now() + 86400000).toISOString());
    } catch {
      // Ignore cache write errors
    }

    return admin;
  } catch (err) {
    console.error('Turso validateAdminSessionAsync error:', err);
    return null;
  }
}

export function deleteAdminSession(token: string): void {
  try {
    const db = getDb();
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  } catch {}
  const turso = getTursoClient();
  if (turso) {
    turso.execute({
      sql: 'DELETE FROM admin_sessions WHERE token = ?',
      args: [token]
    }).catch(() => {});
  }
}

export function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  detail?: string
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO admin_audit_log (id, admin_id, admin_email, action, resource_type, resource_id, detail, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(`audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, adminId, adminEmail, action, resourceType || null, resourceId || null, detail || null, new Date().toISOString());
}

// -------------------------------------------------------------
// Database Query APIs
// -------------------------------------------------------------

export function getProducts(options?: {
  category?: Category | 'all';
  featuredOnly?: boolean;
  newDropOnly?: boolean;
  publishedOnly?: boolean;
  searchQuery?: string;
}): Product[] {
  const db = getDb();
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params: unknown[] = [];

  if (options?.publishedOnly !== false) {
    sql += ' AND is_published = 1';
  }

  if (options?.searchQuery) {
    sql += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
    const term = `%${options.searchQuery}%`;
    params.push(term, term, term);
  }

  if (options?.category && options.category !== 'all') {
    sql += ' AND category = ?';
    params.push(options.category);
  }

  if (options?.featuredOnly) {
    sql += ' AND is_featured = 1';
  }

  if (options?.newDropOnly) {
    sql += ' AND is_new_drop = 1';
  }

  sql += ' ORDER BY is_featured DESC, created_at DESC';

  const rows = db.prepare(sql).all(...params) as Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    category: Category;
    price_kobo: number;
    sale_price_kobo: number | null;
    is_published: number;
    is_featured: number;
    is_new_drop: number;
    details_json: string | null;
    created_at: string;
    updated_at: string | null;
  }>;

  return rows.map(r => hydrateProduct(db, r));
}

export async function getProductsAsync(options?: {
  category?: Category | 'all';
  featuredOnly?: boolean;
  newDropOnly?: boolean;
  publishedOnly?: boolean;
  searchQuery?: string;
}): Promise<Product[]> {
  const turso = getTursoClient();
  if (!turso) {
    return getProducts(options);
  }

  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const args: any[] = [];

    if (options?.publishedOnly !== false) {
      sql += ' AND is_published = 1';
    }

    if (options?.searchQuery) {
      sql += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
      const term = `%${options.searchQuery}%`;
      args.push(term, term, term);
    }

    if (options?.category && options.category !== 'all') {
      sql += ' AND category = ?';
      args.push(options.category);
    }

    if (options?.featuredOnly) {
      sql += ' AND is_featured = 1';
    }

    if (options?.newDropOnly) {
      sql += ' AND is_new_drop = 1';
    }

    sql += ' ORDER BY is_featured DESC, created_at DESC';

    const prodRes = await turso.execute({ sql, args });
    if (prodRes.rows.length === 0) {
      return getProducts(options);
    }

    const prodIds = prodRes.rows.map(r => String(r.id));
    const placeholders = prodIds.map(() => '?').join(', ');

    // Fetch images and variants in parallel from Turso
    const [imagesRes, variantsRes] = await Promise.all([
      turso.execute({
        sql: `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
        args: prodIds,
      }),
      turso.execute({
        sql: `SELECT * FROM product_variants WHERE product_id IN (${placeholders}) ORDER BY id ASC`,
        args: prodIds,
      }),
    ]);

    const imagesByProdId = new Map<string, ProductImage[]>();
    for (const img of imagesRes.rows) {
      const pid = String(img.product_id);
      if (!imagesByProdId.has(pid)) imagesByProdId.set(pid, []);
      imagesByProdId.get(pid)!.push({
        id: String(img.id),
        productId: pid,
        imageUrl: String(img.image_url),
        altText: String(img.alt_text || ''),
        isPrimary: Number(img.is_primary) === 1,
        isAlternate: Number(img.is_alternate) === 1,
        sortOrder: Number(img.sort_order || 0),
      });
    }

    const variantsByProdId = new Map<string, ProductVariant[]>();
    for (const v of variantsRes.rows) {
      const pid = String(v.product_id);
      if (!variantsByProdId.has(pid)) variantsByProdId.set(pid, []);
      variantsByProdId.get(pid)!.push({
        id: String(v.id),
        productId: pid,
        size: String(v.size),
        color: v.color ? String(v.color) : undefined,
        stockQuantity: Number(v.stock_quantity || 0),
        sku: String(v.sku || ''),
        priceOverrideKobo: v.price_override_kobo ? Number(v.price_override_kobo) : null,
      });
    }

    return prodRes.rows.map(r => {
      const id = String(r.id);
      let details: Product['details'] = undefined;
      if (r.details_json) {
        try {
          details = JSON.parse(String(r.details_json));
        } catch {}
      }

      return {
        id,
        slug: String(r.slug),
        name: String(r.name),
        description: String(r.description),
        category: String(r.category) as Category,
        priceKobo: Number(r.price_kobo),
        salePriceKobo: r.sale_price_kobo ? Number(r.sale_price_kobo) : undefined,
        isPublished: Number(r.is_published) === 1,
        isFeatured: Number(r.is_featured) === 1,
        isNewDrop: Number(r.is_new_drop) === 1,
        details,
        images: imagesByProdId.get(id) || [],
        variants: variantsByProdId.get(id) || [],
        createdAt: String(r.created_at),
        updatedAt: r.updated_at ? String(r.updated_at) : undefined,
      };
    });
  } catch (err) {
    console.error('Turso getProductsAsync error, falling back to local SQLite:', err);
    return getProducts(options);
  }
}


export function getProductBySlug(slug: string): Product | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug) as any | undefined;
  if (!row) return null;
  return hydrateProduct(db, row);
}

export function getProductById(id: string): Product | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any | undefined;
  if (!row) return null;
  return hydrateProduct(db, row);
}

function hydrateProduct(db: DatabaseSync, row: any): Product {
  const images = (db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').all(row.id) as Array<{
    id: string;
    product_id: string;
    image_url: string;
    alt_text: string;
    is_primary: number;
    is_alternate: number;
    sort_order: number;
  }>).map(img => ({
    id: img.id,
    productId: img.product_id,
    imageUrl: img.image_url,
    altText: img.alt_text,
    isPrimary: img.is_primary === 1,
    isAlternate: img.is_alternate === 1,
    sortOrder: img.sort_order,
  }));

  const variants = (db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC').all(row.id) as Array<{
    id: string;
    product_id: string;
    size: string;
    color: string | null;
    stock_quantity: number;
    sku: string;
    price_override_kobo: number | null;
  }>).map(v => ({
    id: v.id,
    productId: v.product_id,
    size: v.size,
    color: v.color || undefined,
    stockQuantity: v.stock_quantity,
    sku: v.sku,
    priceOverrideKobo: v.price_override_kobo,
  }));

  let details: Product['details'] = undefined;
  if (row.details_json) {
    try {
      details = JSON.parse(row.details_json);
    } catch {
      // fallback
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    priceKobo: row.price_kobo,
    salePriceKobo: row.sale_price_kobo ?? undefined,
    isPublished: row.is_published === 1,
    isFeatured: row.is_featured === 1,
    isNewDrop: row.is_new_drop === 1,
    details,
    images,
    variants,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

// -------------------------------------------------------------
// Product CRUD
// -------------------------------------------------------------

export interface CreateProductInput {
  slug: string;
  name: string;
  description: string;
  category: Category;
  priceKobo: number;
  salePriceKobo?: number | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNewDrop?: boolean;
  details?: Product['details'];
  images?: Array<{ imageUrl: string; altText: string; isPrimary: boolean; isAlternate: boolean; sortOrder: number }>;
  variants?: Array<{ size: string; color?: string; stockQuantity: number; sku: string; priceOverrideKobo?: number | null }>;
}

export function createProduct(input: CreateProductInput): Product {
  const db = getDb();
  const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  db.exec('BEGIN TRANSACTION;');
  try {
    db.prepare(`
      INSERT INTO products (id, slug, name, description, category, price_kobo, sale_price_kobo, is_published, is_featured, is_new_drop, details_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, input.slug, input.name, input.description, input.category,
      input.priceKobo, input.salePriceKobo ?? null,
      input.isPublished !== false ? 1 : 0,
      input.isFeatured ? 1 : 0,
      input.isNewDrop ? 1 : 0,
      input.details ? JSON.stringify(input.details) : null,
      now, now
    );

    if (input.images) {
      const insertImg = db.prepare(`
        INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, is_alternate, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      input.images.forEach((img, i) => {
        insertImg.run(`img-${id}-${i}`, id, img.imageUrl, img.altText, img.isPrimary ? 1 : 0, img.isAlternate ? 1 : 0, img.sortOrder);
      });
    }

    if (input.variants) {
      const insertVar = db.prepare(`
        INSERT INTO product_variants (id, product_id, size, color, stock_quantity, sku, price_override_kobo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      input.variants.forEach((v, i) => {
        insertVar.run(`var-${id}-${i}`, id, v.size, v.color || null, v.stockQuantity, v.sku, v.priceOverrideKobo ?? null);
      });
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return getProductById(id)!;
}

export async function createProductAsync(input: CreateProductInput): Promise<Product> {
  const product = createProduct(input);
  const turso = getTursoClient();
  if (turso) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO products (
          id, slug, name, description, category, price_kobo, sale_price_kobo,
          is_published, is_featured, is_new_drop, details_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          product.id, product.slug, product.name, product.description, product.category,
          product.priceKobo, product.salePriceKobo ?? null,
          product.isPublished ? 1 : 0, product.isFeatured ? 1 : 0, product.isNewDrop ? 1 : 0,
          product.details ? JSON.stringify(product.details) : null,
          product.createdAt, product.updatedAt || product.createdAt,
        ],
      });

      if (input.images && input.images.length > 0) {
        for (let i = 0; i < input.images.length; i++) {
          const img = input.images[i];
          await turso.execute({
            sql: `INSERT OR REPLACE INTO product_images (
              id, product_id, image_url, alt_text, is_primary, is_alternate, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [`img-${product.id}-${i}`, product.id, img.imageUrl, img.altText, img.isPrimary ? 1 : 0, img.isAlternate ? 1 : 0, img.sortOrder],
          });
        }
      }

      if (input.variants && input.variants.length > 0) {
        for (let i = 0; i < input.variants.length; i++) {
          const v = input.variants[i];
          await turso.execute({
            sql: `INSERT OR REPLACE INTO product_variants (
              id, product_id, size, color, stock_quantity, sku, price_override_kobo
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [`var-${product.id}-${i}`, product.id, v.size, v.color || null, v.stockQuantity, v.sku, v.priceOverrideKobo ?? null],
          });
        }
      }
    } catch (err) {
      console.error('Turso createProductAsync error:', err);
    }
  }
  return product;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: Category;
  priceKobo?: number;
  salePriceKobo?: number | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNewDrop?: boolean;
  details?: Product['details'];
}

export function updateProduct(id: string, input: UpdateProductInput): Product | null {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = getProductById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const vals: unknown[] = [];

  if (input.name !== undefined) { fields.push('name = ?'); vals.push(input.name); }
  if (input.description !== undefined) { fields.push('description = ?'); vals.push(input.description); }
  if (input.category !== undefined) { fields.push('category = ?'); vals.push(input.category); }
  if (input.priceKobo !== undefined) { fields.push('price_kobo = ?'); vals.push(input.priceKobo); }
  if ('salePriceKobo' in input) { fields.push('sale_price_kobo = ?'); vals.push(input.salePriceKobo ?? null); }
  if (input.isPublished !== undefined) { fields.push('is_published = ?'); vals.push(input.isPublished ? 1 : 0); }
  if (input.isFeatured !== undefined) { fields.push('is_featured = ?'); vals.push(input.isFeatured ? 1 : 0); }
  if (input.isNewDrop !== undefined) { fields.push('is_new_drop = ?'); vals.push(input.isNewDrop ? 1 : 0); }
  if (input.details !== undefined) { fields.push('details_json = ?'); vals.push(JSON.stringify(input.details)); }

  if (fields.length === 0) return existing;

  fields.push('updated_at = ?');
  vals.push(now);
  vals.push(id);

  db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...vals);

  const turso = getTursoClient();
  if (turso) {
    turso.execute({
      sql: `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      args: vals as any[],
    }).catch(err => console.error('Turso updateProduct sync error:', err));
  }

  return getProductById(id);
}

export async function updateProductAsync(id: string, input: UpdateProductInput): Promise<Product | null> {
  const updated = updateProduct(id, input);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  try {
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
  } catch {}
  const res = db.prepare('DELETE FROM products WHERE id = ?').run(id);

  const turso = getTursoClient();
  if (turso) {
    turso.execute({ sql: 'DELETE FROM product_images WHERE product_id = ?', args: [id] })
      .then(() => turso.execute({ sql: 'DELETE FROM product_variants WHERE product_id = ?', args: [id] }))
      .then(() => turso.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] }))
      .catch(err => console.error('Turso deleteProduct sync error:', err));
  }

  return res.changes > 0;
}

export async function deleteProductAsync(id: string): Promise<boolean> {
  const db = getDb();
  try {
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
  } catch {}
  const res = db.prepare('DELETE FROM products WHERE id = ?').run(id);

  const turso = getTursoClient();
  if (turso) {
    try {
      await turso.execute({ sql: 'DELETE FROM product_images WHERE product_id = ?', args: [id] });
      await turso.execute({ sql: 'DELETE FROM product_variants WHERE product_id = ?', args: [id] });
      await turso.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
    } catch (err) {
      console.error('Turso deleteProductAsync error:', err);
    }
  }

  return res.changes > 0;
}

export function upsertProductVariant(productId: string, variant: {
  id?: string;
  size: string;
  color?: string;
  stockQuantity: number;
  sku: string;
  priceOverrideKobo?: number | null;
}): void {
  const db = getDb();
  const variantId = variant.id || `var-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  db.prepare(`
    INSERT INTO product_variants (id, product_id, size, color, stock_quantity, sku, price_override_kobo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      size = excluded.size,
      color = excluded.color,
      stock_quantity = excluded.stock_quantity,
      sku = excluded.sku,
      price_override_kobo = excluded.price_override_kobo
  `).run(variantId, productId, variant.size, variant.color || null, variant.stockQuantity, variant.sku, variant.priceOverrideKobo ?? null);
}

export function deleteProductVariant(variantId: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM product_variants WHERE id = ?').run(variantId);
  return res.changes > 0;
}

export function upsertProductImage(productId: string, image: {
  id?: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  isAlternate: boolean;
  sortOrder: number;
}): string {
  const db = getDb();
  const imgId = image.id || `img-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  if (image.isPrimary) {
    db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(productId);
  }
  if (image.isAlternate) {
    db.prepare('UPDATE product_images SET is_alternate = 0 WHERE product_id = ?').run(productId);
  }
  db.prepare(`
    INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, is_alternate, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      image_url = excluded.image_url,
      alt_text = excluded.alt_text,
      is_primary = excluded.is_primary,
      is_alternate = excluded.is_alternate,
      sort_order = excluded.sort_order
  `).run(imgId, productId, image.imageUrl, image.altText, image.isPrimary ? 1 : 0, image.isAlternate ? 1 : 0, image.sortOrder);
  return imgId;
}

export function deleteProductImage(imageId: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM product_images WHERE id = ?').run(imageId);
  return res.changes > 0;
}

// -------------------------------------------------------------
// Orders API with Transactional Concurrency
// -------------------------------------------------------------

export function createOrderWithItems(orderData: {
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryFeeKobo: number;
  subtotalKobo: number;
  totalKobo: number;
  items: Array<{
    productId: string;
    variantId: string;
    productNameSnapshot: string;
    variantNameSnapshot: string;
    unitPriceKoboSnapshot: number;
    quantity: number;
    subtotalKobo: number;
  }>;
}): Order {
  const db = getDb();
  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  // Begin ACID transaction
  db.exec('BEGIN TRANSACTION;');

  try {
    // 1. Verify and deduct stock for each variant
    for (const item of orderData.items) {
      const variantRow = db.prepare('SELECT stock_quantity FROM product_variants WHERE id = ?').get(item.variantId) as { stock_quantity: number } | undefined;
      if (!variantRow) {
        throw new Error(`Variant ${item.variantId} not found`);
      }
      if (variantRow.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productNameSnapshot} (${item.variantNameSnapshot}). Available: ${variantRow.stock_quantity}`);
      }

      db.prepare('UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?').run(item.quantity, item.variantId);
    }

    // 2. Insert order
    db.prepare(`
      INSERT INTO orders (
        id, order_reference, customer_name, customer_email, customer_phone,
        delivery_address, delivery_city, delivery_state, delivery_fee_kobo,
        subtotal_kobo, total_kobo, payment_status, fulfillment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)
    `).run(
      orderId,
      orderData.orderReference,
      orderData.customerName,
      orderData.customerEmail,
      orderData.customerPhone,
      orderData.deliveryAddress,
      orderData.deliveryCity,
      orderData.deliveryState,
      orderData.deliveryFeeKobo,
      orderData.subtotalKobo,
      orderData.totalKobo,
      now,
      now
    );

    // 3. Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, variant_id, product_name_snapshot,
        variant_name_snapshot, unit_price_kobo_snapshot, quantity, subtotal_kobo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < orderData.items.length; i++) {
      const it = orderData.items[i];
      insertItem.run(
        `item-${orderId}-${i + 1}`,
        orderId,
        it.productId,
        it.variantId,
        it.productNameSnapshot,
        it.variantNameSnapshot,
        it.unitPriceKoboSnapshot,
        it.quantity,
        it.subtotalKobo
      );
    }

    db.exec('COMMIT;');

    // Sync order to Turso cloud database
    const turso = getTursoClient();
    if (turso) {
      turso.execute({
        sql: `INSERT OR REPLACE INTO orders (
          id, order_reference, customer_name, customer_email, customer_phone,
          delivery_address, delivery_city, delivery_state, delivery_fee_kobo,
          subtotal_kobo, total_kobo, payment_status, fulfillment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)`,
        args: [
          orderId,
          orderData.orderReference,
          orderData.customerName,
          orderData.customerEmail,
          orderData.customerPhone,
          orderData.deliveryAddress,
          orderData.deliveryCity,
          orderData.deliveryState,
          orderData.deliveryFeeKobo,
          orderData.subtotalKobo,
          orderData.totalKobo,
          now,
          now
        ]
      }).then(async () => {
        for (let i = 0; i < orderData.items.length; i++) {
          const it = orderData.items[i];
          await turso.execute({
            sql: `INSERT OR REPLACE INTO order_items (
              id, order_id, product_id, variant_id, product_name_snapshot,
              variant_name_snapshot, unit_price_kobo_snapshot, quantity, subtotal_kobo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              `item-${orderId}-${i + 1}`,
              orderId,
              it.productId,
              it.variantId,
              it.productNameSnapshot,
              it.variantNameSnapshot,
              it.unitPriceKoboSnapshot,
              it.quantity,
              it.subtotalKobo
            ]
          });
        }
      }).catch(err => console.error('Turso order sync error:', err));
    }

    return getOrderByReference(orderData.orderReference)!;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

function rowToOrder(r: any, items: OrderItem[]): Order {
  return {
    id: r.id,
    orderReference: r.order_reference,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    deliveryAddress: r.delivery_address,
    deliveryCity: r.delivery_city,
    deliveryState: r.delivery_state,
    deliveryFeeKobo: r.delivery_fee_kobo,
    subtotalKobo: r.subtotal_kobo,
    totalKobo: r.total_kobo,
    paymentStatus: r.payment_status,
    fulfillmentStatus: r.fulfillment_status,
    paymentReference: r.payment_reference,
    trackingReference: r.tracking_reference,
    internalNotes: r.internal_notes,
    paidAt: r.paid_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    items,
  };
}

function rowsToItems(itemRows: any[]): OrderItem[] {
  return itemRows.map(it => ({
    id: it.id,
    orderId: it.order_id,
    productId: it.product_id,
    variantId: it.variant_id,
    productNameSnapshot: it.product_name_snapshot,
    variantNameSnapshot: it.variant_name_snapshot,
    unitPriceKoboSnapshot: it.unit_price_kobo_snapshot,
    quantity: it.quantity,
    subtotalKobo: it.subtotal_kobo,
  }));
}

export function getOrderByReference(orderRef: string): Order | null {
  const db = getDb();
  const r = db.prepare('SELECT * FROM orders WHERE order_reference = ?').get(orderRef) as any | undefined;
  if (!r) return null;
  const itemRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(r.id) as any[];
  return rowToOrder(r, rowsToItems(itemRows));
}

export async function getOrderByReferenceAsync(orderRef: string): Promise<Order | null> {
  // 1. Check local cache first
  const local = getOrderByReference(orderRef);
  if (local) return local;

  // 2. Fall back to Turso cloud database
  const turso = getTursoClient();
  if (!turso) return null;

  try {
    const res = await turso.execute({
      sql: 'SELECT * FROM orders WHERE order_reference = ?',
      args: [orderRef],
    });

    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    const itemsRes = await turso.execute({
      sql: 'SELECT * FROM order_items WHERE order_id = ?',
      args: [r.id],
    });

    const items = itemsRes.rows.map(it => ({
      id: String(it.id),
      orderId: String(it.order_id),
      productId: String(it.product_id),
      variantId: String(it.variant_id),
      productNameSnapshot: String(it.product_name_snapshot),
      variantNameSnapshot: String(it.variant_name_snapshot),
      unitPriceKoboSnapshot: Number(it.unit_price_kobo_snapshot),
      quantity: Number(it.quantity),
      subtotalKobo: Number(it.subtotal_kobo),
    }));

    const order = rowToOrder(r, items);

    // Warm local cache so subsequent sync reads are instant
    try {
      const db = getDb();
      db.prepare(`
        INSERT OR REPLACE INTO orders (
          id, order_reference, customer_name, customer_email, customer_phone,
          delivery_address, delivery_city, delivery_state, delivery_fee_kobo,
          subtotal_kobo, total_kobo, payment_status, fulfillment_status,
          payment_reference, tracking_reference, internal_notes, paid_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        order.id, order.orderReference, order.customerName, order.customerEmail, order.customerPhone,
        order.deliveryAddress, order.deliveryCity, order.deliveryState, order.deliveryFeeKobo,
        order.subtotalKobo, order.totalKobo, order.paymentStatus, order.fulfillmentStatus,
        order.paymentReference || null, order.trackingReference || null, order.internalNotes || null,
        order.paidAt || null, order.createdAt, order.updatedAt || null
      );
    } catch {
      // Ignore cache write errors
    }

    return order;
  } catch (err) {
    console.error('Turso getOrderByReferenceAsync error:', err);
    return null;
  }
}

export function getOrderById(id: string): Order | null {
  const db = getDb();
  const r = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any | undefined;
  if (!r) return null;
  const itemRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(r.id) as any[];
  return rowToOrder(r, rowsToItems(itemRows));
}

export function getOrdersByCustomerEmail(email: string): Order[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM orders WHERE LOWER(customer_email) = LOWER(?) ORDER BY created_at DESC').all(email) as any[];
  return rows.map(r => {
    const itemRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(r.id) as any[];
    return rowToOrder(r, rowsToItems(itemRows));
  });
}

export function getAllOrders(options?: {
  paymentStatus?: PaymentStatus | 'all';
  fulfillmentStatus?: FulfillmentStatus | 'all';
  searchQuery?: string;
  limit?: number;
  offset?: number;
}): Order[] {
  const db = getDb();
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params: unknown[] = [];

  if (options?.paymentStatus && options.paymentStatus !== 'all') {
    sql += ' AND payment_status = ?';
    params.push(options.paymentStatus);
  }
  if (options?.fulfillmentStatus && options.fulfillmentStatus !== 'all') {
    sql += ' AND fulfillment_status = ?';
    params.push(options.fulfillmentStatus);
  }
  if (options?.searchQuery) {
    sql += ' AND (order_reference LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
    const term = `%${options.searchQuery}%`;
    params.push(term, term, term, term);
  }

  sql += ' ORDER BY created_at DESC';

  if (options?.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }
  }

  const rows = db.prepare(sql).all(...params) as any[];

  // Batch fetch all items to avoid N+1
  const orderIds = rows.map(r => r.id);
  if (orderIds.length === 0) return [];

  const placeholders = orderIds.map(() => '?').join(', ');
  const allItems = db.prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`).all(...orderIds) as any[];

  const itemsByOrderId = new Map<string, any[]>();
  for (const item of allItems) {
    if (!itemsByOrderId.has(item.order_id)) itemsByOrderId.set(item.order_id, []);
    itemsByOrderId.get(item.order_id)!.push(item);
  }

  return rows.map(r => rowToOrder(r, rowsToItems(itemsByOrderId.get(r.id) || [])));
}

export async function getAllOrdersAsync(options?: {
  paymentStatus?: PaymentStatus | 'all';
  fulfillmentStatus?: FulfillmentStatus | 'all';
  searchQuery?: string;
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  const turso = getTursoClient();
  if (!turso) {
    return getAllOrders(options);
  }

  try {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const args: any[] = [];

    if (options?.paymentStatus && options.paymentStatus !== 'all') {
      sql += ' AND payment_status = ?';
      args.push(options.paymentStatus);
    }
    if (options?.fulfillmentStatus && options.fulfillmentStatus !== 'all') {
      sql += ' AND fulfillment_status = ?';
      args.push(options.fulfillmentStatus);
    }
    if (options?.searchQuery) {
      sql += ' AND (order_reference LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
      const term = `%${options.searchQuery}%`;
      args.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    if (options?.limit) {
      sql += ' LIMIT ?';
      args.push(options.limit);
      if (options.offset) {
        sql += ' OFFSET ?';
        args.push(options.offset);
      }
    }

    const orderRes = await turso.execute({ sql, args });
    if (orderRes.rows.length === 0) {
      return getAllOrders(options);
    }

    const orderIds = orderRes.rows.map(r => String(r.id));
    const placeholders = orderIds.map(() => '?').join(', ');
    const itemsRes = await turso.execute({
      sql: `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      args: orderIds,
    });

    const itemsByOrderId = new Map<string, OrderItem[]>();
    for (const it of itemsRes.rows) {
      const oid = String(it.order_id);
      if (!itemsByOrderId.has(oid)) itemsByOrderId.set(oid, []);
      itemsByOrderId.get(oid)!.push({
        id: String(it.id),
        orderId: oid,
        productId: String(it.product_id),
        variantId: String(it.variant_id),
        productNameSnapshot: String(it.product_name_snapshot),
        variantNameSnapshot: String(it.variant_name_snapshot),
        unitPriceKoboSnapshot: Number(it.unit_price_kobo_snapshot),
        quantity: Number(it.quantity),
        subtotalKobo: Number(it.subtotal_kobo),
      });
    }

    return orderRes.rows.map(r => rowToOrder(r, itemsByOrderId.get(String(r.id)) || []));
  } catch (err) {
    console.error('Turso getAllOrdersAsync error, falling back to local:', err);
    return getAllOrders(options);
  }
}

export function getOrdersCount(): number {
  const db = getDb();
  return (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
}

export function updateOrderPayment(orderRef: string, paymentStatus: PaymentStatus, paymentRef?: string): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  const res = db.prepare(`
    UPDATE orders 
    SET payment_status = ?, payment_reference = COALESCE(?, payment_reference), paid_at = CASE WHEN ? = 'paid' THEN ? ELSE paid_at END, updated_at = ?
    WHERE order_reference = ?
  `).run(paymentStatus, paymentRef || null, paymentStatus, now, now, orderRef);

  const turso = getTursoClient();
  if (turso) {
    turso.execute({
      sql: `UPDATE orders 
            SET payment_status = ?, payment_reference = COALESCE(?, payment_reference), paid_at = CASE WHEN ? = 'paid' THEN ? ELSE paid_at END, updated_at = ?
            WHERE order_reference = ?`,
      args: [paymentStatus, paymentRef || null, paymentStatus, now, now, orderRef]
    }).catch(err => console.error('Turso payment update sync error:', err));
  }

  return res.changes > 0;
}

export function updateOrderFulfillment(orderRef: string, fulfillmentStatus: FulfillmentStatus, trackingRef?: string): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  const res = db.prepare(`
    UPDATE orders SET fulfillment_status = ?, tracking_reference = COALESCE(?, tracking_reference), updated_at = ?
    WHERE order_reference = ?
  `).run(fulfillmentStatus, trackingRef || null, now, orderRef);

  const turso = getTursoClient();
  if (turso) {
    turso.execute({
      sql: `UPDATE orders SET fulfillment_status = ?, tracking_reference = COALESCE(?, tracking_reference), updated_at = ?
            WHERE order_reference = ?`,
      args: [fulfillmentStatus, trackingRef || null, now, orderRef]
    }).catch(err => console.error('Turso fulfillment update sync error:', err));
  }

  return res.changes > 0;
}

export async function updateOrderFulfillmentAsync(
  orderRef: string,
  fulfillmentStatus: FulfillmentStatus,
  trackingRef?: string,
  carrier?: string,
  note?: string,
  adminName?: string
): Promise<boolean> {
  const db = getDb();
  const now = new Date().toISOString();

  let combinedTracking = trackingRef;
  if (carrier && trackingRef) {
    if (trackingRef.toLowerCase().startsWith(carrier.toLowerCase())) {
      combinedTracking = trackingRef;
    } else {
      combinedTracking = `${carrier}: ${trackingRef}`;
    }
  } else if (carrier && !trackingRef) {
    combinedTracking = carrier;
  }

  const res = db.prepare(`
    UPDATE orders SET fulfillment_status = ?, tracking_reference = COALESCE(?, tracking_reference), updated_at = ?
    WHERE order_reference = ?
  `).run(fulfillmentStatus, combinedTracking || null, now, orderRef);

  // Add timeline event note
  const order = db.prepare('SELECT id FROM orders WHERE order_reference = ?').get(orderRef) as { id: string } | undefined;
  if (order) {
    const noteText = note
      ? `Status → ${fulfillmentStatus} | Carrier: ${carrier || 'Unspecified'} | Waybill: ${trackingRef || 'None'} | Note: ${note}`
      : `Status → ${fulfillmentStatus} | Carrier: ${carrier || 'Unspecified'} | Waybill: ${trackingRef || 'None'}`;

    addOrderNote(order.id, 'admin', adminName || 'Admin Staff', noteText);

    const turso = getTursoClient();
    if (turso) {
      try {
        await turso.execute({
          sql: `UPDATE orders SET fulfillment_status = ?, tracking_reference = COALESCE(?, tracking_reference), updated_at = ?
                WHERE order_reference = ?`,
          args: [fulfillmentStatus, combinedTracking || null, now, orderRef],
        });
        await turso.execute({
          sql: `INSERT INTO order_notes (id, order_id, admin_id, admin_name, note, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [`note-${Date.now()}`, order.id, 'admin', adminName || 'Admin Staff', noteText, now],
        });
      } catch (err) {
        console.error('Turso updateOrderFulfillmentAsync error:', err);
      }
    }
  }

  return res.changes > 0;
}

export function updateOrderNotes(orderRef: string, notes: string): boolean {
  const db = getDb();
  const order = db.prepare('SELECT id FROM orders WHERE order_reference = ?').get(orderRef) as { id: string } | undefined;
  if (!order) return false;
  db.prepare('UPDATE orders SET internal_notes = ?, updated_at = ? WHERE order_reference = ?').run(notes, new Date().toISOString(), orderRef);
  return true;
}

export function addOrderNote(orderId: string, adminId: string, adminName: string, note: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO order_notes (id, order_id, admin_id, admin_name, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(`note-${Date.now()}`, orderId, adminId, adminName, note, new Date().toISOString());
}

export function getOrderNotes(orderId: string): Array<{ id: string; adminName: string; note: string; createdAt: string }> {
  const db = getDb();
  return (db.prepare('SELECT * FROM order_notes WHERE order_id = ? ORDER BY created_at ASC').all(orderId) as any[])
    .map(n => ({ id: n.id, adminName: n.admin_name, note: n.note, createdAt: n.created_at }));
}

export async function getOrderNotesAsync(orderId: string): Promise<Array<{ id: string; adminName: string; note: string; createdAt: string }>> {
  const turso = getTursoClient();
  if (turso) {
    try {
      const res = await turso.execute({
        sql: 'SELECT * FROM order_notes WHERE order_id = ? ORDER BY created_at ASC',
        args: [orderId],
      });
      if (res.rows.length > 0) {
        return res.rows.map(n => ({
          id: String(n.id),
          adminName: String(n.admin_name),
          note: String(n.note),
          createdAt: String(n.created_at),
        }));
      }
    } catch {}
  }
  return getOrderNotes(orderId);
}

export async function getOrdersByCustomerEmailAsync(email: string): Promise<Order[]> {
  const turso = getTursoClient();
  if (turso) {
    try {
      const res = await turso.execute({
        sql: 'SELECT * FROM orders WHERE LOWER(customer_email) = LOWER(?) ORDER BY created_at DESC',
        args: [email.trim()],
      });
      if (res.rows.length > 0) {
        const orderIds = res.rows.map(r => String(r.id));
        const placeholders = orderIds.map(() => '?').join(', ');
        const itemsRes = await turso.execute({
          sql: `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
          args: orderIds,
        });
        const itemsByOrderId = new Map<string, OrderItem[]>();
        for (const it of itemsRes.rows) {
          const oid = String(it.order_id);
          if (!itemsByOrderId.has(oid)) itemsByOrderId.set(oid, []);
          itemsByOrderId.get(oid)!.push({
            id: String(it.id),
            orderId: oid,
            productId: String(it.product_id),
            variantId: String(it.variant_id),
            productNameSnapshot: String(it.product_name_snapshot),
            variantNameSnapshot: String(it.variant_name_snapshot),
            unitPriceKoboSnapshot: Number(it.unit_price_kobo_snapshot),
            quantity: Number(it.quantity),
            subtotalKobo: Number(it.subtotal_kobo),
          });
        }
        return res.rows.map(r => rowToOrder(r, itemsByOrderId.get(String(r.id)) || []));
      }
    } catch (err) {
      console.error('Turso getOrdersByCustomerEmailAsync error:', err);
    }
  }
  return getOrdersByCustomerEmail(email);
}

export function updateVariantStock(variantId: string, newStock: number): boolean {
  const db = getDb();
  const res = db.prepare('UPDATE product_variants SET stock_quantity = ? WHERE id = ?').run(newStock, variantId);

  const turso = getTursoClient();
  if (turso) {
    turso.execute({
      sql: 'UPDATE product_variants SET stock_quantity = ? WHERE id = ?',
      args: [newStock, variantId],
    }).catch(err => console.error('Turso stock sync error:', err));
  }

  return res.changes > 0;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  orderRef: string | null;
  message: string;
  createdAt: string;
}

export async function getContactInquiriesAsync(limit = 50): Promise<ContactInquiry[]> {
  const turso = getTursoClient();
  if (turso) {
    try {
      const res = await turso.execute({
        sql: 'SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT ?',
        args: [limit],
      });
      return res.rows.map(r => ({
        id: String(r.id),
        name: String(r.name),
        email: String(r.email),
        orderRef: r.order_ref ? String(r.order_ref) : null,
        message: String(r.message),
        createdAt: String(r.created_at),
      }));
    } catch (err) {
      console.warn('Turso contact_inquiries fetch error:', err);
    }
  }

  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
    return rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      orderRef: r.order_ref ? String(r.order_ref) : null,
      message: String(r.message),
      createdAt: String(r.created_at),
    }));
  } catch {
    return [];
  }
}


// -------------------------------------------------------------
// Delivery Zones
// -------------------------------------------------------------

export interface DeliveryZone {
  id: string;
  zoneName: string;
  stateMatch: string;
  feeKobo: number;
  freeThresholdKobo: number | null;
  isActive: boolean;
  sortOrder: number;
}

export function getDeliveryZones(): DeliveryZone[] {
  const db = getDb();
  return (db.prepare('SELECT * FROM delivery_zones WHERE is_active = 1 ORDER BY sort_order ASC').all() as any[])
    .map(z => ({
      id: z.id,
      zoneName: z.zone_name,
      stateMatch: z.state_match,
      feeKobo: z.fee_kobo,
      freeThresholdKobo: z.free_threshold_kobo,
      isActive: z.is_active === 1,
      sortOrder: z.sort_order,
    }));
}

export function getAllDeliveryZones(): DeliveryZone[] {
  const db = getDb();
  return (db.prepare('SELECT * FROM delivery_zones ORDER BY sort_order ASC').all() as any[])
    .map(z => ({
      id: z.id,
      zoneName: z.zone_name,
      stateMatch: z.state_match,
      feeKobo: z.fee_kobo,
      freeThresholdKobo: z.free_threshold_kobo,
      isActive: z.is_active === 1,
      sortOrder: z.sort_order,
    }));
}

export function calculateDeliveryFee(
  deliveryState: string,
  subtotalKobo: number,
  deliveryCity: string = '',
  deliveryAddress: string = '',
  totalWeightKg: number = 1.0
): number {
  try {
    const result = calculateOrderShipping({
      state: deliveryState,
      city: deliveryCity,
      address: deliveryAddress,
      subtotalKobo,
      totalWeightKg,
    });
    return result.deliveryFeeKobo;
  } catch {
    // Fallback if unexpected error occurs
    return deliveryState.toLowerCase().includes('lagos') ? 350000 : 750000;
  }
}

export function updateDeliveryZone(id: string, data: Partial<Omit<DeliveryZone, 'id'>>): boolean {
  const db = getDb();
  const fields: string[] = [];
  const vals: unknown[] = [];
  if (data.zoneName !== undefined) { fields.push('zone_name = ?'); vals.push(data.zoneName); }
  if (data.stateMatch !== undefined) { fields.push('state_match = ?'); vals.push(data.stateMatch); }
  if (data.feeKobo !== undefined) { fields.push('fee_kobo = ?'); vals.push(data.feeKobo); }
  if ('freeThresholdKobo' in data) { fields.push('free_threshold_kobo = ?'); vals.push(data.freeThresholdKobo ?? null); }
  if (data.isActive !== undefined) { fields.push('is_active = ?'); vals.push(data.isActive ? 1 : 0); }
  if (data.sortOrder !== undefined) { fields.push('sort_order = ?'); vals.push(data.sortOrder); }
  if (fields.length === 0) return false;
  fields.push('updated_at = ?');
  vals.push(new Date().toISOString());
  vals.push(id);
  const res = db.prepare(`UPDATE delivery_zones SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  return res.changes > 0;
}

// -------------------------------------------------------------
// Store Settings
// -------------------------------------------------------------

export function getStoreSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM store_settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function getAllStoreSettings(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM store_settings').all() as Array<{ key: string; value: string }>;
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export function setStoreSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO store_settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value, new Date().toISOString());
}

// -------------------------------------------------------------
// Customers
// -------------------------------------------------------------

export interface CustomerRow {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  password_hash: string;
  salt: string;
  created_at: string;
  updated_at: string | null;
}

function rowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    streetAddress: row.street_address,
    city: row.city,
    state: row.state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createCustomer(data: {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  password: string;
}): Customer {
  const db = getDb();
  const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const { hash, salt } = hashPassword(data.password);

  db.prepare(`
    INSERT INTO customers (id, username, full_name, email, phone, street_address, city, state, password_hash, salt, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.username.trim().toLowerCase(),
    data.fullName.trim(),
    data.email.trim().toLowerCase(),
    data.phone.trim(),
    data.streetAddress.trim(),
    data.city.trim(),
    data.state.trim(),
    hash,
    salt,
    now,
    now
  );

  return {
    id,
    username: data.username.trim().toLowerCase(),
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    streetAddress: data.streetAddress.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function getCustomerById(id: string): Customer | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export function getCustomerByEmail(email: string): Customer | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM customers WHERE LOWER(email) = LOWER(?)').get(email.trim()) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export function getCustomerByUsername(username: string): Customer | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM customers WHERE LOWER(username) = LOWER(?)').get(username.trim()) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export function verifyCustomerLogin(identifier: string, password: string): Customer | null {
  const db = getDb();
  const clean = identifier.trim().toLowerCase();
  const row = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ? OR LOWER(username) = ?').get(clean, clean) as CustomerRow | undefined;
  if (!row) return null;
  const isValid = verifyPassword(password, row.password_hash, row.salt);
  if (!isValid) return null;
  return rowToCustomer(row);
}

export function updateCustomerAddress(
  id: string,
  address: { streetAddress: string; city: string; state: string; phone?: string }
): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  const res = db.prepare(`
    UPDATE customers
    SET street_address = ?, city = ?, state = ?, phone = COALESCE(?, phone), updated_at = ?
    WHERE id = ?
  `).run(address.streetAddress.trim(), address.city.trim(), address.state.trim(), address.phone?.trim() ?? null, now, id);
  return res.changes > 0;
}

