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
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID obrigatório' });

  // PUT /api/admin/socio/[id] — atualiza sócio e dependentes
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

    // Reinsere dependentes: apaga os existentes e insere os novos
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
