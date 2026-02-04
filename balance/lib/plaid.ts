import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Plaid client configuration
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

// Plaid API client instance
export const plaidClient = new PlaidApi(configuration);

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
