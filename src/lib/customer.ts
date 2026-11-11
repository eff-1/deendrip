import { getDb } from './db';
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
