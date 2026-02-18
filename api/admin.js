// api/admin.js
import { getUsers, saveUsers, getMessages, getReports, saveReports } from './_store.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = requireAuth(req);
  if (!auth || !auth.isAdmin) return res.status(403).json({ error: 'Admin only' });

  // GET /api/admin?action=stats
  if (req.method === 'GET') {
    const { action } = req.query;

    if (action === 'stats') {
      const [users, messages, reports] = await Promise.all([getUsers(), getMessages(), getReports()]);
      return res.status(200).json({
        totalUsers: users.length,
        totalMessages: messages.length,
        onlineUsers: users.filter(u => u.online).length,
        pendingReports: reports.filter(r => !r.resolved).length
      });
    }

    if (action === 'users') {
      const users = await getUsers();
      return res.status(200).json(users); // Full data including passwords
    }

    if (action === 'reports') {
      const reports = await getReports();
      return res.status(200).json(reports);
    }

    if (action === 'messages') {
      const messages = await getMessages();
      return res.status(200).json(messages);
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  // DELETE /api/admin — delete user
  if (req.method === 'DELETE') {
    const { userId, reportId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const users = await getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    users.splice(idx, 1);
    await saveUsers(users);

    // Resolve report if provided
    if (reportId) {
      const reports = await getReports();
      const r = reports.find(rp => rp.id === reportId);
      if (r) {
        r.resolved = true;
        r.resolvedAt = new Date().toISOString();
        await saveReports(reports);
      }
    }

    return res.status(200).json({ success: true });
  }

  // POST /api/admin — resolve report without deleting
  if (req.method === 'POST') {
    const { reportId } = req.body;
    if (!reportId) return res.status(400).json({ error: 'reportId required' });

    const reports = await getReports();
    const r = reports.find(rp => rp.id === reportId);
    if (!r) return res.status(404).json({ error: 'Report not found' });
    r.resolved = true;
    r.resolvedAt = new Date().toISOString();
    await saveReports(reports);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
