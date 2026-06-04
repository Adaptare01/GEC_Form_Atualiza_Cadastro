import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.POSTGRES_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  }
  return _pool;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'viewer';
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  is_system: boolean;
}

export async function findUserByEmailPassword(email: string, password: string): Promise<AdminUser | null> {
  const r = await getPool().query<AdminUser>(
    'SELECT id, email, password, role, is_system, created_at, updated_at FROM admin_users WHERE email = $1 AND password = $2 LIMIT 1',
    [email, password]
  );
  return r.rows[0] || null;
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const r = await getPool().query<AdminUser>(
    'SELECT id, email, password, role, is_system, created_at, updated_at FROM admin_users WHERE email = $1 LIMIT 1',
    [email]
  );
  return r.rows[0] || null;
}

export async function findUserById(id: string): Promise<AdminUser | null> {
  const r = await getPool().query<AdminUser>(
    'SELECT id, email, password, role, is_system, created_at, updated_at FROM admin_users WHERE id = $1 LIMIT 1',
    [id]
  );
  return r.rows[0] || null;
}

export async function countAdmins(): Promise<number> {
  const r = await getPool().query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM admin_users WHERE role = 'admin'"
  );
  return parseInt(r.rows[0].count, 10);
}

export function getSession(req: VercelRequest): Session | null {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  const token = cookies['admin_token'];
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, role] = decoded.split(':');
    if (!email || (role !== 'admin' && role !== 'viewer')) return null;
    return { id: '', email, role, is_system: false };
  } catch {
    return null;
  }
}

export function makeToken(email: string, role: string): string {
  return Buffer.from(`${email}:${role}`).toString('base64');
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): Session | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Não autorizado' });
    return null;
  }
  if (session.role !== 'admin') {
    res.status(403).json({ error: 'Sem permissão' });
    return null;
  }
  return session;
}

export { getPool };
