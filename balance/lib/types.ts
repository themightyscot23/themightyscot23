// TypeScript interfaces for the Budget App

export interface PlaidItem {
  id: string;
  access_token: string;
  institution_id: string | null;
  institution_name: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  plaid_item_id: string;
  name: string | null;
  official_name: string | null;
  type: string | null;
  subtype: string | null;
  mask: string | null;
}

export interface Transaction {
  id: string;
  account_id: string;
  date: string;
  merchant_name: string | null;
  name: string | null;
  amount: number;
  plaid_category: string | null;
  user_category: string | null;
  pending: boolean;
  created_at: string;
}

export interface SyncState {
  plaid_item_id: string;
  cursor: string | null;
  last_synced_at: string | null;
}

// App-specific types
export type AppCategory =
  | 'Income'
  | 'Housing'
  | 'Transportation'
  | 'Groceries'
  | 'Dining Out'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Travel'
  | 'Subscriptions'
  | 'Bills & Utilities'
  | 'Personal Care'
  | 'Education'
  | 'Gifts & Donations'
  | 'Fees & Charges'
  | 'Transfer'
  | 'Other';

export interface CashFlowSummary {
  income: number;
  expenses: number;
  net: number;
}

export interface CategorySpending {
  category: AppCategory;
  amount: number;
  percentage: number;
}

export interface MonthlyData {
  month: string; // YYYY-MM format
  cashFlow: CashFlowSummary;
  categoryBreakdown: CategorySpending[];
  transactions: Transaction[];
}

export interface TransactionFilter {
  search?: string;
  category?: AppCategory;
  startDate?: string;
  endDate?: string;
  accountId?: string;
}

export interface CategoryRule {
  id: number;
  merchant_name: string;
  merchant_pattern: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}
