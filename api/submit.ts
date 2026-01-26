import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- CONEXÃO COM O BANCO (INLINE) ---
const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});
// ------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const {
      nome, cpf, data_nascimento, celular, email,
      logradouro, numero, bairro, cidade, estado, cep,
      dependentes, aceite_termos
    } = req.body;

    if (!cpf || !nome) return res.status(400).json({ error: 'Nome e CPF obrigatórios' });

    // 1. Inserir Sócio
    const textSocio = `
      INSERT INTO registros_socios 
      (nome, cpf, data_nascimento, celular, email, logradouro, numero, bairro, cidade, estado, cep, aceite_termos, data_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING id
    `;
    const valuesSocio = [
      nome, cpf, data_nascimento, celular, email,
      logradouro || null, numero || null, bairro || null, cidade || null, estado || null, cep || null, aceite_termos
    ];

    const resultSocio = await db.query(textSocio, valuesSocio);
    const socioId = resultSocio.rows[0].id;

    // 2. Inserir Dependentes
    if (dependentes && Array.isArray(dependentes) && dependentes.length > 0) {
      for (const dep of dependentes) {
        if (dep.nome) {
          await db.query(
            'INSERT INTO dependentes (socio_id, nome, data_nascimento, parentesco) VALUES ($1, $2, $3, $4)',
            [socioId, dep.nome, dep.data_nascimento, dep.parentesco]
          );
        }
      }
    }

    return res.status(200).json({ message: 'Sucesso!', id: socioId });

  } catch (error: any) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
}