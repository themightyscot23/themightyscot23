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

// Mapping from Plaid primary categories to app categories
const PRIMARY_CATEGORY_MAP: Record<string, AppCategory> = {
  // Direct mappings (case-insensitive matching applied below)
  'income': 'Income',
  'transfer': 'Transfer',
  'bank fees': 'Fees & Charges',
  'interest': 'Income', // Default for interest
  'tax': 'Bills & Utilities',
  'payment': 'Bills & Utilities',
  'food and drink': 'Dining Out',
  'shops': 'Shopping',
  'transportation': 'Transportation',
  'travel': 'Travel',
  'recreation': 'Entertainment',
  'entertainment': 'Entertainment',
  'service': 'Other',
  'healthcare': 'Health',
  'medical': 'Health',
  'community': 'Other',
  'government': 'Bills & Utilities',
  'utilities': 'Bills & Utilities',
  'rent': 'Housing',
  'mortgage': 'Housing',
  'loan': 'Bills & Utilities',
  'education': 'Education',
  'charitable giving': 'Gifts & Donations',
  'gifts': 'Gifts & Donations',
  'personal': 'Personal Care',
};

// More specific keyword-based mappings (checked against full category string)
const KEYWORD_MAPPINGS: [string, AppCategory][] = [
  // Income keywords
  ['payroll', 'Income'],
  ['salary', 'Income'],
  ['wages', 'Income'],
  ['direct deposit', 'Income'],
  ['deposit', 'Income'],
  ['refund', 'Income'],
  ['interest earned', 'Income'],
  ['dividend', 'Income'],
  ['cashback', 'Income'],
  ['cash back', 'Income'],

  // Housing
  ['rent', 'Housing'],
  ['mortgage', 'Housing'],
  ['real estate', 'Housing'],
  ['property', 'Housing'],
  ['hoa', 'Housing'],
  ['homeowners', 'Housing'],

  // Groceries (before general food)
  ['grocery', 'Groceries'],
  ['groceries', 'Groceries'],
  ['supermarket', 'Groceries'],
  ['costco', 'Groceries'],
  ['walmart', 'Groceries'],
  ['target', 'Groceries'],
  ['whole foods', 'Groceries'],
  ['trader joe', 'Groceries'],
  ['safeway', 'Groceries'],
  ['kroger', 'Groceries'],
  ['aldi', 'Groceries'],
  ['publix', 'Groceries'],

  // Dining
  ['restaurant', 'Dining Out'],
  ['fast food', 'Dining Out'],
  ['coffee', 'Dining Out'],
  ['cafe', 'Dining Out'],
  ['bar', 'Dining Out'],
  ['food and drink', 'Dining Out'],

  // Transportation
  ['gas', 'Transportation'],
  ['fuel', 'Transportation'],
  ['parking', 'Transportation'],
  ['uber', 'Transportation'],
  ['lyft', 'Transportation'],
  ['taxi', 'Transportation'],
  ['ride share', 'Transportation'],
  ['rideshare', 'Transportation'],
  ['transit', 'Transportation'],
  ['subway', 'Transportation'],
  ['metro', 'Transportation'],
  ['car wash', 'Transportation'],
  ['auto', 'Transportation'],

  // Travel
  ['airline', 'Travel'],
  ['flight', 'Travel'],
  ['hotel', 'Travel'],
  ['lodging', 'Travel'],
  ['airbnb', 'Travel'],
  ['vrbo', 'Travel'],
  ['car rental', 'Travel'],
  ['cruise', 'Travel'],

  // Entertainment
  ['movie', 'Entertainment'],
  ['theatre', 'Entertainment'],
  ['theater', 'Entertainment'],
  ['concert', 'Entertainment'],
  ['sports', 'Entertainment'],
  ['stadium', 'Entertainment'],
  ['museum', 'Entertainment'],
  ['amusement', 'Entertainment'],
  ['game', 'Entertainment'],
  ['gaming', 'Entertainment'],
  ['arcade', 'Entertainment'],

  // Subscriptions
  ['subscription', 'Subscriptions'],
  ['streaming', 'Subscriptions'],
  ['netflix', 'Subscriptions'],
  ['spotify', 'Subscriptions'],
  ['hulu', 'Subscriptions'],
  ['disney', 'Subscriptions'],
  ['amazon prime', 'Subscriptions'],
  ['apple music', 'Subscriptions'],
  ['youtube', 'Subscriptions'],
  ['hbo', 'Subscriptions'],

  // Health
  ['pharmacy', 'Health'],
  ['doctor', 'Health'],
  ['hospital', 'Health'],
  ['medical', 'Health'],
  ['dental', 'Health'],
  ['vision', 'Health'],
  ['gym', 'Health'],
  ['fitness', 'Health'],
  ['health', 'Health'],

  // Personal Care
  ['salon', 'Personal Care'],
  ['barber', 'Personal Care'],
  ['spa', 'Personal Care'],
  ['beauty', 'Personal Care'],
  ['cosmetic', 'Personal Care'],
  ['haircut', 'Personal Care'],

  // Bills & Utilities
  ['utility', 'Bills & Utilities'],
  ['utilities', 'Bills & Utilities'],
  ['electric', 'Bills & Utilities'],
  ['water', 'Bills & Utilities'],
  ['gas bill', 'Bills & Utilities'],
  ['internet', 'Bills & Utilities'],
  ['phone', 'Bills & Utilities'],
  ['cell', 'Bills & Utilities'],
  ['mobile', 'Bills & Utilities'],
  ['cable', 'Bills & Utilities'],
  ['insurance', 'Bills & Utilities'],

  // Fees
  ['fee', 'Fees & Charges'],
  ['atm', 'Fees & Charges'],
  ['overdraft', 'Fees & Charges'],
  ['late charge', 'Fees & Charges'],
  ['service charge', 'Fees & Charges'],
  ['interest charged', 'Fees & Charges'],

  // Transfer (lower priority)
  ['transfer', 'Transfer'],
  ['wire', 'Transfer'],
  ['venmo', 'Transfer'],
  ['zelle', 'Transfer'],
  ['paypal', 'Transfer'],
  ['cash app', 'Transfer'],

  // Education
  ['tuition', 'Education'],
  ['school', 'Education'],
  ['college', 'Education'],
  ['university', 'Education'],
  ['student', 'Education'],
  ['course', 'Education'],
  ['book', 'Education'],

  // Gifts
  ['gift', 'Gifts & Donations'],
  ['donation', 'Gifts & Donations'],
  ['charity', 'Gifts & Donations'],
  ['nonprofit', 'Gifts & Donations'],
];

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

    // Create a full string for keyword matching
    const fullCategoryString = categories.join(' ').toLowerCase();

    // First, try keyword matching (more specific)
    for (const [keyword, appCategory] of KEYWORD_MAPPINGS) {
      if (fullCategoryString.includes(keyword.toLowerCase())) {
        return appCategory;
      }
    }

    // Then try primary category mapping
    const primaryCategory = categories[0].toLowerCase();
    if (PRIMARY_CATEGORY_MAP[primaryCategory]) {
      return PRIMARY_CATEGORY_MAP[primaryCategory];
    }

    // Try partial match on primary category
    for (const [key, value] of Object.entries(PRIMARY_CATEGORY_MAP)) {
      if (primaryCategory.includes(key) || key.includes(primaryCategory)) {
        return value;
      }
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
