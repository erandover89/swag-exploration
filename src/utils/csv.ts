// Minimal quoted-field-aware CSV parsing for the Users tab import.

/** Parse CSV text into rows of fields. Handles quoted fields, escaped quotes, CRLF, and a leading BOM. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some(f => f.trim() !== '')) rows.push(row);
  return rows;
}

export interface CsvUserRow {
  name: string;
  email: string;
  role: string;
  department?: string;
  discountPct?: number;
  isAdmin: boolean;
  valid: boolean;
  problem?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Map parsed CSV rows to user records using a case-insensitive header row.
 * Recognized headers: name, email, role, department, discount, admin — extra columns ignored.
 */
export function csvToUsers(rows: string[][]): CsvUserRow[] {
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim().toLowerCase());
  const col = (...names: string[]) => header.findIndex(h => names.some(n => h === n || h.startsWith(n)));
  const iName = col('name', 'full name');
  const iEmail = col('email');
  const iRole = col('role', 'title');
  const iDept = col('department', 'dept', 'team');
  const iDiscount = col('discount');
  const iAdmin = col('admin', 'is admin');

  return rows.slice(1).map(r => {
    const get = (i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');
    const email = get(iEmail).toLowerCase();
    const discountRaw = get(iDiscount).replace('%', '');
    const discountPct = discountRaw ? Number(discountRaw) : undefined;
    const valid = EMAIL_RE.test(email);
    return {
      name: get(iName) || email.split('@')[0],
      email,
      role: get(iRole) || 'Member',
      department: get(iDept) || undefined,
      discountPct: discountPct != null && !Number.isNaN(discountPct) && discountPct > 0 ? discountPct : undefined,
      isAdmin: /^(true|yes|y|1|admin)$/i.test(get(iAdmin)),
      valid,
      problem: valid ? undefined : 'Invalid email',
    };
  });
}

export const SAMPLE_USERS_CSV = [
  'name,email,role,department,discount,admin',
  'Dana Alvarez,d.alvarez@example.org,Coach,U12,15%,yes',
  'Karen Mitchell,k.mitchell@example.org,Team Manager,U12,10%,no',
  'Priya Raman,priya.raman@example.com,Parent,U10,,no',
].join('\n');
