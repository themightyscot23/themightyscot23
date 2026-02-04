import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllAccounts, deletePlaidItem, getAllPlaidItems, getUserFromSession } from '@/lib/db';

export async function GET() {
  try {
    // Get current user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserFromSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get only accounts belonging to current user
    const accounts = getAllAccounts(user.id);
    const items = getAllPlaidItems(user.id);

    return NextResponse.json({
      accounts,
      items,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserFromSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing item_id parameter' },
        { status: 400 }
      );
    }

    // Delete the Plaid item (cascades to accounts and transactions via FK)
    // Only delete if it belongs to the current user
    deletePlaidItem(itemId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
