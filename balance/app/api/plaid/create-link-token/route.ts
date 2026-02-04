import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPlaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from '@/lib/plaid';
import { getUserFromSession } from '@/lib/db';

export async function POST() {
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

    const plaidClient = getPlaidClient();
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id, // Use actual user ID
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
