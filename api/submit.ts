import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const data = req.body;

    try {
        const text = `
      INSERT INTO registros_socios (
        full_name, cpf, rg, dob, email, whatsapp, 
        address, city, neighborhood, street, address_obs,
        empresa, cargo, telefone_trabalho,
        nome_conjuge, data_nasc_conjuge, cpf_conjuge,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, $10, $11, 
        $12, $13, $14, 
        $15, $16, $17, 
        NOW()
      )
      RETURNING id
    `;

        // Mapeando os dados do formulário para o banco
        const values = [
            data.fullName,            // full_name
            data.cpf,                 // cpf
            data.rg,                  // rg
            data.dob || null,         // dob (Data de Nascimento)
            data.email,               // email
            data.whatsapp || data.phone, // whatsapp
            data.address || null,     // address (Ainda não existe no frontend, mandando null)
            data.city,                // city
            data.neighborhood,        // neighborhood
            data.street,              // street
            data.observation,          // address_obs (Corrigido: Frontend usa 'observation', SQL espera 'address_obs')
            data.company,             // empresa
            data.profession,          // cargo (Corrigido: Frontend usa 'profession', SQL espera 'cargo')
            data.workPhone,           // telefone_trabalho
            data.spouseName,          // nome_conjuge
            data.spouseDob || null,   // data_nasc_conjuge
            data.spouseCpf || null,   // cpf_conjuge (Ainda não existe no frontend, mandando null)
        ];

        const result = await query(text, values);
        return res.status(200).json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Erro ao salvar no banco:', error);
        return res.status(500).json({ message: 'Error saving data', error: String(error) });
    }
}
