import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

// 👇 Add this type
type Variables = {
  userId: string;
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const aiRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  action: z.enum(['summary', 'improve', 'tags']),
});

app.use('/*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);
  c.set('userId', session.user.id); // ✅ now typed correctly
  await next();
});

app.post('/', zValidator('json', aiRequestSchema), async (c) => {
  try {
    const { content, action } = c.req.valid('json');

    let prompt = '';
    switch (action) {
      case 'summary':
        prompt = `Summarize this text clearly and concisely:\n\n${content}`;
        break;
      case 'improve':
        prompt = `Improve grammar and clarity of the following text:\n\n${content}`;
        break;
      case 'tags':
        prompt = `Read the following text and generate 3–5 short lowercase topic tags.
Respond ONLY with a valid JSON array of strings (no explanation, no text before or after).
Example: ["ai","notetaking","productivity"]

Text:
${content}`;
        break;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = await result.response.text();
    console.log('Gemini raw result:', raw);

    if (action === 'tags') {
      try {
        const parsed = JSON.parse(raw.trim());
        return c.json({ tags: parsed });
      } catch {
        const extracted = raw
          .replace(/[\[\]]/g, '')
          .split(',')
          .map((t) => t.replace(/["']/g, '').trim())
          .filter(Boolean);
        return c.json({ tags: extracted });
      }
    }

    return c.json({ result: raw });
  } catch (error) {
    console.error('Gemini AI API error:', error);
    return c.json({ error: 'AI request failed.' }, 500);
  }
});

export const POST = handle(app);
