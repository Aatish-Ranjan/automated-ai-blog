import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the admin session cookie
  res.setHeader('Set-Cookie', [
    'admin-session=; HttpOnly; Path=/; Max-Age=0'
  ]);

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
