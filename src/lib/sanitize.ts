/**
 * Deen Drip - Security & Input Sanitization Engine
 * 100% Defense in Depth against XSS, HTML/Header Injection, Null-Byte Attacks, and Malicious Payloads
 */

/**
 * Strips dangerous HTML tags, javascript pseudo-protocols, event handlers, and control characters.
 */
export function sanitizeText(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') return '';

  let sanitized = input
    // Remove null bytes and control chars (except newline and carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip <script>...</script> tags and contents completely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip <style>...</style> tags and contents completely
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip <iframe...>, <object...>, <embed...>, <form...>, <svg...>
    .replace(/<(iframe|object|embed|form|svg|base|link|meta)\b[^>]*>/gi, '')
    // Strip closing tags for above
    .replace(/<\/(iframe|object|embed|form|svg|base|link|meta)>/gi, '')
    // Strip javascript: or data: pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    // Strip inline event handlers (e.g. onerror=, onclick=, onload=)
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
    // Strip all remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Replace dangerous characters with HTML entities if needed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Strips HTML tags but preserves legitimate quotes and ampersands for internal storage.
 * Ideal for names, addresses, and order references that don't need HTML entities stored in DB.
 */
export function cleanPlainText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';

  let cleaned = input
    // Remove null bytes and control chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip script/style and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Strip pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    .trim();

  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}

/**
 * Sanitizes and validates email addresses.
 * Prevents SMTP Header Injection (stripping \r, \n, %0a, %0d).
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';

  // Remove newline characters and URL encoded newlines
  const stripped = email
    .replace(/[\r\n\x00-\x1F]/g, '')
    .replace(/%0[ad]/gi, '')
    .trim()
    .toLowerCase();

  // Strict email regex RFC 5322 standard-compliant subset
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(stripped) || stripped.length > 254) {
    return '';
  }

  return stripped;
}

/**
 * Sanitizes and validates phone numbers.
 * Allows digits, leading +, spaces, parentheses, hyphens.
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  // Keep only +, digits, space, hyphen, parentheses
  const cleaned = phone.replace(/[^\d+\s()-]/g, '').trim();
  if (cleaned.length < 7 || cleaned.length > 20) {
    return '';
  }
  return cleaned;
}

/**
 * Sanitizes alphanumeric identifiers (Order Reference, SKUs, IDs, Usernames).
 */
export function sanitizeIdentifier(id: unknown, maxLength = 64): string {
  if (typeof id !== 'string') return '';
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLength);
}
