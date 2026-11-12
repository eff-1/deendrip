import { createClient, type Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

let tursoClientInstance: Client | null = null;

export function getTursoClient(): Client | null {
  if (tursoClientInstance) return tursoClientInstance;

  let url = process.env.TURSO_DATABASE_URL;
  let authToken = process.env.TURSO_AUTH_TOKEN;

  // Fallback to read from .env.local if process environment was initialized prior to file creation
  if (!url || !authToken) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('TURSO_DATABASE_URL=')) {
            url = trimmed.slice('TURSO_DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
          }
          if (trimmed.startsWith('TURSO_AUTH_TOKEN=')) {
            authToken = trimmed.slice('TURSO_AUTH_TOKEN='.length).trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  if (url && authToken) {
    tursoClientInstance = createClient({ url, authToken });
    return tursoClientInstance;
  }

  return null;
}
