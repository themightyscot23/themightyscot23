import { NextRequest, NextResponse } from 'next/server';
import { getPlaidClient } from '@/lib/plaid';
import {
  getAllPlaidItems,
  getPlaidItem,
  getSyncState,
  updateSyncState,
  upsertTransaction,
  deleteTransaction,
} from '@/lib/db';
import { RemovedTransaction, Transaction } from 'plaid';

export async function POST(request: NextRequest) {
  try {
    const plaidClient = getPlaidClient();
    const body = await request.json().catch(() => ({}));
    const itemId = body.item_id;

    // If item_id provided, sync that item. Otherwise sync all items.
    const items = itemId ? [getPlaidItem(itemId)].filter(Boolean) : getAllPlaidItems();

    if (items.length === 0) {
      return NextResponse.json({ error: 'No connected accounts' }, { status: 400 });
    }

    let totalAdded = 0;
    let totalModified = 0;
    let totalRemoved = 0;

    for (const item of items) {
      if (!item) continue;

      const syncState = getSyncState(item.id);
      let cursor = syncState?.cursor || undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await plaidClient.transactionsSync({
          access_token: item.access_token,
          cursor,
          count: 500,
        });

        const { added, modified, removed, next_cursor, has_more } = response.data;

        // Process added transactions
        for (const txn of added) {
          // Use personal_finance_category (new) or fall back to category (deprecated)
          const categoryData = txn.personal_finance_category
            ? JSON.stringify({
                primary: txn.personal_finance_category.primary,
                detailed: txn.personal_finance_category.detailed,
              })
            : txn.category
            ? JSON.stringify(txn.category)
            : null;

          // Log transactions for debugging category mapping
          if (totalAdded < 10) {
            console.log('=== PLAID TRANSACTION ===');
            console.log('Name:', txn.name);
            console.log('Merchant:', txn.merchant_name);
            console.log('Amount:', txn.amount);
            console.log('Date:', txn.date);
            console.log('Personal Finance Category:', JSON.stringify(txn.personal_finance_category, null, 2));
            console.log('Legacy Category:', JSON.stringify(txn.category, null, 2));
            console.log('Stored as:', categoryData);
            console.log('=========================');
          }

          upsertTransaction({
            id: txn.transaction_id,
            account_id: txn.account_id,
            date: txn.date,
            merchant_name: txn.merchant_name || null,
            name: txn.name,
            amount: txn.amount,
            plaid_category: categoryData,
            user_category: null,
            pending: txn.pending,
          });
        }
        totalAdded += added.length;

        // Process modified transactions
        for (const txn of modified) {
          const categoryData = txn.personal_finance_category
            ? JSON.stringify({
                primary: txn.personal_finance_category.primary,
                detailed: txn.personal_finance_category.detailed,
              })
            : txn.category
            ? JSON.stringify(txn.category)
            : null;

          upsertTransaction({
            id: txn.transaction_id,
            account_id: txn.account_id,
            date: txn.date,
            merchant_name: txn.merchant_name || null,
            name: txn.name,
            amount: txn.amount,
            plaid_category: categoryData,
            user_category: null,
            pending: txn.pending,
          });
        }
        totalModified += modified.length;

        // Process removed transactions
        for (const txn of removed) {
          if (txn.transaction_id) {
            deleteTransaction(txn.transaction_id);
          }
        }
        totalRemoved += removed.length;

        cursor = next_cursor;
        hasMore = has_more;
      }

      // Save the cursor for next sync
      if (cursor) {
        updateSyncState(item.id, cursor);
      }
    }

    return NextResponse.json({
      success: true,
      added: totalAdded,
      modified: totalModified,
      removed: totalRemoved,
    });
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}
