// api/report.js
import { getReports, saveReports } from './_blob.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { targetId, targetUsername, reason, type } = req.body;
  if (!targetId || !reason) return res.status(400).json({ error: 'targetId and reason required' });

  const reports = await getReports();
  const report = {
    id: Date.now().toString(),
    reportedBy: auth.id,
    reportedByUsername: auth.username,
    targetId,
    targetUsername: targetUsername || targetId,
    reason,
    type: type || 'user', // 'user' or 'delete_account'
    createdAt: new Date().toISOString(),
    resolved: false
  };

  reports.push(report);
  await saveReports(reports);

  return res.status(201).json({ success: true, report });
}
