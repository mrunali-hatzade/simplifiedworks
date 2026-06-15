const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple hardcoded auth check
  const auth = req.headers.authorization;
  if (auth !== 'admin123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { type } = req.query;
    let query = '';

    if (type === 'contacts') {
      query = 'SELECT * FROM Contacts ORDER BY CreatedAt DESC';
    } else if (type === 'subscribers') {
      query = 'SELECT * FROM Subscribers ORDER BY SubscribedAt DESC';
    } else {
      return res.status(400).json({ error: 'Invalid type requested' });
    }

    const result = await pool.query(query);
    return res.status(200).json({ records: result.rows });
  } catch (error) {
    // If the table doesn't exist yet, return an empty array instead of failing
    if (error.code === '42P01') { 
      return res.status(200).json({ records: [] });
    }
    return res.status(500).json({ error: error.message });
  }
}
