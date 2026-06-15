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
    const { name, feedback } = req.body;
    
    // Create table if it doesn't exist
    await pool.query(`CREATE TABLE IF NOT EXISTS Feedback (
      id SERIAL PRIMARY KEY,
      Name varchar(255),
      Feedback text,
      SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const result = await pool.query(
      `INSERT INTO Feedback (Name, Feedback)
       VALUES ($1, $2)`,
      [name, feedback]
    );

    // Send Email using Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['simplifiedworks.official@gmail.com'],
        subject: `New Client Feedback from ${name}`,
        html: `
          <h2>New Feedback Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Feedback:</strong><br/> ${feedback}</p>
        `
      });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
