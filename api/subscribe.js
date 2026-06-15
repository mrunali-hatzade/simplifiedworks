import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    // Create table if it doesn't exist
    await sql`CREATE TABLE IF NOT EXISTS Subscribers (
      id SERIAL PRIMARY KEY,
      Email varchar(255) UNIQUE,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    const result = await sql`
      INSERT INTO Subscribers (Email)
      VALUES (${email})
      ON CONFLICT (Email) DO NOTHING
    `;

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
