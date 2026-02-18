// api/request-delete.js
import { getUsers, saveUsers, getReports, saveReports } from './_blob.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Reason required' });

  const users = await getUsers();
  const user = users.find(u => u.id === auth.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.deletionRequested = true;
  user.deletionReason = reason;
  await saveUsers(users);

  const reports = await getReports();
  reports.push({
    id: Date.now().toString(),
    type: 'delete_account',
    reportedBy: auth.id,
    reportedByUsername: auth.username,
    targetId: auth.id,
    targetUsername: auth.username,
    reason,
    createdAt: new Date().toISOString(),
    resolved: false
  });
  await saveReports(reports);

  return res.status(200).json({ success: true });
}
