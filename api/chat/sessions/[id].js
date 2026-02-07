const sessions = new Map();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const idMatch = url.match(/^\/api\/chat\/sessions\/([^/]+)$/);

  if (!idMatch) {
    return res.status(404).json({ error: 'Not found' });
  }

  const id = idMatch[1];

  if (method === 'GET') {
    const session = sessions.get(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ id, ...session });
  }

  if (method === 'DELETE') {
    sessions.delete(id);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
