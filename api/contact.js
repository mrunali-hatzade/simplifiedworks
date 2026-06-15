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
    const { name, email, phone, service, budget, message, lead_type } = req.body;
    const finalLeadType = lead_type || 'Contact Us';
    
    // Create table if it doesn't exist
    await pool.query(`CREATE TABLE IF NOT EXISTS Contacts (
      id SERIAL PRIMARY KEY,
      Name varchar(255),
      Email varchar(255),
      Phone varchar(50),
      Service varchar(100),
      Budget varchar(100),
      Message text,
      LeadType varchar(50) DEFAULT 'Contact Us',
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure the LeadType column exists for older tables
    try {
      await pool.query(`ALTER TABLE Contacts ADD COLUMN LeadType varchar(50) DEFAULT 'Contact Us'`);
    } catch (err) {
      // Column already exists, ignore
    }

    const result = await pool.query(
      `INSERT INTO Contacts (Name, Email, Phone, Service, Budget, Message, LeadType)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, email, phone, service, budget, message, finalLeadType]
    );

    // Send Email using Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // You should verify a domain in Resend later
        to: ['simplifiedworks.official@gmail.com'],
        subject: `New Lead [${finalLeadType}]: ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Service:</strong> ${service || 'N/A'}</p>
          <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
          <p><strong>Message:</strong><br/> ${message}</p>
        `
      });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
