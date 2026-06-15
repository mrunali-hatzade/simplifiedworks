const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are the customer support AI for Simplified Works, a premium digital agency.
Your goal is to answer visitor questions, be extremely helpful, professional, and friendly.

About Simplified Works:
- We build professional websites, web apps, admin dashboards, and custom SaaS platforms.
- We offer beautiful, modern designs and robust backends.
- If asked about pricing: We offer tailored pricing based on project scope. Encourage them to fill out the "Free Quote" form or visit the Pricing page.
- If asked how to contact us: They can use the "Contact Us" form on the Contact page, or click the WhatsApp icon on the screen.
- Keep your answers concise, ideally 1-3 sentences. Do not use overly long paragraphs.
- You are an AI assistant on the website. If you don't know the answer, politely tell them to contact the human team via WhatsApp.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
  }

  try {
    const { history, message } = req.body;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    // Format history for Gemini
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
