import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.POSTGRES_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 1,
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
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão para editar registros' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID obrigatório' });

  const db = getPool();

  if (req.method === 'PUT') {
    const {
      full_name, cpf, rg, dob, email, whatsapp,
      street, address, neighborhood, city,
      empresa, cargo, telefone_trabalho,
      nome_conjuge, data_nasc_conjuge,
      dependentes
    } = req.body || {};

    const formatDate = (d: string) => d && d.trim() !== '' ? d : null;

    await db.query(
      `UPDATE registros_socios SET
        full_name = $1, cpf = $2, rg = $3, dob = $4,
        email = $5, whatsapp = $6,
        street = $7, address = $8, neighborhood = $9, city = $10,
        empresa = $11, cargo = $12, telefone_trabalho = $13,
        nome_conjuge = $14, data_nasc_conjuge = $15
       WHERE id = $16`,
      [
        full_name, cpf, rg, formatDate(dob),
        email, whatsapp,
        street, address, neighborhood, city,
        empresa, cargo, telefone_trabalho,
        nome_conjuge, formatDate(data_nasc_conjuge),
        id
      ]
    );

    await db.query('DELETE FROM dependentes_socios WHERE socio_id = $1', [id]);
    if (dependentes && Array.isArray(dependentes)) {
      for (const dep of dependentes) {
        if (dep.nome_dependente) {
          await db.query(
            `INSERT INTO dependentes_socios (socio_id, nome_dependente, data_nascimento, parentesco)
             VALUES ($1, $2, $3, $4)`,
            [id, dep.nome_dependente, formatDate(dep.data_nascimento), dep.parentesco]
          );
        }
      }
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
