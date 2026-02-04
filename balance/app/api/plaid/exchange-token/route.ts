import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { createPlaidItem, createAccount } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { public_token, metadata } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'Missing public_token' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Get institution info
    const institutionId = metadata?.institution?.institution_id || null;
    const institutionName = metadata?.institution?.name || null;

    // Store the Plaid item
    createPlaidItem({
      id: item_id,
      access_token,
      institution_id: institutionId,
      institution_name: institutionName,
    });

    // Fetch and store accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    for (const account of accountsResponse.data.accounts) {
      createAccount({
        id: account.account_id,
        plaid_item_id: item_id,
        name: account.name,
        official_name: account.official_name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
      });
    }

    return NextResponse.json({
      success: true,
      item_id,
      accounts: accountsResponse.data.accounts.length,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
