import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  );
  return res.status(200).json({ ok: true });
}
