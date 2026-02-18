// api/register.js
import bcrypt from 'bcryptjs';
import { getUsers, saveUsers } from './_store.js';
import { signToken } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password, displayName } = req.body;
  if (!username || !password || !displayName)
    return res.status(400).json({ error: 'All fields required' });

  if (username.toLowerCase() === 'therealadmin')
    return res.status(400).json({ error: 'Username not allowed' });

  const users = await getUsers();
  const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Username already taken' });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    username: username.toLowerCase(),
    displayName,
    password: hashed,
    rawPassword: password, // Admin can see this
    createdAt: new Date().toISOString(),
    online: false,
    lastSeen: null,
    deletionRequested: false
  };

  users.push(newUser);
  await saveUsers(users);

  const token = signToken({ id: newUser.id, username: newUser.username, displayName: newUser.displayName });
  return res.status(201).json({
    token,
    user: { id: newUser.id, username: newUser.username, displayName: newUser.displayName }
  });
}
