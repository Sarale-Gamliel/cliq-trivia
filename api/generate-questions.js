export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description, count = 20 } = req.body || {};
  if (!description?.trim()) return res.status(400).json({ error: 'Description required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured in Vercel environment' });

  const prompt = `אתה מומחה ליצירת שאלות טריוויה בעברית מגוונות ומעניינות.

המנחה ביקש: "${description.trim()}"

צור בדיוק ${count} שאלות טריוויה הקשורות לנושא זה, מגוונות ברמת הקושי.

החזר JSON תקין בלבד, ללא שום טקסט לפני או אחרי, במבנה המדויק:
[
  {
    "question": "מה השאלה?",
    "answer_1": "תשובה א",
    "answer_2": "תשובה ב",
    "answer_3": "תשובה ג",
    "answer_4": "תשובה ד",
    "correct_index": 1,
    "category": "קטגוריה",
    "difficulty": "easy"
  }
]

כללים:
- כל השאלות והתשובות בעברית
- correct_index הוא 1, 2, 3, או 4
- difficulty הוא "easy", "medium", או "hard"
- גוון בין רמות קושי
- שאלות מעניינות ולא משעממות
- JSON תקין בלבד, בלי הסברים`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.status(502).json({ error: 'AI service error', details: err });
    }

    const data = await response.json();
    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();

    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    if (start === -1 || end === 0) {
      return res.status(500).json({ error: 'AI returned invalid format', raw: text.slice(0, 200) });
    }

    const questions = JSON.parse(text.slice(start, end));
    return res.status(200).json({ questions });
  } catch (err) {
    console.error('Generate questions error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
