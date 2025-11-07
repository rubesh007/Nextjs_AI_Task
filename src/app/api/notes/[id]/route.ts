import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '@/db';
import { notes, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

type MyVariables = {
  userId: string;
};

// Passing context typing to Hono
const app = new Hono<{ Variables: MyVariables }>().basePath('/api/notes');

// Validation schema for updating notes
const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  tags: z.array(z.string()).optional(),
});

// Authentication middleware - supports cookie and bearer tokens
app.use('/*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    let session;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const headers = new Headers();
      headers.set('cookie', `better-auth.session_token=${token}`);
      session = await auth.api.getSession({ headers });
    } else {
      session = await auth.api.getSession({ headers: c.req.raw.headers });
    }

    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Typed correctly now
    c.set('userId', session.user.id);
    await next();
  } catch {
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

// -------------------------------------------------------
// GET /api/notes/:id
// -------------------------------------------------------
app.get('/:id', async (c) => {
  try {
    const userId = c.get('userId'); 
    const noteId = c.req.param('id');
    const parsedNoteId = parseInt(noteId, 10);

    if (Number.isNaN(parsedNoteId)) {
      return c.json({ error: 'Invalid note ID' }, 400);
    }

    // userId is string
    const authUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (authUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const note = await db
      .select()
      .from(notes)
      .where(eq(notes.id, parsedNoteId))
      .limit(1);

    if (note.length === 0) {
      return c.json({ error: 'Note not found' }, 404);
    }

    return c.json({ note: note[0] });
  } catch (error) {
    console.error('Error fetching note:', error);
    return c.json({ error: 'Failed to fetch note' }, 500);
  }
});

// -------------------------------------------------------
// PUT /api/notes/:id
// -------------------------------------------------------
app.put('/:id', zValidator('json', updateNoteSchema), async (c) => {
  try {
    const userId = c.get('userId');
    const noteId = c.req.param('id');
    const parsedNoteId = parseInt(noteId, 10);
    const data = c.req.valid('json');

    if (Number.isNaN(parsedNoteId)) {
      return c.json({ error: 'Invalid note ID' }, 400);
    }

    const authUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (authUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const existingNote = await db
      .select()
      .from(notes)
      .where(eq(notes.id, parsedNoteId))
      .limit(1);

    if (existingNote.length === 0) {
      return c.json({ error: 'Note not found' }, 404);
    }

    const updateData: Partial<typeof notes.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.tags) updateData.tags = data.tags;

    const updatedNote = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, parsedNoteId))
      .returning();

    return c.json({ note: updatedNote[0] });
  } catch (error) {
    console.error('Error updating note:', error);
    return c.json({ error: 'Failed to update note' }, 500);
  }
});

// -------------------------------------------------------
// DELETE /api/notes/:id
// -------------------------------------------------------
app.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const noteId = c.req.param('id');
    const parsedNoteId = parseInt(noteId, 10);

    if (Number.isNaN(parsedNoteId)) {
      return c.json({ error: 'Invalid note ID' }, 400);
    }

    const authUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (authUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const existingNote = await db
      .select()
      .from(notes)
      .where(eq(notes.id, parsedNoteId))
      .limit(1);

    if (existingNote.length === 0) {
      return c.json({ error: 'Note not found' }, 404);
    }

    await db.delete(notes).where(eq(notes.id, parsedNoteId));

    return c.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return c.json({ error: 'Failed to delete note' }, 500);
  }
});

export const GET = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
