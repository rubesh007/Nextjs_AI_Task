import { Hono } from "hono";
import { handle } from "hono/vercel";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db";
import { notes, user } from "@/db/schema";
import { eq, or, like, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

type MyVariables = {
  userId: string;
};

const app = new Hono<{ Variables: MyVariables }>().basePath("/api/notes");

// Validation schemas
const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional().default([]),
});

const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  content: z.string().min(1, "Content is required").optional(),
  tags: z.array(z.string()).optional(),
});

const searchSchema = z.object({
  q: z.string().optional(),
});

// -----------------------------------------------------------
// Authentication middleware
// -----------------------------------------------------------
app.use("/*", async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: "Unauthorized" }, 401);

    c.set("userId", session.user.id);
    await next();
  } catch (err) {
    console.error("Authentication error:", err);
    return c.json({ error: "Authentication failed" }, 401);
  }
});

// -----------------------------------------------------------
// GET /api/notes/search - Search notes
// -----------------------------------------------------------
app.get("/search", zValidator("query", searchSchema), async (c) => {
  try {
    const userId = c.get("userId");
    const { q } = c.req.valid("query");

    if (!q || q.trim() === "") {
      const allNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.userId, userId))
        .orderBy(notes.updatedAt);

      return c.json({ notes: allNotes });
    }

    const searchResults = await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          or(like(notes.title, `%${q}%`), like(notes.content, `%${q}%`))
        )
      )
      .orderBy(notes.updatedAt);

    return c.json({ notes: searchResults });
  } catch (error) {
    console.error("Error searching notes:", error);
    return c.json({ error: "Failed to search notes" }, 500);
  }
});

// -----------------------------------------------------------
// GET /api/notes - Get all notes for user
// -----------------------------------------------------------
app.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const authUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (authUser.length === 0) return c.json({ error: "User not found" }, 404);

    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(notes.updatedAt);

    return c.json({ notes: userNotes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return c.json({ error: "Failed to fetch notes" }, 500);
  }
});

// -----------------------------------------------------------
// POST /api/notes - Create note
// -----------------------------------------------------------
app.post("/", zValidator("json", createNoteSchema), async (c) => {
  try {
    const userId = c.get("userId");
    const data = c.req.valid("json");

    const authUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (authUser.length === 0) return c.json({ error: "User not found" }, 404);

    const now = new Date().toISOString();
    const newNote = await db
      .insert(notes)
      .values({
        userId,
        title: data.title,
        content: data.content,
        tags: data.tags ?? [],
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json({ note: newNote[0] }, 201);
  } catch (error) {
    console.error("Error creating note:", error);
    return c.json({ error: "Failed to create note" }, 500);
  }
});

// -----------------------------------------------------------
// GET /api/notes/:id
// -----------------------------------------------------------
app.get("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const noteId = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(noteId)) return c.json({ error: "Invalid note ID" }, 400);

    const authUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (authUser.length === 0) return c.json({ error: "User not found" }, 404);

    const noteData = await db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);

    if (noteData.length === 0) return c.json({ error: "Note not found" }, 404);

    return c.json({ note: noteData[0] });
  } catch (error) {
    console.error("Error fetching note:", error);
    return c.json({ error: "Failed to fetch note" }, 500);
  }
});

// -----------------------------------------------------------
// PUT /api/notes/:id - Update note
// -----------------------------------------------------------
app.put("/:id", zValidator("json", updateNoteSchema), async (c) => {
  try {
    const userId = c.get("userId");
    const noteId = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(noteId)) return c.json({ error: "Invalid note ID" }, 400);

    const data = c.req.valid("json");
    const authUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (authUser.length === 0) return c.json({ error: "User not found" }, 404);

    const existing = await db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);
    if (existing.length === 0) return c.json({ error: "Note not found" }, 404);

    const updateData: Partial<typeof notes.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.tags) updateData.tags = data.tags;

    const updated = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, noteId))
      .returning();
    return c.json({ note: updated[0] });
  } catch (error) {
    console.error("Error updating note:", error);
    return c.json({ error: "Failed to update note" }, 500);
  }
});

// -----------------------------------------------------------
// DELETE /api/notes/:id
// -----------------------------------------------------------
app.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const noteId = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(noteId)) return c.json({ error: "Invalid note ID" }, 400);

    const authUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (authUser.length === 0) return c.json({ error: "User not found" }, 404);

    const existing = await db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);
    if (existing.length === 0) return c.json({ error: "Note not found" }, 404);

    await db.delete(notes).where(eq(notes.id, noteId));
    return c.json({ success: true, message: "Note deleted" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return c.json({ error: "Failed to delete note" }, 500);
  }
});

// Exports for Next.js API routes
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
