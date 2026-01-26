import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Conexão com o banco (SSL desligado para IP direto)
const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: false
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    // 1. Recebe os dados
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { }
    }

    console.log('Dados recebidos (Raw):', body); // Log para conferência

    // 2. TRADUÇÃO: Mapeia do Inglês (Site) para Português (Banco)
    const {
      fullName,       // Site manda fullName
      cpf,            // Igual
      dob,            // Site manda dob (Date of Birth)
      whatsapp,       // Site manda whatsapp
      email,          // Igual
      street,         // Site manda street
      number,         // Site manda number
      neighborhood,   // Site manda neighborhood
      city,           // Site manda city
      state,          // Site manda state
      zipCode,        // Site manda zipCode
      dependents,     // Array de dependentes
      acceptedTerms   // Site manda acceptedTerms
    } = body || {};

    // 3. Validação (Agora verifica se 'fullName' chegou, pois ele vira o 'nome')
    if (!cpf || !fullName) {
      console.log('Faltou nome ou CPF. Recebido:', { fullName, cpf });
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    // 4. Inserir no Banco (Usando os nomes traduzidos)
    const textSocio = `
      INSERT INTO registros_socios 
      (nome, cpf, data_nascimento, celular, email, logradouro, numero, bairro, cidade, estado, cep, aceite_termos, data_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING id
    `;

    const valuesSocio = [
      fullName,               // $1: Vai para coluna 'nome'
      cpf,                    // $2: cpf
      dob,                    // $3: Vai para 'data_nascimento'
      whatsapp,               // $4: Vai para 'celular'
      email,                  // $5: email
      street || null,         // $6: Vai para 'logradouro'
      number || null,         // $7: Vai para 'numero'
      neighborhood || null,   // $8: Vai para 'bairro'
      city || null,           // $9: Vai para 'cidade'
      state || null,          // $10: Vai para 'estado'
      zipCode || null,        // $11: Vai para 'cep'
      acceptedTerms || true   // $12: aceite
    ];

    const resultSocio = await db.query(textSocio, valuesSocio);
    const socioId = resultSocio.rows[0].id;

    // 5. Inserir Dependentes (Traduzindo campos de dentro do array)
    if (dependents && Array.isArray(dependents) && dependentes.length > 0) {
      for (const dep of dependentes) {
        // O site manda: name, dob, relationship
        if (dep.name) {
          await db.query(
            'INSERT INTO dependentes (socio_id, nome, data_nascimento, parentesco) VALUES ($1, $2, $3, $4)',
            [
              socioId,
              dep.name,          // Site: name -> Banco: nome
              dep.dob,           // Site: dob -> Banco: data_nascimento
              dep.relationship   // Site: relationship -> Banco: parentesco
            ]
          );
        }
      }
    }

    return res.status(200).json({ message: 'Sucesso!', id: socioId });

  } catch (error: any) {
    console.error('ERRO CRÍTICO NO BANCO:', error);
    return res.status(500).json({ error: 'Erro ao salvar no banco', details: error.message });
  }
}