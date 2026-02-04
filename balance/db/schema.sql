-- Balance Budget App - Database Schema
-- SQLite database schema for storing Plaid data and user preferences

-- Plaid Items (connected institutions)
CREATE TABLE IF NOT EXISTS plaid_items (
  id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Connected Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  plaid_item_id TEXT NOT NULL,
  name TEXT,
  official_name TEXT,
  type TEXT,           -- depository, credit, etc.
  subtype TEXT,        -- checking, credit card, etc.
  mask TEXT,           -- last 4 digits
  FOREIGN KEY (plaid_item_id) REFERENCES plaid_items(id) ON DELETE CASCADE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  date DATE NOT NULL,
  merchant_name TEXT,
  name TEXT,           -- Plaid's transaction name (fallback)
  amount REAL NOT NULL,
  plaid_category TEXT, -- JSON array from Plaid
  user_category TEXT,  -- User override (nullable)
  pending BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Sync cursor for transactions/sync endpoint
CREATE TABLE IF NOT EXISTS sync_state (
  plaid_item_id TEXT PRIMARY KEY,
  cursor TEXT,
  last_synced_at DATETIME,
  FOREIGN KEY (plaid_item_id) REFERENCES plaid_items(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_category);
CREATE INDEX IF NOT EXISTS idx_accounts_plaid_item ON accounts(plaid_item_id);
