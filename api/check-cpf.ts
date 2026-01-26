import { db } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { cpf } = req.query;

    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    try {
        // Verifica se o CPF já existe no banco
        // Note o uso de "db.query" aqui também
        const result = await db.query('SELECT id FROM registros_socios WHERE cpf = $1', [cpf]);

        // Retorna true se encontrou alguma linha, false se não encontrou
        return res.status(200).json({
            exists: result.rows.length > 0
        });

    } catch (error: any) {
        console.error('Erro ao verificar CPF:', error);
        return res.status(500).json({ error: 'Erro ao consultar banco de dados' });
    }
}