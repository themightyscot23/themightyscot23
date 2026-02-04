import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // Delete session from database
      const db = getDb();
      db.prepare('DELETE FROM sessions WHERE token = ?').run(sessionToken);

      // Clear cookie
      cookieStore.delete('session_token');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
