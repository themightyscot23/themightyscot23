import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Singleton Plaid client instance (lazy initialized)
let _plaidClient: PlaidApi | null = null;

/**
 * Get the Plaid client instance (lazy initialization)
 * This ensures environment variables are loaded before creating the client
 */
export function getPlaidClient(): PlaidApi {
  if (!_plaidClient) {
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const env = process.env.PLAID_ENV || 'sandbox';

    // Debug logging
    console.log('=== PLAID CONFIG DEBUG ===');
    console.log('PLAID_CLIENT_ID:', clientId ? `${clientId.substring(0, 8)}...` : 'UNDEFINED');
    console.log('PLAID_SECRET:', secret ? `${secret.substring(0, 8)}...` : 'UNDEFINED');
    console.log('PLAID_ENV:', env);
    console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('PLAID')));
    console.log('==========================');

    if (!clientId || !secret) {
      throw new Error(
        `Missing Plaid credentials. PLAID_CLIENT_ID: ${clientId ? 'set' : 'missing'}, PLAID_SECRET: ${secret ? 'set' : 'missing'}`
      );
    }

    const configuration = new Configuration({
      basePath: PlaidEnvironments[env as keyof typeof PlaidEnvironments],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
        },
      },
    });

    _plaidClient = new PlaidApi(configuration);
  }
  return _plaidClient;
}

// Products to request from Plaid
export const PLAID_PRODUCTS: Products[] = [Products.Transactions];

// Countries supported
export const PLAID_COUNTRY_CODES: CountryCode[] = [CountryCode.Us];

// Plaid Link configuration
export const PLAID_LINK_CONFIG = {
  products: PLAID_PRODUCTS,
  countryCodes: PLAID_COUNTRY_CODES,
  language: 'en' as const,
};
