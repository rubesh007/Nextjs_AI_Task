import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq, or, like, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('Cookie');
    
    let session;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const headers = new Headers();
      headers.set('cookie', `better-auth.session_token=${token}`);
      session = await auth.api.getSession({ headers });
    } else if (cookieHeader) {
      session = await auth.api.getSession({ headers: request.headers });
    }

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      const allNotes = await db.select()
        .from(notes)
        .where(eq(notes.userId, userId))
        .orderBy(notes.updatedAt);
      return NextResponse.json({ notes: allNotes });
    }

    const searchResults = await db.select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          or(
            like(notes.title, `%${query}%`),
            like(notes.content, `%${query}%`)
          )
        )
      )
      .orderBy(notes.updatedAt);

    return NextResponse.json({ notes: searchResults });
  } catch (error) {
    console.error('Error searching notes:', error);
    return NextResponse.json(
      { error: 'Failed to search notes' },
      { status: 500 }
    );
  }
}
