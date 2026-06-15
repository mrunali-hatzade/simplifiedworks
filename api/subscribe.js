const { Resend } = require('resend');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    // Create table if it doesn't exist
    await pool.query(`CREATE TABLE IF NOT EXISTS Subscribers (
      id SERIAL PRIMARY KEY,
      Email varchar(255) UNIQUE,
      SubscribedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const result = await pool.query(
      `INSERT INTO Subscribers (Email)
       VALUES ($1)
       ON CONFLICT (Email) DO NOTHING`,
      [email]
    );

    // Send Email using Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['simplifiedworks.official@gmail.com'],
        subject: `New Newsletter Subscriber!`,
        html: `<p>Awesome! You have a new subscriber: <strong>${email}</strong></p>`
      });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
