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

    if (type === 'overview') {
      const contactsRes = await pool.query("SELECT COUNT(*) FROM Contacts WHERE LeadType = 'Contact Us'");
      const quotesRes = await pool.query("SELECT COUNT(*) FROM Contacts WHERE LeadType = 'Free Quote'");
      const subsRes = await pool.query("SELECT COUNT(*) FROM Subscribers");
      let feedbackCount = 0;
      try {
        const feedRes = await pool.query("SELECT COUNT(*) FROM Feedback");
        feedbackCount = parseInt(feedRes.rows[0].count);
      } catch (e) { /* table doesn't exist yet */ }

      return res.status(200).json({
        overview: {
          contacts: parseInt(contactsRes.rows[0].count),
          quotes: parseInt(quotesRes.rows[0].count),
          subscribers: parseInt(subsRes.rows[0].count),
          feedback: feedbackCount
        }
      });
    }

    let query = '';
    if (type === 'contacts') {
      query = "SELECT * FROM Contacts WHERE LeadType = 'Contact Us' ORDER BY CreatedAt DESC";
    } else if (type === 'quotes') {
      query = "SELECT * FROM Contacts WHERE LeadType = 'Free Quote' ORDER BY CreatedAt DESC";
    } else if (type === 'subscribers') {
      query = "SELECT * FROM Subscribers ORDER BY SubscribedAt DESC";
    } else if (type === 'feedback') {
      query = "SELECT * FROM Feedback ORDER BY SubmittedAt DESC";
    } else {
      return res.status(400).json({ error: 'Invalid type requested' });
    }

    const result = await pool.query(query);
    return res.status(200).json({ records: result.rows });
  } catch (error) {
    if (error.code === '42P01') { 
      return res.status(200).json({ records: [] });
    }
    return res.status(500).json({ error: error.message });
  }
}
