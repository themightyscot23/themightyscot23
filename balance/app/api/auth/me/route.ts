import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const db = getDb();

    // Check if session exists and is valid
    const session = db.prepare(`
      SELECT s.*, u.id as user_id, u.email, u.name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(sessionToken) as { user_id: string; email: string; name: string | null } | undefined;

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
      },
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
