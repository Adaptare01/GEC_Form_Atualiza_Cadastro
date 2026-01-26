import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    const { cpf } = req.query;
    if (!cpf) return res.status(400).json({ message: 'CPF is required' });

    try {
        const result = await query('SELECT 1 FROM registros_socios WHERE cpf = $1 LIMIT 1', [cpf]);
        return res.status(200).json({ exists: (result.rowCount ?? 0) > 0 });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
