// api/groq-proxy.js  (ES-module syntax)
export default async function handler(req, res) {
  /* ---------- 1. basic checks ---------- */
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    res.status(500).json({ error: 'Server mis-configured: missing GROQ_API_KEY' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { type, payload } = body || {};

  if (!type || !payload) {
    res.status(400).json({ error: 'type & payload required' });
    return;
  }

  /* ---------- 2. build messages ---------- */
  const model = 'llama3-8b-8192';
  let messages;

  if (type === 'summarize') {
    messages = [
      { role: 'system', content: 'Tu es un assistant expert en pneumologie. Résume en quelques points clés.' },
      { role: 'user', content: payload.text },
    ];
  } else if (type === 'translate') {
    messages = [
      { role: 'system', content: `Translate from French to ${payload.langName}. Output only the translation.` },
      { role: 'user', content: payload.text },
    ];
  } else {
    res.status(400).json({ error: 'Invalid type' });
    return;
  }

  /* ---------- 3. stream from Groq ---------- */
  const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true, // 🔑 enable streaming
    }),
  });

  if (!upstream.ok) {
    const txt = await upstream.text();
    res.status(upstream.status).json({ error: txt });
    return;
  }

  /* ---------- 4. relay SSE to the browser ---------- */
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder('utf-8');

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const ln of lines) {
        if (ln.startsWith('data: ')) {
          const payload = ln.slice(6).trim();
          if (payload === '[DONE]') {
            res.write(`data: [DONE]\n\n`);
            break;
          }
          try {
            const json = JSON.parse(payload);
            const token = json.choices?.[0]?.delta?.content ?? '';
            if (token) res.write(`data: ${token}\n\n`);
          } catch {
            /* ignore malformed SSE */
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  res.end();
}