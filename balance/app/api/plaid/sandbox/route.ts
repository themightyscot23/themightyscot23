import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPlaidClient } from '@/lib/plaid';
import {
  getAllPlaidItems,
  getDb,
  getUserFromSession,
} from '@/lib/db';

/**
 * Sandbox utilities for testing:
 * - POST with action=fire_webhook: Trigger sandbox webhook to generate new transactions
 * - POST with action=reset_sync: Reset sync cursor to re-fetch all transactions
 * - GET: View current sync state and sample transaction categories
 */

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

    const db = getDb();
    const items = getAllPlaidItems(user.id);

    // Get sync state for all items
    const syncStates = db
      .prepare('SELECT * FROM sync_state')
      .all();

    // Get sample transactions with their raw plaid categories
    const sampleTransactions = db
      .prepare(`
        SELECT id, name, merchant_name, plaid_category, user_category, date
        FROM transactions
        ORDER BY date DESC
        LIMIT 20
      `)
      .all();

    // Count categories
    const categoryCounts = db
      .prepare(`
        SELECT plaid_category, COUNT(*) as count
        FROM transactions
        GROUP BY plaid_category
        ORDER BY count DESC
        LIMIT 20
      `)
      .all();

    return NextResponse.json({
      items: items.map((i) => ({ id: i.id, institution_name: i.institution_name })),
      syncStates,
      sampleTransactions,
      categoryCounts,
      hint: 'POST with action=fire_webhook to generate new transactions, or action=reset_sync to re-fetch all',
    });
  } catch (error) {
    console.error('Error in sandbox GET:', error);
    return NextResponse.json(
      { error: 'Failed to get sandbox info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, item_id } = body;

    const plaidClient = getPlaidClient();
    const items = getAllPlaidItems(user.id);

    if (items.length === 0) {
      return NextResponse.json({ error: 'No connected accounts' }, { status: 400 });
    }

    const targetItem = item_id ? items.find((i) => i.id === item_id) : items[0];
    if (!targetItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (action === 'fire_webhook') {
      // Fire a DEFAULT_UPDATE webhook to simulate new transactions
      // This only works in sandbox mode
      try {
        const response = await plaidClient.sandboxItemFireWebhook({
          access_token: targetItem.access_token,
          webhook_code: 'DEFAULT_UPDATE',
        });

        return NextResponse.json({
          success: true,
          message: 'Webhook fired - new transactions should be available. Run sync to fetch them.',
          response: response.data,
        });
      } catch (webhookError: unknown) {
        const errorMessage = webhookError instanceof Error ? webhookError.message : 'Unknown error';
        return NextResponse.json({
          error: 'Failed to fire webhook (only works in sandbox mode)',
          details: errorMessage,
        }, { status: 400 });
      }
    }

    if (action === 'reset_sync') {
      // Reset the sync cursor so next sync fetches all transactions again
      const db = getDb();
      db.prepare('DELETE FROM sync_state WHERE plaid_item_id = ?').run(targetItem.id);

      return NextResponse.json({
        success: true,
        message: 'Sync state reset. Next sync will fetch all transactions.',
        item_id: targetItem.id,
      });
    }

    if (action === 'reset_all') {
      // Reset all sync cursors and delete all transactions to start fresh
      const db = getDb();
      db.prepare('DELETE FROM sync_state').run();
      db.prepare('DELETE FROM transactions').run();

      return NextResponse.json({
        success: true,
        message: 'All sync states and transactions cleared. Run sync to re-fetch everything.',
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use: fire_webhook, reset_sync, or reset_all' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in sandbox POST:', error);
    return NextResponse.json(
      { error: 'Failed to execute sandbox action' },
      { status: 500 }
    );
  }
}
