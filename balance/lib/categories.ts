import { AppCategory } from './types';

// All available categories in the app
export const APP_CATEGORIES: AppCategory[] = [
  'Income',
  'Housing',
  'Transportation',
  'Groceries',
  'Dining Out',
  'Shopping',
  'Entertainment',
  'Health',
  'Travel',
  'Subscriptions',
  'Bills & Utilities',
  'Personal Care',
  'Education',
  'Gifts & Donations',
  'Fees & Charges',
  'Transfer',
  'Other',
];

// Mapping from Plaid categories to app categories
const PLAID_CATEGORY_MAP: Record<string, AppCategory> = {
  // Income
  'Income': 'Income',
  'Transfer > Payroll': 'Income',
  'Transfer > Deposit': 'Income',

  // Bank Fees
  'Bank Fees': 'Fees & Charges',
  'Bank Fees > ATM': 'Fees & Charges',
  'Bank Fees > Overdraft': 'Fees & Charges',
  'Interest > Interest Charged': 'Fees & Charges',

  // Food
  'Food and Drink': 'Dining Out',
  'Food and Drink > Restaurants': 'Dining Out',
  'Food and Drink > Restaurants > Fast Food': 'Dining Out',
  'Food and Drink > Restaurants > Coffee Shop': 'Dining Out',
  'Food and Drink > Groceries': 'Groceries',
  'Food and Drink > Bar': 'Dining Out',

  // Shops
  'Shops': 'Shopping',
  'Shops > Supermarkets and Groceries': 'Groceries',
  'Shops > Clothing and Accessories': 'Shopping',
  'Shops > Electronics': 'Shopping',
  'Shops > Department Stores': 'Shopping',
  'Shops > Sporting Goods': 'Shopping',
  'Shops > Books and News': 'Shopping',
  'Shops > Pets': 'Shopping',

  // Transportation
  'Transportation': 'Transportation',
  'Transportation > Gas Stations': 'Transportation',
  'Transportation > Parking': 'Transportation',
  'Transportation > Public Transit': 'Transportation',
  'Transportation > Taxi': 'Transportation',
  'Transportation > Ride Share': 'Transportation',

  // Travel
  'Travel': 'Travel',
  'Travel > Airlines and Aviation Services': 'Travel',
  'Travel > Lodging': 'Travel',
  'Travel > Car Rental': 'Travel',

  // Recreation & Entertainment
  'Recreation': 'Entertainment',
  'Recreation > Gyms and Fitness Centers': 'Health',
  'Recreation > Arts and Entertainment': 'Entertainment',
  'Entertainment': 'Entertainment',

  // Services
  'Service': 'Other',
  'Service > Subscription': 'Subscriptions',
  'Service > Streaming Services': 'Subscriptions',
  'Service > Personal Care': 'Personal Care',
  'Service > Financial': 'Other',

  // Healthcare
  'Healthcare': 'Health',
  'Healthcare > Medical Services': 'Health',
  'Healthcare > Pharmacies': 'Health',

  // Housing
  'Payment': 'Bills & Utilities',
  'Payment > Rent': 'Housing',
  'Payment > Insurance': 'Bills & Utilities',
  'Utilities': 'Bills & Utilities',

  // Transfer
  'Transfer': 'Transfer',
  'Transfer > Internal Account Transfer': 'Transfer',
  'Transfer > Wire': 'Transfer',
  'Transfer > Credit': 'Transfer',
  'Transfer > Debit': 'Transfer',

  // Tax
  'Tax': 'Bills & Utilities',

  // Interest earned
  'Interest > Interest Earned': 'Income',

  // Community & Education
  'Community': 'Other',
  'Education': 'Education',

  // Gifts
  'Gifts and Donations': 'Gifts & Donations',
};

/**
 * Maps Plaid category array to a single app category
 * @param plaidCategories - JSON string array of Plaid categories (e.g., '["Food and Drink", "Restaurants"]')
 * @returns The mapped app category
 */
export function mapPlaidCategory(plaidCategories: string | null): AppCategory {
  if (!plaidCategories) {
    return 'Other';
  }

  try {
    const categories: string[] = JSON.parse(plaidCategories);

    if (categories.length === 0) {
      return 'Other';
    }

    // Try to match the most specific category path first (e.g., "Food and Drink > Groceries")
    for (let i = categories.length; i > 0; i--) {
      const categoryPath = categories.slice(0, i).join(' > ');
      if (PLAID_CATEGORY_MAP[categoryPath]) {
        return PLAID_CATEGORY_MAP[categoryPath];
      }
    }

    // Fall back to primary category
    const primaryCategory = categories[0];
    if (PLAID_CATEGORY_MAP[primaryCategory]) {
      return PLAID_CATEGORY_MAP[primaryCategory];
    }

    return 'Other';
  } catch {
    return 'Other';
  }
}

/**
 * Gets the effective category for a transaction (user override or mapped Plaid category)
 */
export function getEffectiveCategory(
  userCategory: string | null,
  plaidCategory: string | null
): AppCategory {
  if (userCategory && APP_CATEGORIES.includes(userCategory as AppCategory)) {
    return userCategory as AppCategory;
  }
  return mapPlaidCategory(plaidCategory);
}

/**
 * Category colors for visualizations
 */
export const CATEGORY_COLORS: Record<AppCategory, string> = {
  'Income': '#10b981',
  'Housing': '#6366f1',
  'Transportation': '#f59e0b',
  'Groceries': '#84cc16',
  'Dining Out': '#f97316',
  'Shopping': '#ec4899',
  'Entertainment': '#8b5cf6',
  'Health': '#14b8a6',
  'Travel': '#06b6d4',
  'Subscriptions': '#a855f7',
  'Bills & Utilities': '#64748b',
  'Personal Care': '#f43f5e',
  'Education': '#3b82f6',
  'Gifts & Donations': '#d946ef',
  'Fees & Charges': '#ef4444',
  'Transfer': '#94a3b8',
  'Other': '#71717a',
};
