// api/login.js
import bcrypt from 'bcryptjs';
import { getUsers, saveUsers } from './_store.js';
import { signToken } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  // Admin login
  if (username === 'THErealadmin' && password === 'BRUno-2026') {
    const token = signToken({ id: 'admin', username: 'THErealadmin', isAdmin: true });
    return res.status(200).json({ token, user: { id: 'admin', username: 'THErealadmin', isAdmin: true } });
  }

  const users = await getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  // Mark online
  user.online = true;
  user.lastSeen = new Date().toISOString();
  await saveUsers(users);

  const token = signToken({ id: user.id, username: user.username, displayName: user.displayName });
  return res.status(200).json({
    token,
    user: { id: user.id, username: user.username, displayName: user.displayName }
  });
}
