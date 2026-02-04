import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { PlaidItem, Account, Transaction, SyncState, CategoryRule } from './types';

// Database file path
const DB_PATH = path.join(process.cwd(), 'db', 'balance.db');
const SCHEMA_PATH = path.join(process.cwd(), 'db', 'schema.sql');

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get or create the database connection
 */
export function getDb(): Database.Database {
  if (!db) {
    // Ensure db directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema if needed
    initializeSchema();
  }
  return db;
}

/**
 * Initialize the database schema
 */
function initializeSchema(): void {
  if (!db) return;

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  // Run migrations for existing databases
  runMigrations();
}

/**
 * Run database migrations for existing databases
 */
function runMigrations(): void {
  if (!db) return;

  // Check if user_id column exists in plaid_items
  const tableInfo = db.prepare("PRAGMA table_info(plaid_items)").all() as { name: string }[];
  const hasUserIdColumn = tableInfo.some(col => col.name === 'user_id');

  if (!hasUserIdColumn) {
    console.log('Running migration: Adding user_id column to plaid_items...');
    // Add user_id column (nullable for migration)
    db.exec('ALTER TABLE plaid_items ADD COLUMN user_id TEXT');

    // Create index for the new column
    db.exec('CREATE INDEX IF NOT EXISTS idx_plaid_items_user ON plaid_items(user_id)');

    console.log('Migration complete: user_id column added to plaid_items');
  }
}

// ============ Plaid Items ============

export function createPlaidItem(item: Omit<PlaidItem, 'created_at'> & { user_id?: string }): PlaidItem {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO plaid_items (id, user_id, access_token, institution_id, institution_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(item.id, item.user_id || null, item.access_token, item.institution_id, item.institution_name);
  return getPlaidItem(item.id)!;
}

export function getPlaidItem(id: string): PlaidItem | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM plaid_items WHERE id = ?');
  return stmt.get(id) as PlaidItem | null;
}

export function getAllPlaidItems(userId?: string): PlaidItem[] {
  const db = getDb();
  if (userId) {
    const stmt = db.prepare('SELECT * FROM plaid_items WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as PlaidItem[];
  }
  const stmt = db.prepare('SELECT * FROM plaid_items ORDER BY created_at DESC');
  return stmt.all() as PlaidItem[];
}

export function deletePlaidItem(id: string, userId?: string): void {
  const db = getDb();
  if (userId) {
    const stmt = db.prepare('DELETE FROM plaid_items WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  } else {
    const stmt = db.prepare('DELETE FROM plaid_items WHERE id = ?');
    stmt.run(id);
  }
}

// ============ Accounts ============

export function createAccount(account: Account): Account {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO accounts (id, plaid_item_id, name, official_name, type, subtype, mask)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    account.id,
    account.plaid_item_id,
    account.name,
    account.official_name,
    account.type,
    account.subtype,
    account.mask
  );
  return account;
}

export function getAccount(id: string): Account | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM accounts WHERE id = ?');
  return stmt.get(id) as Account | null;
}

export function getAccountsByPlaidItem(plaidItemId: string): Account[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM accounts WHERE plaid_item_id = ?');
  return stmt.all(plaidItemId) as Account[];
}

export function getAllAccounts(userId?: string): (Account & { institution_name: string })[] {
  const db = getDb();
  if (userId) {
    const stmt = db.prepare(`
      SELECT a.*, p.institution_name
      FROM accounts a
      JOIN plaid_items p ON a.plaid_item_id = p.id
      WHERE p.user_id = ?
      ORDER BY p.institution_name, a.name
    `);
    return stmt.all(userId) as (Account & { institution_name: string })[];
  }
  // Fallback: return all accounts (for backwards compatibility)
  const stmt = db.prepare(`
    SELECT a.*, p.institution_name
    FROM accounts a
    JOIN plaid_items p ON a.plaid_item_id = p.id
    ORDER BY p.institution_name, a.name
  `);
  return stmt.all() as (Account & { institution_name: string })[];
}

// ============ Transactions ============

export function upsertTransaction(transaction: Omit<Transaction, 'created_at'>): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO transactions (id, account_id, date, merchant_name, name, amount, plaid_category, pending)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      date = excluded.date,
      merchant_name = excluded.merchant_name,
      name = excluded.name,
      amount = excluded.amount,
      plaid_category = excluded.plaid_category,
      pending = excluded.pending
  `);
  stmt.run(
    transaction.id,
    transaction.account_id,
    transaction.date,
    transaction.merchant_name,
    transaction.name,
    transaction.amount,
    transaction.plaid_category,
    transaction.pending ? 1 : 0
  );
}

export function deleteTransaction(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  stmt.run(id);
}

export function getTransaction(id: string): Transaction | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
  const row = stmt.get(id) as Transaction | null;
  if (row) {
    row.pending = Boolean(row.pending);
  }
  return row;
}

export function updateTransactionCategory(id: string, userCategory: string): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE transactions SET user_category = ? WHERE id = ?');
  stmt.run(userCategory, id);
}

export function getTransactions(options: {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Transaction[] {
  const db = getDb();

  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: (string | number)[] = [];

  if (options.startDate) {
    query += ' AND date >= ?';
    params.push(options.startDate);
  }
  if (options.endDate) {
    query += ' AND date <= ?';
    params.push(options.endDate);
  }
  if (options.accountId) {
    query += ' AND account_id = ?';
    params.push(options.accountId);
  }
  if (options.category) {
    query += ' AND (user_category = ? OR (user_category IS NULL AND plaid_category LIKE ?))';
    params.push(options.category, `%${options.category}%`);
  }
  if (options.search) {
    query += ' AND (merchant_name LIKE ? OR name LIKE ?)';
    params.push(`%${options.search}%`, `%${options.search}%`);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }
  if (options.offset) {
    query += ' OFFSET ?';
    params.push(options.offset);
  }

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as Transaction[];
  return rows.map((row) => ({ ...row, pending: Boolean(row.pending) }));
}

export function getTransactionsByMonth(yearMonth: string, userId?: string): Transaction[] {
  const db = getDb();
  if (userId) {
    const stmt = db.prepare(`
      SELECT t.* FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN plaid_items p ON a.plaid_item_id = p.id
      WHERE strftime('%Y-%m', t.date) = ? AND p.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC
    `);
    const rows = stmt.all(yearMonth, userId) as Transaction[];
    return rows.map((row) => ({ ...row, pending: Boolean(row.pending) }));
  }
  const stmt = db.prepare(`
    SELECT * FROM transactions
    WHERE strftime('%Y-%m', date) = ?
    ORDER BY date DESC, created_at DESC
  `);
  const rows = stmt.all(yearMonth) as Transaction[];
  return rows.map((row) => ({ ...row, pending: Boolean(row.pending) }));
}

export function getAvailableMonths(userId?: string): string[] {
  const db = getDb();
  if (userId) {
    const stmt = db.prepare(`
      SELECT DISTINCT strftime('%Y-%m', t.date) as month
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN plaid_items p ON a.plaid_item_id = p.id
      WHERE p.user_id = ?
      ORDER BY month DESC
    `);
    return (stmt.all(userId) as { month: string }[]).map((row) => row.month);
  }
  const stmt = db.prepare(`
    SELECT DISTINCT strftime('%Y-%m', date) as month
    FROM transactions
    ORDER BY month DESC
  `);
  return (stmt.all() as { month: string }[]).map((row) => row.month);
}

// ============ Sync State ============

export function getSyncState(plaidItemId: string): SyncState | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM sync_state WHERE plaid_item_id = ?');
  return stmt.get(plaidItemId) as SyncState | null;
}

export function updateSyncState(plaidItemId: string, cursor: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO sync_state (plaid_item_id, cursor, last_synced_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(plaid_item_id) DO UPDATE SET
      cursor = excluded.cursor,
      last_synced_at = excluded.last_synced_at
  `);
  stmt.run(plaidItemId, cursor);
}

// ============ Category Rules ============

export function createOrUpdateCategoryRule(merchantName: string, category: string): CategoryRule {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO category_rules (merchant_name, category)
    VALUES (?, ?)
    ON CONFLICT(merchant_name) DO UPDATE SET
      category = excluded.category,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(merchantName, category);
  return getCategoryRuleByMerchant(merchantName)!;
}

export function getCategoryRuleByMerchant(merchantName: string): CategoryRule | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM category_rules WHERE merchant_name = ?');
  return stmt.get(merchantName) as CategoryRule | null;
}

export function getAllCategoryRules(): CategoryRule[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM category_rules ORDER BY merchant_name');
  return stmt.all() as CategoryRule[];
}

export function deleteCategoryRule(id: number): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM category_rules WHERE id = ?');
  stmt.run(id);
}

export function findMatchingCategoryRule(merchantName: string | null, transactionName: string | null): CategoryRule | null {
  if (!merchantName && !transactionName) return null;

  const db = getDb();

  // Try exact match on merchant_name first
  if (merchantName) {
    const exactMatch = db.prepare('SELECT * FROM category_rules WHERE LOWER(merchant_name) = LOWER(?)').get(merchantName) as CategoryRule | null;
    if (exactMatch) return exactMatch;
  }

  // Try exact match on transaction name
  if (transactionName) {
    const nameMatch = db.prepare('SELECT * FROM category_rules WHERE LOWER(merchant_name) = LOWER(?)').get(transactionName) as CategoryRule | null;
    if (nameMatch) return nameMatch;
  }

  // Try partial match (merchant_name contains the rule or vice versa)
  if (merchantName) {
    const partialMatch = db.prepare(`
      SELECT * FROM category_rules
      WHERE LOWER(?) LIKE '%' || LOWER(merchant_name) || '%'
         OR LOWER(merchant_name) LIKE '%' || LOWER(?) || '%'
      LIMIT 1
    `).get(merchantName, merchantName) as CategoryRule | null;
    if (partialMatch) return partialMatch;
  }

  return null;
}

export function applyCategoriesToMatchingTransactions(merchantName: string, category: string): number {
  const db = getDb();
  // Update all transactions with this merchant that don't have a user category
  const stmt = db.prepare(`
    UPDATE transactions
    SET user_category = ?
    WHERE (LOWER(merchant_name) = LOWER(?) OR LOWER(name) = LOWER(?))
      AND user_category IS NULL
  `);
  const result = stmt.run(category, merchantName, merchantName);
  return result.changes;
}

// ============ Users & Sessions ============

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export function getUserFromSession(sessionToken: string): User | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT u.id, u.email, u.name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(sessionToken) as User | undefined;
  return result || null;
}
