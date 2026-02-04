import { NextResponse } from 'next/server';
import { getPlaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from '@/lib/plaid';

export async function POST() {
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'user-id', // Single user app, static ID
      },
      client_name: 'Balance Budget App',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
