import { getPool, requireAdmin } from '../lib/auth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

  const db = getPool();

  if (req.method === 'GET') {
    const r = await db.query(
      `SELECT id, email, role, is_system, created_at, updated_at
       FROM admin_users
       ORDER BY created_at ASC`
    );
    return res.status(200).json({ users: r.rows });
  }

  if (req.method === 'POST') {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }
    if (String(password).length < 4) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 4 caracteres' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const finalRole = 'viewer';

    const exists = await db.query('SELECT id FROM admin_users WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Já existe um usuário com este e-mail' });
    }

    const inserted = await db.query(
      `INSERT INTO admin_users (email, password, role, is_system)
       VALUES ($1, $2, $3, false)
       RETURNING id, email, role, is_system, created_at, updated_at`,
      [normalizedEmail, password, finalRole]
    );

    return res.status(201).json({ user: inserted.rows[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
