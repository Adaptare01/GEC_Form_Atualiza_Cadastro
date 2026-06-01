import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const ADMIN_TOKEN = Buffer.from('adaptaresoftware@gmail.com:admin12345').toString('base64');

function isAuthenticated(req: VercelRequest): boolean {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  return cookies['admin_token'] === ADMIN_TOKEN;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // GET /api/admin/socios — lista todos com dependentes
  if (req.method === 'GET') {
    const { nome_socio, nome_dependente } = req.query;

    let whereClauses: string[] = [];
    let params: any[] = [];
    let paramIdx = 1;

    if (nome_socio) {
      whereClauses.push(`LOWER(s.full_name) LIKE LOWER($${paramIdx})`);
      params.push(`%${nome_socio}%`);
      paramIdx++;
    }

    if (nome_dependente) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM dependentes_socios d2
        WHERE d2.socio_id = s.id
        AND LOWER(d2.nome_dependente) LIKE LOWER($${paramIdx})
      )`);
      params.push(`%${nome_dependente}%`);
      paramIdx++;
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sociosResult = await db.query(
      `SELECT 
        s.id, s.full_name, s.cpf, s.rg, s.dob, s.email, s.whatsapp,
        s.street, s.address, s.neighborhood, s.city,
        s.empresa, s.cargo, s.telefone_trabalho,
        s.nome_conjuge, s.data_nasc_conjuge, s.created_at
       FROM registros_socios s
       ${whereSQL}
       ORDER BY s.full_name ASC`,
      params
    );

    const socios = sociosResult.rows;

    if (socios.length === 0) {
      return res.status(200).json({ socios: [] });
    }

    const socioIds = socios.map(s => s.id);
    const depResult = await db.query(
      `SELECT id, socio_id, nome_dependente, data_nascimento, parentesco
       FROM dependentes_socios
       WHERE socio_id = ANY($1)
       ORDER BY nome_dependente ASC`,
      [socioIds]
    );

    const depMap: Record<string, any[]> = {};
    for (const dep of depResult.rows) {
      if (!depMap[dep.socio_id]) depMap[dep.socio_id] = [];
      depMap[dep.socio_id].push(dep);
    }

    const result = socios.map(s => ({
      ...s,
      dependentes: depMap[s.id] || []
    }));

    return res.status(200).json({ socios: result });
  }

  // DELETE /api/admin/socios?id=xxx — exclui sócio e dependentes
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID obrigatório' });

    await db.query('DELETE FROM dependentes_socios WHERE socio_id = $1', [id]);
    await db.query('DELETE FROM registros_socios WHERE id = $1', [id]);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
