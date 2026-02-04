import { NextRequest, NextResponse } from 'next/server';
import { getAllAccounts, deletePlaidItem, getAllPlaidItems } from '@/lib/db';

export async function GET() {
  try {
    const accounts = getAllAccounts();
    const items = getAllPlaidItems();

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
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing item_id parameter' },
        { status: 400 }
      );
    }

    // Delete the Plaid item (cascades to accounts and transactions via FK)
    deletePlaidItem(itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
