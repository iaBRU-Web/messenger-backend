// api/users.js
import { getUsers } from './_store.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { q } = req.query;
  const users = await getUsers();

  let result = users
    .filter(u => u.id !== auth.id)
    .map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      online: u.online,
      lastSeen: u.lastSeen
    }));

  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(u =>
      u.username.includes(lower) || u.displayName.toLowerCase().includes(lower)
    );
  }

  return res.status(200).json(result);
}
