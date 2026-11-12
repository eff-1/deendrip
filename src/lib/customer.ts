import { getDb } from './db';
import { getTursoClient } from './turso';
import { hashPassword, verifyPassword } from './auth';
import type { Customer } from './types';

interface CustomerRow {
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

export async function createCustomer(data: {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  password: string;
}): Promise<Customer> {
  const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const { hash, salt } = hashPassword(data.password);
  const cleanUsername = data.username.trim().toLowerCase();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.fullName.trim();
  const cleanPhone = data.phone.trim();
  const cleanAddress = data.streetAddress.trim();
  const cleanCity = data.city.trim();
  const cleanState = data.state.trim();

  const turso = getTursoClient();
  if (turso) {
    await turso.execute({
      sql: `INSERT INTO customers (id, username, full_name, email, phone, street_address, city, state, password_hash, salt, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        cleanUsername,
        cleanName,
        cleanEmail,
        cleanPhone,
        cleanAddress,
        cleanCity,
        cleanState,
        hash,
        salt,
        now,
        now,
      ],
    });
  } else {
    const db = getDb();
    db.prepare(`
      INSERT INTO customers (id, username, full_name, email, phone, street_address, city, state, password_hash, salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cleanUsername,
      cleanName,
      cleanEmail,
      cleanPhone,
      cleanAddress,
      cleanCity,
      cleanState,
      hash,
      salt,
      now,
      now
    );
  }

  return {
    id,
    username: cleanUsername,
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    streetAddress: cleanAddress,
    city: cleanCity,
    state: cleanState,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({
      sql: 'SELECT * FROM customers WHERE id = ?',
      args: [id],
    });
    if (res.rows.length === 0) return null;
    return rowToCustomer(res.rows[0] as unknown as CustomerRow);
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const clean = email.trim().toLowerCase();
  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({
      sql: 'SELECT * FROM customers WHERE LOWER(email) = LOWER(?)',
      args: [clean],
    });
    if (res.rows.length === 0) return null;
    return rowToCustomer(res.rows[0] as unknown as CustomerRow);
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM customers WHERE LOWER(email) = LOWER(?)').get(clean) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export async function getCustomerByUsername(username: string): Promise<Customer | null> {
  const clean = username.trim().toLowerCase();
  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({
      sql: 'SELECT * FROM customers WHERE LOWER(username) = LOWER(?)',
      args: [clean],
    });
    if (res.rows.length === 0) return null;
    return rowToCustomer(res.rows[0] as unknown as CustomerRow);
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM customers WHERE LOWER(username) = LOWER(?)').get(clean) as CustomerRow | undefined;
  return row ? rowToCustomer(row) : null;
}

export async function verifyCustomerLogin(identifier: string, password: string): Promise<Customer | null> {
  const clean = identifier.trim().toLowerCase();
  let row: CustomerRow | undefined;

  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({
      sql: 'SELECT * FROM customers WHERE LOWER(email) = ? OR LOWER(username) = ?',
      args: [clean, clean],
    });
    if (res.rows.length > 0) {
      row = res.rows[0] as unknown as CustomerRow;
    }
  } else {
    const db = getDb();
    row = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ? OR LOWER(username) = ?').get(clean, clean) as CustomerRow | undefined;
  }

  if (!row) return null;
  const isValid = verifyPassword(password, row.password_hash, row.salt);
  if (!isValid) return null;
  return rowToCustomer(row);
}

export async function updateCustomerAddress(
  id: string,
  address: { streetAddress: string; city: string; state: string; phone?: string }
): Promise<boolean> {
  const now = new Date().toISOString();
  const turso = getTursoClient();
  if (turso) {
    const res = await turso.execute({
      sql: `UPDATE customers
            SET street_address = ?, city = ?, state = ?, phone = COALESCE(?, phone), updated_at = ?
            WHERE id = ?`,
      args: [
        address.streetAddress.trim(),
        address.city.trim(),
        address.state.trim(),
        address.phone?.trim() ?? null,
        now,
        id,
      ],
    });
    return res.rowsAffected > 0;
  }

  const db = getDb();
  const res = db.prepare(`
    UPDATE customers
    SET street_address = ?, city = ?, state = ?, phone = COALESCE(?, phone), updated_at = ?
    WHERE id = ?
  `).run(
    address.streetAddress.trim(),
    address.city.trim(),
    address.state.trim(),
    address.phone?.trim() ?? null,
    now,
    id
  );
  return res.changes > 0;
}
