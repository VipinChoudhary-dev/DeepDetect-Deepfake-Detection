const recent = new Map();
const PROMPT = 'You are DeepDetect, a friendly, concise image-verification guide for an educational site. The image detector is currently offline. You cannot see uploaded images or scan results. Explain how to verify sources and the limits of visual clues. Do not claim to have analyzed an image or invent accuracy numbers. A model score is not proof. Use plain text, no Markdown, and keep answers under 150 words.';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST to ask a question.' });
  }
  const origin = req.headers.origin;
  if (origin && origin !== `https://${req.headers.host}` && origin !== `http://${req.headers.host}`) {
    return res.status(403).json({ error: 'This request is not from DeepDetect.' });
  }
  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ error: 'Enter a question under 2,000 characters.' });
  }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const entry = recent.get(ip) || { start: now, count: 0 };
  if (now - entry.start > 60_000) { entry.start = now; entry.count = 0; }
  if (++entry.count > 12) return res.status(429).json({ error: 'Please wait a minute before asking more questions.' });
  recent.set(ip, entry);
  if (recent.size > 2000) for (const [key, item] of recent) if (now - item.start > 60_000) recent.delete(key);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'The assistant is not configured yet. Please try again later.' });
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: PROMPT }] }, contents: [{ role: 'user', parts: [{ text: message.trim() }] }], generationConfig: { maxOutputTokens: 350 } }),
    });
    if (!response.ok) return res.status(502).json({ error: 'The assistant is unavailable right now. Please try again later.' });
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('');
    return res.status(200).json({ reply: reply || 'Please rephrase your question.' });
  } catch {
    return res.status(502).json({ error: 'The assistant could not connect. Please try again.' });
  } finally {
    clearTimeout(timeout);
  }
}
