import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: false
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { }
    }

    console.log('Dados recebidos:', body);

    const {
      fullName, cpf, rg, dob,
      email, whatsapp,
      street, number, neighborhood, city,
      company, profession, workPhone,
      spouseName, spouseDob,
      dependents
    } = body || {};

    if (!cpf || !fullName) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    // Função auxiliar para evitar erro de data vazia ("") no Postgres
    const formatDate = (date: string) => date && date.trim() !== '' ? date : null;

    // 1. INSERIR SÓCIO (Tabela: registros_socios)
    const textSocio = `
      INSERT INTO registros_socios 
      (
        full_name, 
        cpf, 
        rg, 
        dob, 
        email, 
        whatsapp, 
        street, 
        address,
        neighborhood, 
        city, 
        empresa, 
        cargo, 
        telefone_trabalho, 
        nome_conjuge, 
        data_nasc_conjuge, 
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      RETURNING id
    `;

    // Montamos o endereço completo (Rua + Número) para o campo 'address'
    const fullAddress = number ? `${street}, ${number}` : street;

    const valuesSocio = [
      fullName,               // full_name
      cpf,                    // cpf
      rg,                     // rg
      formatDate(dob),        // dob
      email,                  // email
      whatsapp,               // whatsapp
      street,                 // street
      fullAddress,            // address
      neighborhood,           // neighborhood
      city,                   // city
      company,                // empresa
      profession,             // cargo
      workPhone,              // telefone_trabalho
      spouseName,             // nome_conjuge
      formatDate(spouseDob)   // data_nasc_conjuge
    ];

    const resultSocio = await db.query(textSocio, valuesSocio);
    const socioId = resultSocio.rows[0].id;

    // 2. INSERIR DEPENDENTES (Tabela: dependentes_socios)
    if (dependents && Array.isArray(dependents) && dependentes.length > 0) {
      for (const dep of dependentes) {
        if (dep.name) {
          await db.query(
            `INSERT INTO dependentes_socios 
             (socio_id, nome_dependente, data_nascimento, parentesco) 
             VALUES ($1, $2, $3, $4)`,
            [
              socioId,
              dep.name,            // Front: name -> Banco: nome_dependente
              formatDate(dep.dob), // Front: dob -> Banco: data_nascimento
              dep.relationship     // Front: relationship -> Banco: parentesco
            ]
          );
        }
      }
    }

    return res.status(200).json({ message: 'Sucesso!', id: socioId });

  } catch (error: any) {
    console.error('ERRO NO BANCO:', error);
    return res.status(500).json({ error: 'Erro ao salvar', details: error.message });
  }
}