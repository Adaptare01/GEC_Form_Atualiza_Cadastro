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
    // 1. Recebe os dados (pode vir como string ou objeto)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { }
    }

    // 2. TRADUÇÃO: Mapeia os campos do Front (Inglês) para o Banco (Português)
    // Os nomes à esquerda são o que vem do seu print (Payload)
    const {
      fullName,       // Front: fullName -> Banco: nome
      cpf,            // Igual
      dob,            // Front: dob -> Banco: data_nascimento
      whatsapp,       // Front: whatsapp -> Banco: celular
      email,          // Igual
      street,         // Front: street -> Banco: logradouro
      number,         // Front: number -> Banco: numero
      neighborhood,   // Front: neighborhood -> Banco: bairro
      city,           // Front: city -> Banco: cidade
      state,          // Front: state -> Banco: estado
      zipCode,        // Front: zipCode -> Banco: cep
      dependents,     // Array de dependentes
      acceptedTerms   // Front: acceptedTerms -> Banco: aceite_termos (chute educado, ajustamos se falhar)
    } = body || {};

    // 3. Validação usando os nomes traduzidos
    if (!cpf || !fullName) {
      console.log('ERRO DE DADOS:', body); // Mantivemos o log para segurança
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    // 4. Inserir Sócio Principal
    const textSocio = `
      INSERT INTO registros_socios 
      (nome, cpf, data_nascimento, celular, email, logradouro, numero, bairro, cidade, estado, cep, aceite_termos, data_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING id
    `;

    const valuesSocio = [
      fullName,               // $1: nome
      cpf,                    // $2: cpf
      dob,                    // $3: data_nascimento
      whatsapp,               // $4: celular
      email,                  // $5: email
      street || null,         // $6: logradouro
      number || null,         // $7: numero
      neighborhood || null,   // $8: bairro
      city || null,           // $9: cidade
      state || null,          // $10: estado
      zipCode || null,        // $11: cep
      acceptedTerms || true   // $12: aceite (assume true se vier vazio)
    ];

    const resultSocio = await db.query(textSocio, valuesSocio);
    const socioId = resultSocio.rows[0].id;

    // 5. Inserir Dependentes (Traduzindo também)
    if (dependents && Array.isArray(dependents) && dependentes.length > 0) {
      for (const dep of dependentes) {
        // O front manda: { name: "...", dob: "...", relationship: "..." }
        if (dep.name) {
          await db.query(
            'INSERT INTO dependentes (socio_id, nome, data_nascimento, parentesco) VALUES ($1, $2, $3, $4)',
            [
              socioId,
              dep.name,          // Front: name
              dep.dob,           // Front: dob
              dep.relationship   // Front: relationship
            ]
          );
        }
      }
    }

    return res.status(200).json({ message: 'Sucesso!', id: socioId });

  } catch (error: any) {
    console.error('ERRO NO BANCO:', error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
}