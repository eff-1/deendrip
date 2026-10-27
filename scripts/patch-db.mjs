import fs from 'node:fs';

let code = fs.readFileSync('src/lib/db.ts', 'utf8');

if (!code.includes('initialProducts')) {
  code = "import { initialProducts } from './initialProducts';\n" + code;
}

const startMarker = '  const productsData = [';
const endMarker = '  ];\n\n  const insertProduct';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + '  const productsData = initialProducts;' + code.substring(endIndex + 4);
}

code = code.replace(
  'INSERT INTO product_variants (id, product_id, size, stock_quantity, sku, price_override_kobo)\n    VALUES (?, ?, ?, ?, ?, ?)',
  'INSERT INTO product_variants (id, product_id, size, color, stock_quantity, sku, price_override_kobo)\n    VALUES (?, ?, ?, ?, ?, ?, ?)'
);

code = code.replace(
  'insertVariant.run(\n        v.id,\n        p.id,\n        v.size,\n        v.stockQuantity,\n        v.sku,\n        null\n      );',
  'insertVariant.run(\n        v.id,\n        p.id,\n        v.size,\n        (v as any).color || null,\n        v.stockQuantity,\n        v.sku,\n        null\n      );'
);

fs.writeFileSync('src/lib/db.ts', code);
console.log('db.ts patched successfully');
