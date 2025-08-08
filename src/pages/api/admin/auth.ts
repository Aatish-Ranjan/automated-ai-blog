import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'smartiyo2025';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    // Set session cookie (simple implementation)
    res.setHeader('Set-Cookie', [
      'admin-session=authenticated; HttpOnly; Path=/; Max-Age=86400' // 24 hours
    ]);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Authentication successful' 
    });
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid password' 
    });
  }
}
