import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
      observation, // Importante: Extraindo a observação
      company, profession, workPhone,
      spouseName, spouseDob,
      dependents
    } = body || {};

    if (!cpf || !fullName) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    const formatDate = (date: string) => date && date.trim() !== '' ? date : null;

    // Helper para formatar data BR no email
    const formatBrDate = (dateStr: string | null) => {
      if (!dateStr) return '-';
      try {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      } catch { return dateStr; }
    };

    // 1. GERAR ID MANUALMENTE
    const novoIdSocio = randomUUID();

    // 2. INSERIR SÓCIO
    const textSocio = `
      INSERT INTO registros_socios 
      (
        id, 
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING id
    `;

    const fullAddress = number ? `${street}, ${number}` : street;

    const valuesSocio = [
      novoIdSocio,
      fullName,
      cpf,
      rg,
      formatDate(dob),
      email,
      whatsapp,
      street,
      fullAddress,
      neighborhood,
      city,
      company,
      profession,
      workPhone,
      spouseName,
      formatDate(spouseDob)
    ];

    const resultSocio = await db.query(textSocio, valuesSocio);
    const socioId = resultSocio.rows[0].id;

    // 3. INSERIR DEPENDENTES
    if (dependents && Array.isArray(dependents) && dependents.length > 0) {
      for (const dep of dependents) {
        if (dep.name) {
          await db.query(
            `INSERT INTO dependentes_socios 
             (socio_id, nome_dependente, data_nascimento, parentesco) 
             VALUES ($1, $2, $3, $4)`,
            [
              socioId,
              dep.name,
              formatDate(dep.dob),
              dep.relationship
            ]
          );
        }
      }
    }

    // 4. ENVIAR EMAIL (RESEND)
    try {
      // Formata lista de dependentes
      const dependentsList = (dependents && Array.isArray(dependents) && dependents.length > 0)
        ? dependents.map((d: any) => `${d.name} (${formatBrDate(d.dob)})`).join(', ')
        : 'Nenhum';

      await resend.emails.send({
        from: 'GEC Recadastramento <recadastramento@adaptaresoftware.com.br>',
        to: email,
        subject: 'Confirmação de Recadastramento 2025',
        html: `
          <h1>Olá, ${fullName}!</h1>
          <p>Recebemos seus dados com sucesso, conforme descrito abaixo:</p>
          
          <h3>Dados Completos</h3>
          <p><strong>CPF:</strong> ${cpf}</p>
          <p><strong>RG:</strong> ${rg || '-'}</p>
          <p><strong>Data de Nascimento:</strong> ${formatBrDate(dob)}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp || '-'}</p>
          <p><strong>Email:</strong> ${email}</p>
          
          <p><strong>Dados Profissionais:</strong> ${profession || '-'} - ${company || '-'}</p>
          <p><strong>Dados Cônjuge:</strong> ${spouseName || '-'}</p>
          <p><strong>Dependentes:</strong> ${dependentsList}</p>
          
          <p><strong>Logradouro:</strong> ${fullAddress}</p>
          <p><strong>Bairro:</strong> ${neighborhood || '-'}</p>
          <p><strong>Cidade:</strong> ${city || '-'}</p>
          <p><strong>Observação Endereço:</strong> ${observation || '-'}</p>

          <br>
          <p>Caso tenha alguma informação errada favor entrar em contato.</p>
          
          <p>Atenciosamente,<br>Diretoria GEC</p>
        `
      });
      console.log('Email enviado com sucesso para:', email);
    } catch (emailError: any) {
      console.error('Erro ao enviar email:', emailError);
    }

    return res.status(200).json({ message: 'Sucesso!', id: socioId });

  } catch (error: any) {
    console.error('ERRO NO BANCO:', error);
    return res.status(500).json({ error: 'Erro ao salvar', details: error.message });
  }
}