import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_EMAIL = 'adaptaresoftware@gmail.com';
const ADMIN_PASSWORD = 'admin12345';
// Token simples — gerado a partir das credenciais. Em produção, use JWT ou similar.
const ADMIN_TOKEN = Buffer.from(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`).toString('base64');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Cookie HttpOnly com validade de 8 horas
  res.setHeader(
    'Set-Cookie',
    `admin_token=${ADMIN_TOKEN}; HttpOnly; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Strict`
  );

  return res.status(200).json({ ok: true });
}
