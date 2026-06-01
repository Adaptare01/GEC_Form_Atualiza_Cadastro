import type { VercelRequest, VercelResponse } from '@vercel/node';

const USERS = [
  { email: 'adaptaresoftware@gmail.com', password: 'admin12345', role: 'admin' },
  { email: 'nezio.ouriques@coliberte.com.br', password: 'nezio123', role: 'viewer' },
];

function makeToken(email: string, role: string) {
  return Buffer.from(`${email}:${role}`).toString('base64');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};

  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = makeToken(user.email, user.role);

  // Cookie HttpOnly com validade de 8 horas
  res.setHeader(
    'Set-Cookie',
    `admin_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Strict`
  );

  return res.status(200).json({ ok: true, role: user.role });
}