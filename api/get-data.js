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
      let contactsCount = 0, quotesCount = 0, subsCount = 0, feedbackCount = 0;
      
      try {
        const contactsRes = await pool.query("SELECT COUNT(*) FROM Contacts WHERE LeadType = 'Contact Us'");
        contactsCount = parseInt(contactsRes.rows[0].count);
      } catch (e) { /* might not exist or missing column */ }

      try {
        const quotesRes = await pool.query("SELECT COUNT(*) FROM Contacts WHERE LeadType = 'Free Quote'");
        quotesCount = parseInt(quotesRes.rows[0].count);
      } catch (e) { }

      try {
        const subsRes = await pool.query("SELECT COUNT(*) FROM Subscribers");
        subsCount = parseInt(subsRes.rows[0].count);
      } catch (e) { }

      try {
        const feedRes = await pool.query("SELECT COUNT(*) FROM Feedback");
        feedbackCount = parseInt(feedRes.rows[0].count);
      } catch (e) { }

      return res.status(200).json({
        overview: {
          contacts: contactsCount,
          quotes: quotesCount,
          subscribers: subsCount,
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

    try {
      const result = await pool.query(query);
      return res.status(200).json({ records: result.rows });
    } catch (e) {
      if (e.code === '42P01' || e.code === '42703') { 
        // Table or column doesn't exist yet
        return res.status(200).json({ records: [] });
      }
      throw e; // rethrow other errors
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
