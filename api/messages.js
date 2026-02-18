// api/messages.js
import { getMessages, saveMessages } from './_blob.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { with: withUser } = req.query;
    if (!withUser) return res.status(400).json({ error: 'Missing ?with param' });

    const messages = await getMessages();
    const thread = messages.filter(m =>
      (m.from === auth.id && m.to === withUser) ||
      (m.from === withUser && m.to === auth.id)
    );

    return res.status(200).json(thread);
  }

  if (req.method === 'POST') {
    const { to, text } = req.body;
    if (!to || !text) return res.status(400).json({ error: 'to and text required' });

    const messages = await getMessages();
    const msg = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      from: auth.id,
      fromDisplay: auth.displayName || auth.username,
      to,
      text,
      sentAt: new Date().toISOString(),
      read: false
    };

    messages.push(msg);
    await saveMessages(messages);

    return res.status(201).json(msg);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
