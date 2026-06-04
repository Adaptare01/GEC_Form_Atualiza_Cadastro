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

interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'viewer';
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

interface Session {
  email: string;
  role: 'admin' | 'viewer';
}

async function findUserByEmailPassword(email: string, password: string): Promise<AdminUser | null> {
  const r = await getPool().query<AdminUser>(
    'SELECT id, email, password, role, is_system, created_at, updated_at FROM admin_users WHERE email = $1 AND password = $2 LIMIT 1',
    [email, password]
  );
  return r.rows[0] || null;
}

async function findUserById(id: string): Promise<AdminUser | null> {
  const r = await getPool().query<AdminUser>(
    'SELECT id, email, password, role, is_system, created_at, updated_at FROM admin_users WHERE id = $1 LIMIT 1',
    [id]
  );
  return r.rows[0] || null;
}

async function countAdmins(): Promise<number> {
  const r = await getPool().query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM admin_users WHERE role = 'admin'"
  );
  return parseInt(r.rows[0].count, 10);
}

function getSession(req: VercelRequest): Session | null {
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
    return { email, role };
  } catch {
    return null;
  }
}

function makeToken(email: string, role: string): string {
  return Buffer.from(`${email}:${role}`).toString('base64');
}

function requireAdmin(req: VercelRequest, res: VercelResponse): Session | null {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const user = await findUserByEmailPassword(String(email).trim().toLowerCase(), String(password));
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = makeToken(user.email, user.role);

  res.setHeader(
    'Set-Cookie',
    `admin_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Strict`
  );

  return res.status(200).json({ ok: true, role: user.role });
}
