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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    const { cpf } = req.query;
    if (!cpf) return res.status(400).json({ error: 'CPF obrigatório' });

    try {
        const result = await db.query('SELECT id FROM registros_socios WHERE cpf = $1', [cpf]);
        return res.status(200).json({ exists: result.rows.length > 0 });
    } catch (error: any) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro no banco' });
    }
}