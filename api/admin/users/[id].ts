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

const CORS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function setCors(res: VercelResponse) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const session = requireAdmin(req, res);
  if (!session) return;

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID obrigatório' });
  }

  const db = getPool();
  const target = await findUserById(id);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });

  if (req.method === 'PUT') {
    if (target.is_system) {
      return res.status(403).json({ error: 'O usuário principal do sistema não pode ser editado' });
    }

    const { email, password, role } = req.body || {};
    const finalRole = 'viewer';

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) return res.status(400).json({ error: 'E-mail inválido' });
      const dup = await db.query('SELECT id FROM admin_users WHERE LOWER(email) = $1 AND id <> $2 LIMIT 1', [normalizedEmail, id]);
      if (dup.rows.length > 0) {
        return res.status(409).json({ error: 'Já existe um usuário com este e-mail' });
      }
      updates.push(`email = $${i++}`);
      values.push(normalizedEmail);
    }

    if (password !== undefined && password !== '') {
      if (String(password).length < 4) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 4 caracteres' });
      }
      updates.push(`password = $${i++}`);
      values.push(password);
    }

    updates.push(`role = $${i++}`);
    values.push(finalRole);
    updates.push(`updated_at = NOW()`);

    values.push(id);
    await db.query(
      `UPDATE admin_users SET ${updates.join(', ')} WHERE id = $${i}`,
      values
    );

    const r = await db.query(
      'SELECT id, email, role, is_system, created_at, updated_at FROM admin_users WHERE id = $1',
      [id]
    );
    return res.status(200).json({ user: r.rows[0] });
  }

  if (req.method === 'DELETE') {
    if (target.is_system) {
      return res.status(403).json({ error: 'O usuário principal do sistema não pode ser excluído' });
    }
    if (target.email.toLowerCase() === session.email.toLowerCase()) {
      return res.status(403).json({ error: 'Você não pode excluir o seu próprio usuário' });
    }
    if (target.role === 'admin') {
      const admins = await countAdmins();
      if (admins <= 1) {
        return res.status(403).json({ error: 'Não é possível excluir o último admin' });
      }
    }

    await db.query('DELETE FROM admin_users WHERE id = $1', [id]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
