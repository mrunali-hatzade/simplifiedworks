import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, service, budget, message } = req.body;
    
    // Create table if it doesn't exist
    await sql`CREATE TABLE IF NOT EXISTS Contacts (
      id SERIAL PRIMARY KEY,
      Name varchar(255),
      Email varchar(255),
      Phone varchar(50),
      Service varchar(100),
      Budget varchar(100),
      Message text,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    const result = await sql`
      INSERT INTO Contacts (Name, Email, Phone, Service, Budget, Message)
      VALUES (${name}, ${email}, ${phone}, ${service}, ${budget}, ${message})
    `;

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
