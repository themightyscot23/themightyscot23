import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as {
      id: string;
      email: string;
      password_hash: string;
      name: string | null;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = generateToken();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, user.id, sessionToken, expiresAt.toISOString());

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
