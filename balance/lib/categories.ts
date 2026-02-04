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

// Mapping from Plaid's NEW personal_finance_category PRIMARY values (UPPER_SNAKE_CASE)
const PLAID_PRIMARY_MAP: Record<string, AppCategory> = {
  'INCOME': 'Income',
  'TRANSFER_IN': 'Transfer',
  'TRANSFER_OUT': 'Transfer',
  'LOAN_PAYMENTS': 'Bills & Utilities',
  'BANK_FEES': 'Fees & Charges',
  'ENTERTAINMENT': 'Entertainment',
  'FOOD_AND_DRINK': 'Dining Out',
  'GENERAL_MERCHANDISE': 'Shopping',
  'HOME_IMPROVEMENT': 'Housing',
  'MEDICAL': 'Health',
  'PERSONAL_CARE': 'Personal Care',
  'GENERAL_SERVICES': 'Other',
  'GOVERNMENT_AND_NON_PROFIT': 'Gifts & Donations',
  'TRANSPORTATION': 'Transportation',
  'TRAVEL': 'Travel',
  'RENT_AND_UTILITIES': 'Bills & Utilities',
};

// Mapping for Plaid's DETAILED categories (more specific mappings)
const PLAID_DETAILED_MAP: Record<string, AppCategory> = {
  // Income
  'INCOME_DIVIDENDS': 'Income',
  'INCOME_INTEREST_EARNED': 'Income',
  'INCOME_RETIREMENT_PENSION': 'Income',
  'INCOME_TAX_REFUND': 'Income',
  'INCOME_UNEMPLOYMENT': 'Income',
  'INCOME_WAGES': 'Income',
  'INCOME_OTHER_INCOME': 'Income',

  // Food - Groceries vs Dining
  'FOOD_AND_DRINK_GROCERIES': 'Groceries',
  'FOOD_AND_DRINK_SUPERMARKETS_AND_GROCERIES': 'Groceries',
  'FOOD_AND_DRINK_RESTAURANTS': 'Dining Out',
  'FOOD_AND_DRINK_FAST_FOOD': 'Dining Out',
  'FOOD_AND_DRINK_COFFEE': 'Dining Out',
  'FOOD_AND_DRINK_BAR': 'Dining Out',
  'FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK': 'Dining Out',
  'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR': 'Dining Out',
  'FOOD_AND_DRINK_VENDING_MACHINES': 'Dining Out',

  // Rent and Utilities
  'RENT_AND_UTILITIES_RENT': 'Housing',
  'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY': 'Bills & Utilities',
  'RENT_AND_UTILITIES_INTERNET_AND_CABLE': 'Bills & Utilities',
  'RENT_AND_UTILITIES_TELEPHONE': 'Bills & Utilities',
  'RENT_AND_UTILITIES_WATER': 'Bills & Utilities',
  'RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT': 'Bills & Utilities',
  'RENT_AND_UTILITIES_OTHER_UTILITIES': 'Bills & Utilities',

  // General Services
  'GENERAL_SERVICES_INSURANCE': 'Bills & Utilities',
  'GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING': 'Bills & Utilities',
  'GENERAL_SERVICES_EDUCATION': 'Education',
  'GENERAL_SERVICES_POSTAGE_AND_SHIPPING': 'Other',
  'GENERAL_SERVICES_STORAGE': 'Other',
  'GENERAL_SERVICES_OTHER_GENERAL_SERVICES': 'Other',
  'GENERAL_SERVICES_CONSULTING_AND_LEGAL': 'Other',
  'GENERAL_SERVICES_AUTOMOTIVE': 'Transportation',
  'GENERAL_SERVICES_SUBSCRIPTION': 'Subscriptions',

  // Entertainment
  'ENTERTAINMENT_TV_AND_MOVIES': 'Subscriptions',
  'ENTERTAINMENT_MUSIC_AND_AUDIO': 'Subscriptions',
  'ENTERTAINMENT_VIDEO_GAMES': 'Entertainment',
  'ENTERTAINMENT_CASINOS_AND_GAMBLING': 'Entertainment',
  'ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS': 'Entertainment',
  'ENTERTAINMENT_OTHER_ENTERTAINMENT': 'Entertainment',

  // Transportation
  'TRANSPORTATION_GAS': 'Transportation',
  'TRANSPORTATION_PARKING': 'Transportation',
  'TRANSPORTATION_PUBLIC_TRANSIT': 'Transportation',
  'TRANSPORTATION_TAXIS_AND_RIDE_SHARES': 'Transportation',
  'TRANSPORTATION_TOLLS': 'Transportation',
  'TRANSPORTATION_OTHER_TRANSPORTATION': 'Transportation',
  'TRANSPORTATION_BIKES_AND_SCOOTERS': 'Transportation',
  'TRANSPORTATION_CAR_AND_TRUCK_RENTAL': 'Travel',

  // Travel
  'TRAVEL_FLIGHTS': 'Travel',
  'TRAVEL_LODGING': 'Travel',
  'TRAVEL_RENTAL_CARS': 'Travel',
  'TRAVEL_OTHER_TRAVEL': 'Travel',

  // Medical
  'MEDICAL_DENTAL_CARE': 'Health',
  'MEDICAL_EYE_CARE': 'Health',
  'MEDICAL_NURSING_CARE': 'Health',
  'MEDICAL_PHARMACIES_AND_SUPPLEMENTS': 'Health',
  'MEDICAL_PRIMARY_CARE': 'Health',
  'MEDICAL_VETERINARY_SERVICES': 'Health',
  'MEDICAL_OTHER_MEDICAL': 'Health',

  // Personal Care
  'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS': 'Health',
  'PERSONAL_CARE_HAIR_AND_BEAUTY': 'Personal Care',
  'PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING': 'Personal Care',
  'PERSONAL_CARE_OTHER_PERSONAL_CARE': 'Personal Care',

  // Home Improvement
  'HOME_IMPROVEMENT_FURNITURE': 'Shopping',
  'HOME_IMPROVEMENT_HARDWARE': 'Shopping',
  'HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE': 'Housing',
  'HOME_IMPROVEMENT_SECURITY': 'Housing',
  'HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT': 'Housing',

  // Bank Fees
  'BANK_FEES_ATM_FEES': 'Fees & Charges',
  'BANK_FEES_FOREIGN_TRANSACTION_FEES': 'Fees & Charges',
  'BANK_FEES_INSUFFICIENT_FUNDS': 'Fees & Charges',
  'BANK_FEES_INTEREST_CHARGE': 'Fees & Charges',
  'BANK_FEES_OVERDRAFT_FEES': 'Fees & Charges',
  'BANK_FEES_OTHER_BANK_FEES': 'Fees & Charges',

  // Government
  'GOVERNMENT_AND_NON_PROFIT_DONATIONS': 'Gifts & Donations',
  'GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES': 'Bills & Utilities',
  'GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT': 'Bills & Utilities',
  'GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT': 'Other',

  // Loan Payments
  'LOAN_PAYMENTS_CAR_PAYMENT': 'Bills & Utilities',
  'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT': 'Transfer',
  'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT': 'Bills & Utilities',
  'LOAN_PAYMENTS_MORTGAGE_PAYMENT': 'Housing',
  'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT': 'Education',
  'LOAN_PAYMENTS_OTHER_PAYMENT': 'Bills & Utilities',

  // Transfer
  'TRANSFER_IN_CASH_ADVANCES_AND_LOANS': 'Transfer',
  'TRANSFER_IN_DEPOSIT': 'Income',
  'TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS': 'Transfer',
  'TRANSFER_IN_SAVINGS': 'Transfer',
  'TRANSFER_IN_ACCOUNT_TRANSFER': 'Transfer',
  'TRANSFER_IN_OTHER_TRANSFER_IN': 'Transfer',
  'TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS': 'Transfer',
  'TRANSFER_OUT_SAVINGS': 'Transfer',
  'TRANSFER_OUT_WITHDRAWAL': 'Transfer',
  'TRANSFER_OUT_ACCOUNT_TRANSFER': 'Transfer',
  'TRANSFER_OUT_OTHER_TRANSFER_OUT': 'Transfer',

  // General Merchandise
  'GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS': 'Shopping',
  'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES': 'Shopping',
  'GENERAL_MERCHANDISE_CONVENIENCE_STORES': 'Shopping',
  'GENERAL_MERCHANDISE_DEPARTMENT_STORES': 'Shopping',
  'GENERAL_MERCHANDISE_DISCOUNT_STORES': 'Shopping',
  'GENERAL_MERCHANDISE_ELECTRONICS': 'Shopping',
  'GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES': 'Shopping',
  'GENERAL_MERCHANDISE_OFFICE_SUPPLIES': 'Shopping',
  'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES': 'Shopping',
  'GENERAL_MERCHANDISE_PET_SUPPLIES': 'Shopping',
  'GENERAL_MERCHANDISE_SPORTING_GOODS': 'Shopping',
  'GENERAL_MERCHANDISE_SUPERSTORES': 'Groceries',
  'GENERAL_MERCHANDISE_TOBACCO_AND_VAPE': 'Shopping',
  'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE': 'Shopping',
};

// Legacy mapping from old Plaid categories (lowercase for matching)
const LEGACY_CATEGORY_MAP: Record<string, AppCategory> = {
  'income': 'Income',
  'transfer': 'Transfer',
  'bank fees': 'Fees & Charges',
  'food and drink': 'Dining Out',
  'shops': 'Shopping',
  'transportation': 'Transportation',
  'travel': 'Travel',
  'recreation': 'Entertainment',
  'entertainment': 'Entertainment',
  'healthcare': 'Health',
  'service': 'Other',
  'community': 'Other',
  'government': 'Bills & Utilities',
  'payment': 'Bills & Utilities',
};

/**
 * Maps Plaid category to a single app category
 * Handles both new personal_finance_category format and legacy category array
 */
export function mapPlaidCategory(plaidCategories: string | null): AppCategory {
  if (!plaidCategories) {
    return 'Other';
  }

  try {
    const parsed = JSON.parse(plaidCategories);

    // New format: { primary: "FOOD_AND_DRINK", detailed: "FOOD_AND_DRINK_GROCERIES" }
    if (parsed && typeof parsed === 'object' && 'primary' in parsed) {
      const { primary, detailed } = parsed;

      // Try detailed mapping first (more specific)
      if (detailed && PLAID_DETAILED_MAP[detailed]) {
        return PLAID_DETAILED_MAP[detailed];
      }

      // Fall back to primary mapping
      if (primary && PLAID_PRIMARY_MAP[primary]) {
        return PLAID_PRIMARY_MAP[primary];
      }

      // Log unmapped categories for debugging
      console.log('Unmapped Plaid category:', { primary, detailed });
      return 'Other';
    }

    // Legacy format: ["Food and Drink", "Restaurants", "Fast Food"]
    if (Array.isArray(parsed) && parsed.length > 0) {
      const fullString = parsed.join(' ').toLowerCase();

      // Check for groceries first (important distinction from dining)
      if (fullString.includes('groceries') || fullString.includes('supermarket')) {
        return 'Groceries';
      }

      // Check primary category
      const primary = parsed[0].toLowerCase();
      if (LEGACY_CATEGORY_MAP[primary]) {
        return LEGACY_CATEGORY_MAP[primary];
      }

      // Partial matching
      for (const [key, value] of Object.entries(LEGACY_CATEGORY_MAP)) {
        if (primary.includes(key) || fullString.includes(key)) {
          return value;
        }
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
 * Format Plaid category for display
 * Converts the stored JSON to a human-readable string
 */
export function formatPlaidCategory(plaidCategory: string | null): string {
  if (!plaidCategory) return 'Uncategorized';

  try {
    const parsed = JSON.parse(plaidCategory);

    // New format: { primary: "FOOD_AND_DRINK", detailed: "FOOD_AND_DRINK_GROCERIES" }
    if (parsed && typeof parsed === 'object' && 'primary' in parsed) {
      const { primary, detailed } = parsed;

      // Format the detailed category nicely
      if (detailed) {
        // Convert FOOD_AND_DRINK_GROCERIES to "Groceries"
        const parts = detailed.split('_');
        // Find the index where the primary ends
        const primaryParts = primary.split('_');
        const detailParts = parts.slice(primaryParts.length);
        if (detailParts.length > 0) {
          return detailParts
            .map((p: string) => p.charAt(0) + p.slice(1).toLowerCase())
            .join(' ');
        }
      }

      // Fall back to formatting primary
      if (primary) {
        return primary
          .split('_')
          .map((p: string) => p.charAt(0) + p.slice(1).toLowerCase())
          .join(' ');
      }
    }

    // Legacy format: ["Food and Drink", "Restaurants", "Fast Food"]
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Return the most specific category (last in array)
      return parsed[parsed.length - 1];
    }

    return 'Uncategorized';
  } catch {
    return 'Uncategorized';
  }
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
