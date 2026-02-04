import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Find user
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as {
      id: string;
      email: string;
    } | undefined;

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Create password reset token
    const resetToken = generateToken();
    const tokenId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing reset tokens for this user
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?').run(user.id);

    // Create new reset token
    db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenId, user.id, resetToken, expiresAt.toISOString());

    // In a real app, you would send an email here with the reset link
    // For now, just log it
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: /reset-password?token=${resetToken}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
