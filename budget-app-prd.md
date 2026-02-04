# Personal Budget App - Product Requirements Document
## Phase 1: Foundation MVP

**Version:** 1.0  
**Last Updated:** February 4, 2026  
**Status:** Draft - Awaiting Review

---

## 1. Problem Statement

Modern budgeting apps (Mint, YNAB, Monarch, Copilot) solve a real problem—helping people understand where their money goes—but they come with baggage:
- **Mint:** Ad-heavy, sold user data, now discontinued
- **YNAB:** Excellent but requires manual entry philosophy and $99/year
- **Monarch/Copilot:** Great UX but $100+/year subscriptions

There's an opportunity to build a **personal, self-hosted budgeting tool** that:
1. Connects to real bank data via Plaid
2. Gives you full control over your financial data
3. Can be extended and customized to your needs

This Phase 1 focuses on proving the core concept: **Can we pull real transaction data and display it in a useful, categorized way?**

---

## 2. Target User

**Primary User:** You (the developer/owner)

For Phase 1, we're building for a single user with:
- At least one checking account
- At least one credit card
- A desire to see monthly spending patterns
- Technical comfort to run a local Next.js app

No multi-user support. No authentication. This is a personal tool first.

---

## 3. Success Criteria (Phase 1)

We'll know Phase 1 is successful when:

1. ✅ User can connect a Plaid sandbox account through the app
2. ✅ App displays all transactions from connected accounts
3. ✅ Transactions are categorized (using Plaid's categories initially)
4. ✅ User can see a monthly summary: total income, total expenses, net cash flow
5. ✅ User can see spending broken down by category
6. ✅ User can manually re-categorize a transaction and have it persist

---

## 4. Core User Stories

### US-1: Connect Bank Account
> As a user, I want to connect my bank account via Plaid so that I can see my transactions in the app.

**Acceptance Criteria:**
- Plaid Link opens in sandbox mode
- User can select a sandbox institution (use "First Platypus Bank" for testing)
- On success, access token is stored locally
- User sees confirmation that account is connected
- Connected account(s) appear in settings/account list

### US-2: View Transaction List
> As a user, I want to see a list of all my transactions so I can understand my spending.

**Acceptance Criteria:**
- Transactions display in reverse chronological order (newest first)
- Each transaction shows: date, merchant/description, amount, category
- Positive amounts (expenses) and negative amounts (income) are visually distinct
- List is scrollable/paginated for large datasets
- User can search/filter transactions by merchant name or category

### US-3: View Monthly Cash Flow Summary
> As a user, I want to see my monthly income vs expenses at a glance.

**Acceptance Criteria:**
- Dashboard shows current month by default
- Displays: Total Income, Total Expenses, Net Cash Flow (income - expenses)
- Net positive = green, net negative = red
- User can navigate to previous months (within available data)

### US-4: View Spending by Category
> As a user, I want to see how much I spent in each category so I can identify patterns.

**Acceptance Criteria:**
- Visual breakdown (bar chart or pie chart) of spending by category
- Categories sorted by spend amount (highest first)
- Clicking a category filters the transaction list to that category
- Only shows expense categories (not income)

### US-5: Re-categorize a Transaction
> As a user, I want to change a transaction's category when Plaid gets it wrong.

**Acceptance Criteria:**
- User can click/tap a transaction to edit it
- Category is selectable from a predefined list
- Change persists across page refreshes (stored in local DB)
- Original Plaid category is preserved (for debugging/reference)

### US-6: View Connected Accounts
> As a user, I want to see which accounts are connected and manage them.

**Acceptance Criteria:**
- Settings page shows all connected accounts
- Each account shows: institution name, account name, account type, last 4 digits (mask)
- User can disconnect an account (removes from app, but note: Plaid access token handling TBD)
- User can trigger a manual refresh of transactions

---

## 5. Functional Requirements

### 5.1 Plaid Integration

| Requirement | Description |
|-------------|-------------|
| FR-PLAID-01 | App uses Plaid Link SDK (React) in sandbox mode |
| FR-PLAID-02 | Backend creates link tokens via `/link/token/create` |
| FR-PLAID-03 | Backend exchanges public tokens via `/item/public_token/exchange` |
| FR-PLAID-04 | Backend fetches transactions via `/transactions/sync` (preferred) or `/transactions/get` |
| FR-PLAID-05 | Access tokens stored securely in local database |
| FR-PLAID-06 | App handles Plaid errors gracefully (displays user-friendly messages) |

### 5.2 Transaction Management

| Requirement | Description |
|-------------|-------------|
| FR-TXN-01 | Transactions synced from Plaid are stored locally |
| FR-TXN-02 | Each transaction stores: id, account_id, date, merchant_name, amount, plaid_category, user_category, pending |
| FR-TXN-03 | Duplicate transactions are detected and not re-inserted |
| FR-TXN-04 | User category overrides are stored separately from Plaid data |

### 5.3 Category System

| Requirement | Description |
|-------------|-------------|
| FR-CAT-01 | App uses a simplified category list (not Plaid's full hierarchy) |
| FR-CAT-02 | Plaid categories are mapped to app categories on import |
| FR-CAT-03 | User can override any transaction's category |
| FR-CAT-04 | Category list is predefined (not user-editable in Phase 1) |

**Proposed Category List (v1):**
- Income (paycheck, transfers in, refunds)
- Housing (rent, mortgage, utilities)
- Transportation (gas, parking, public transit, rideshare)
- Groceries
- Dining Out
- Shopping (retail, Amazon, general merchandise)
- Entertainment (streaming, movies, games, events)
- Health (pharmacy, doctor, gym)
- Travel (flights, hotels, vacation)
- Subscriptions (recurring services)
- Bills & Utilities (phone, internet, insurance)
- Personal Care (haircuts, beauty)
- Education
- Gifts & Donations
- Fees & Charges (bank fees, ATM fees)
- Transfer (internal transfers, Venmo/Zelle - often noise)
- Other / Uncategorized

### 5.4 Dashboard & Visualizations

| Requirement | Description |
|-------------|-------------|
| FR-DASH-01 | Dashboard shows summary for selected month |
| FR-DASH-02 | Month selector allows navigation to any month with data |
| FR-DASH-03 | Income/Expense/Net displayed prominently |
| FR-DASH-04 | Category breakdown shown as horizontal bar chart |
| FR-DASH-05 | Clicking category filters transaction list |

---

## 6. Non-Functional Requirements

| Requirement | Description |
|-------------|-------------|
| NFR-01 | App runs locally via `npm run dev` (Next.js) |
| NFR-02 | Data stored in SQLite (file-based, no external DB) |
| NFR-03 | Page loads under 2 seconds on localhost |
| NFR-04 | Mobile-responsive design (works on phone browser) |
| NFR-05 | No authentication required (single-user, local app) |
| NFR-06 | Environment variables for Plaid credentials (not hardcoded) |

---

## 7. Technical Architecture

```
budget-app/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Dashboard (home)
│   ├── transactions/
│   │   └── page.tsx          # Full transaction list
│   ├── settings/
│   │   └── page.tsx          # Account management
│   ├── api/
│   │   └── plaid/
│   │       ├── create-link-token/route.ts
│   │       ├── exchange-token/route.ts
│   │       ├── sync-transactions/route.ts
│   │       └── accounts/route.ts
│   └── layout.tsx            # App shell, nav
│
├── components/
│   ├── PlaidLinkButton.tsx   # Plaid Link integration
│   ├── TransactionList.tsx   # Reusable transaction table
│   ├── TransactionRow.tsx    # Single transaction display
│   ├── CategoryChart.tsx     # Spending breakdown viz
│   ├── CashFlowCard.tsx      # Income/Expense/Net summary
│   ├── MonthSelector.tsx     # Month navigation
│   └── CategorySelect.tsx    # Dropdown for recategorization
│
├── lib/
│   ├── plaid.ts              # Plaid client setup
│   ├── db.ts                 # SQLite connection (better-sqlite3 or Drizzle)
│   ├── categories.ts         # Category mapping logic
│   └── types.ts              # TypeScript interfaces
│
├── db/
│   ├── schema.sql            # Database schema
│   └── budget.db             # SQLite database file (gitignored)
│
├── .env.local                # Plaid credentials (gitignored)
└── package.json
```

### Database Schema (SQLite)

```sql
-- Plaid Items (connected institutions)
CREATE TABLE plaid_items (
  id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Connected Accounts
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  plaid_item_id TEXT NOT NULL,
  name TEXT,
  official_name TEXT,
  type TEXT,           -- depository, credit, etc.
  subtype TEXT,        -- checking, credit card, etc.
  mask TEXT,           -- last 4 digits
  FOREIGN KEY (plaid_item_id) REFERENCES plaid_items(id)
);

-- Transactions
CREATE TABLE transactions (
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
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Sync cursor for transactions/sync endpoint
CREATE TABLE sync_state (
  plaid_item_id TEXT PRIMARY KEY,
  cursor TEXT,
  last_synced_at DATETIME,
  FOREIGN KEY (plaid_item_id) REFERENCES plaid_items(id)
);
```

---

## 8. Out of Scope (Phase 1)

The following are explicitly **not included** in Phase 1:

| Feature | Reason | Target Phase |
|---------|--------|--------------|
| User authentication | Single-user local app for now | Phase 3 |
| Multi-user support | Adds complexity, not needed yet | Phase 3 |
| Budget targets/limits | Need to nail visualization first | Phase 2 |
| Recurring transaction detection | Nice-to-have, not core | Phase 2 |
| Custom category creation | Start with fixed list | Phase 2 |
| Bill reminders/alerts | Requires scheduling infra | Phase 3 |
| Goals/savings tracking | Separate feature set | Phase 3 |
| Investment account tracking | Plaid Investments is separate API | Phase 4+ |
| Data export (CSV, etc.) | Polish feature | Phase 2 |
| Dark mode | Polish feature | Phase 2 |
| Production Plaid (OAuth banks like Chase) | Requires senior approval + institutional onboarding; not feasible until prototype is validated | Phase 5+ (post-prototype) |

---

## 9. Plaid Sandbox Notes

### Test Credentials
Plaid sandbox provides test institutions. Use:
- **Institution:** First Platypus Bank (or any sandbox institution)
- **Username:** `user_good`
- **Password:** `pass_good`

### Sandbox Behavior
- Returns ~500+ sample transactions spanning several months
- Transactions are realistic but fake
- Categories are populated
- No rate limits (but don't abuse)

### Environment Variables Needed
```
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox
NEXT_PUBLIC_PLAID_ENV=sandbox
```

---

## 10. Open Questions & Risks

### Questions to Resolve

1. **Transaction sync strategy:** Use `/transactions/sync` (cursor-based, recommended) or `/transactions/get` (date-range)? 
   - **Recommendation:** Start with `/transactions/sync` — it's the modern approach and handles updates/deletes better.

2. **How to handle pending transactions?** Show them? Hide them? Flag them?
   - **Recommendation:** Show with visual indicator (dotted border, "pending" badge). They'll update on next sync.

3. **How to handle transfers between accounts?** (Shows as expense from checking, income to savings)
   - **Recommendation:** Auto-categorize as "Transfer" and potentially hide from spending totals. Decide after seeing real data.

4. **Category mapping complexity:** Plaid has 3-level categories. How deep do we go?
   - **Recommendation:** Map to top-level only for Phase 1. E.g., `["Food and Drink", "Restaurants", "Fast Food"]` → "Dining Out"

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Plaid category data is messy/inconsistent | High | Medium | Build flexible mapping; allow user override |
| SQLite doesn't scale | Low (Phase 1) | Low | Fine for single user; migrate to Postgres later if needed |
| Sandbox data doesn't represent real spending patterns | Medium | Low | Focus on UX and architecture; data fidelity matters less than flow |
| Scope creep into Phase 2 features | High | Medium | Strict adherence to "Out of Scope" list |
| Production Plaid OAuth approval takes months | High | Low (for now) | Explicitly out of scope; build for sandbox, validate with stakeholders, then pursue approval |

---

## 11. Milestones & Rough Sequencing

This is a suggested build order for Claude Code:

### Milestone 1: Project Setup
- [ ] Initialize Next.js 14 project (App Router, TypeScript, Tailwind)
- [ ] Set up SQLite with schema
- [ ] Configure environment variables
- [ ] Install dependencies (plaid-node, react-plaid-link, better-sqlite3 or drizzle-orm, recharts or similar)

### Milestone 2: Plaid Connection Flow
- [ ] Create link token API route
- [ ] Build PlaidLinkButton component
- [ ] Create token exchange API route
- [ ] Store access token and accounts in DB
- [ ] Settings page showing connected accounts

### Milestone 3: Transaction Sync
- [ ] Create transaction sync API route
- [ ] Fetch and store transactions
- [ ] Build category mapping utility
- [ ] Handle sync cursor persistence

### Milestone 4: Transaction List View
- [ ] TransactionList component
- [ ] Search/filter functionality
- [ ] Category badge display
- [ ] Transaction detail/edit modal

### Milestone 5: Dashboard
- [ ] CashFlowCard (income/expense/net)
- [ ] MonthSelector
- [ ] CategoryChart (spending breakdown)
- [ ] Click-to-filter interaction

### Milestone 6: Polish & Test
- [ ] Mobile responsiveness pass
- [ ] Error handling for all API routes
- [ ] Loading states
- [ ] Empty states
- [ ] Test with sandbox data end-to-end

### Stretch: Enhanced Sandbox Testing
- [ ] Test with multiple sandbox institutions simultaneously
- [ ] Validate edge cases (pending transactions, refunds, transfers)
- [ ] Stress test with full transaction history

*Note: Production Plaid with OAuth (required for Chase and other major banks) is out of scope for Phases 1-4. This requires senior approval and institutional onboarding that should only be pursued once we have a validated prototype.*

---

## 12. Design Notes

### Visual Style
- Clean, minimal, modern
- Use shadcn/ui components for consistency
- Tailwind CSS for styling
- Color palette: Neutral base with green (income/positive) and red (expense/negative) accents
- Card-based layout for dashboard widgets

### Key UI Patterns
- **Transactions:** Table on desktop, cards on mobile
- **Charts:** Horizontal bar chart for categories (easier to read labels)
- **Navigation:** Simple top nav or sidebar with 3 items: Dashboard, Transactions, Settings
- **Feedback:** Toast notifications for actions (sync complete, category updated, etc.)

---

## Appendix A: Plaid Category Mapping (Draft)

This maps Plaid's primary categories to our simplified list:

| Plaid Category | App Category |
|----------------|--------------|
| Income | Income |
| Transfer > Payroll | Income |
| Bank Fees | Fees & Charges |
| Cash Advance | Other |
| Community | Other |
| Food and Drink > Restaurants | Dining Out |
| Food and Drink > Groceries | Groceries |
| Food and Drink > * | Dining Out |
| Healthcare | Health |
| Interest | Income (if positive) / Fees (if negative) |
| Payment > Rent | Housing |
| Payment > * | Bills & Utilities |
| Recreation | Entertainment |
| Service > Subscription | Subscriptions |
| Service > * | Other |
| Shops > Supermarkets | Groceries |
| Shops > * | Shopping |
| Tax | Bills & Utilities |
| Transfer > Internal | Transfer |
| Transfer > * | Transfer |
| Travel > Airlines | Travel |
| Travel > Lodging | Travel |
| Travel > * | Transportation |
| Utilities | Bills & Utilities |

*Note: This will need refinement based on actual sandbox data.*

---

## Appendix B: Sample API Response Shapes

### Plaid Transaction Object (simplified)
```json
{
  "transaction_id": "abc123",
  "account_id": "xyz789",
  "date": "2026-01-15",
  "name": "UBER EATS",
  "merchant_name": "Uber Eats",
  "amount": 32.50,
  "category": ["Food and Drink", "Restaurants", "Fast Food"],
  "pending": false
}
```

### Our Stored Transaction
```json
{
  "id": "abc123",
  "account_id": "xyz789",
  "date": "2026-01-15",
  "merchant_name": "Uber Eats",
  "name": "UBER EATS",
  "amount": 32.50,
  "plaid_category": "[\"Food and Drink\", \"Restaurants\", \"Fast Food\"]",
  "user_category": null,
  "pending": false
}
```

---

**End of PRD**

---

*Ready for review. Let's discuss what to add, remove, or change before handing off to Claude Code.*
