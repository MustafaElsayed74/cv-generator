import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  const token = process.env.VITE_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    return res.status(500).json({ error: "Missing Blob Token in Environment Variables." });
  }

  if (req.method === 'GET') {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Missing username parameter." });
    
    try {
      const result = await list({ prefix: `cv_history/${username}/`, token });
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  
  if (req.method === 'POST') {
    const { username, data } = req.body;
    if (!username || !data) return res.status(400).json({ error: "Missing username or data payload." });
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `cv_history/${username}/cv_${timestamp}.json`;
      
      const result = await put(filename, JSON.stringify(data), {
        access: 'public',
        token,
        contentType: 'application/json'
      });
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  
  return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
}
