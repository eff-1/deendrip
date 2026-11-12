import { initialProducts } from '../src/lib/initialProducts';
import { hashPassword } from '../src/lib/auth';
import { getTursoClient } from '../src/lib/turso';

const client = getTursoClient();
if (!client) {
  console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  process.exit(1);
}

async function initTurso() {
  console.log('1. Creating schema tables...');

  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS products (
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
    );`,

    `CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      is_alternate INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      color TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      sku TEXT UNIQUE NOT NULL,
      price_override_kobo INTEGER,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS orders (
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
    );`,

    `CREATE TABLE IF NOT EXISTS order_items (
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
    );`,

    `CREATE TABLE IF NOT EXISTS order_notes (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'manager',
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS admin_audit_log (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS webhook_logs (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL,
      processed_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS delivery_zones (
      id TEXT PRIMARY KEY,
      zone_name TEXT NOT NULL,
      state_match TEXT NOT NULL,
      fee_kobo INTEGER NOT NULL,
      free_threshold_kobo INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS customers (
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
    );`,

    `CREATE TABLE IF NOT EXISTS contact_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      order_ref TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      email_type TEXT NOT NULL,
      order_reference TEXT,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      error_message TEXT,
      created_at TEXT NOT NULL
    );`,

    `CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);`,
    `CREATE INDEX IF NOT EXISTS idx_customers_username ON customers(username);`,
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`,
    `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);`,
    `CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);`,
    `CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_ref ON orders(order_reference);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status, fulfillment_status);`,
    `CREATE INDEX IF NOT EXISTS idx_email_logs_ref ON email_logs(order_reference);`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(token);`
  ];

  for (const sql of schemaStatements) {
    await client.execute(sql);
  }
  console.log('✓ All schema tables and indexes verified on Turso.');

  // 2. Check if products already exist
  const countRes = await client.execute('SELECT COUNT(*) as count FROM products');
  const existingCount = Number(countRes.rows[0].count);
  console.log(`Current products in Turso: ${existingCount}`);

  const now = new Date().toISOString();

  // 3. Seed Admin
  const { hash, salt } = hashPassword('DeenDripAdmin2026!');
  await client.execute({
    sql: `INSERT OR IGNORE INTO admins (id, email, password_hash, salt, name, role, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: ['admin-1', 'admin@deendrip.com', hash, salt, 'HafTech Lead Admin', 'superadmin', now]
  });
  console.log('✓ Default admin account verified.');

  // 4. Seed Products if empty
  if (existingCount === 0) {
    console.log(`Seeding ${initialProducts.length} authentic pieces into Turso...`);

    for (const p of initialProducts) {
      await client.execute({
        sql: `INSERT INTO products (id, slug, name, description, category, price_kobo, is_published, is_featured, is_new_drop, details_json, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
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
        ]
      });

      for (const img of p.images) {
        await client.execute({
          sql: `INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, is_alternate, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            img.id,
            p.id,
            img.imageUrl,
            img.altText,
            img.isPrimary ? 1 : 0,
            img.isAlternate ? 1 : 0,
            img.sortOrder
          ]
        });
      }

      for (const v of p.variants) {
        await client.execute({
          sql: `INSERT INTO product_variants (id, product_id, size, color, stock_quantity, sku, price_override_kobo)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            v.id,
            p.id,
            v.size,
            (v as any).color || null,
            v.stockQuantity,
            v.sku,
            null
          ]
        });
      }
    }
    console.log(`✓ Seeded ${initialProducts.length} products, variants, and images into Turso cloud.`);
  }

  // 5. Seed Delivery Zones
  const defaultZones = [
    { id: 'zone-lagos', name: 'Lagos Fast Track', state: 'Lagos', fee: 300000, freeThreshold: 8500000, sort: 1 },
    { id: 'zone-abuja', name: 'Abuja & FCT', state: 'Abuja,FCT', fee: 450000, freeThreshold: 12000000, sort: 2 },
    { id: 'zone-rivers', name: 'Rivers & South-South', state: 'Rivers,Delta,Edo,Bayelsa,Akwa Ibom,Cross River', fee: 550000, freeThreshold: 15000000, sort: 3 },
    { id: 'zone-southwest', name: 'South West Express', state: 'Ogun,Oyo,Osun,Ondo,Ekiti', fee: 350000, freeThreshold: 10000000, sort: 4 },
    { id: 'zone-north', name: 'Northern States', state: 'Kano,Kaduna,Plateau,Katsina,Sokoto,Borno,Bauchi,Niger,Kwara,Nasarawa,Benue,Kogi,Gombe,Taraba,Yobe,Kebbi,Zamfara,Jigawa', fee: 600000, freeThreshold: 18000000, sort: 5 },
    { id: 'zone-southeast', name: 'South East', state: 'Anambra,Enugu,Imo,Abia,Ebonyi', fee: 500000, freeThreshold: 14000000, sort: 6 }
  ];

  for (const z of defaultZones) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO delivery_zones (id, zone_name, state_match, fee_kobo, free_threshold_kobo, is_active, sort_order, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      args: [z.id, z.name, z.state, z.fee, z.freeThreshold, z.sort, now]
    });
  }
  console.log('✓ Delivery zones verified.');

  // 6. Verify final count
  const finalCheck = await client.execute('SELECT COUNT(*) as count FROM products');
  console.log(`\n🎉 TURSO CLOUD DATABASE READY! Verified products count: ${finalCheck.rows[0].count}`);
}

initTurso().catch(err => {
  console.error('Initialization error:', err);
  process.exit(1);
});
