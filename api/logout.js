// api/logout.js
import { getUsers, saveUsers } from './_blob.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const users = await getUsers();
  const user = users.find(u => u.id === auth.id);
  if (user) {
    user.online = false;
    user.lastSeen = new Date().toISOString();
    await saveUsers(users);
  }

  return res.status(200).json({ success: true });
}
