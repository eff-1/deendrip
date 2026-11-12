import { createClient, type Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

let tursoClientInstance: Client | null = null;

const DEFAULT_TURSO_URL = 'libsql://deendrip-eff-1.aws-eu-central-1.turso.io';
const DEFAULT_TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ0MTM1MDQsImlkIjoiMDFhMWNiNjAtNTgwMS03YzVmLTlhNjMtYTAxODIxMWQ1NWE5Iiwia2lkIjoiZV9WdDlKeHpKUDZDYnNSWTVYZDlKOEs2aldyZTd1aFh4OGV1dm8yVHBXTSIsInJpZCI6ImU3YjYwMDljLTBkZDItNGUyNC1hYzhlLWMzYzRjZDY3MjU4YyJ9.QulP54BY69IHdESRsb6_jNH3gU0vF_Cqb2-RTq--hT16r21sJqMomXvxPuj9xLsMNiEXL4hArTs7PU1cULg4Ag';

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

  // Final fallback to project-configured Turso Cloud credentials
  url = url || DEFAULT_TURSO_URL;
  authToken = authToken || DEFAULT_TURSO_AUTH_TOKEN;

  if (url && authToken) {
    tursoClientInstance = createClient({ url, authToken });
    return tursoClientInstance;
  }

  return null;
}

