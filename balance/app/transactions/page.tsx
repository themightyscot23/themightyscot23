'use client';

import { useEffect, useState, useCallback } from 'react';
import { TransactionList } from '@/components/TransactionList';
import { MonthSelector } from '@/components/MonthSelector';
import { Transaction, AppCategory, Account } from '@/lib/types';
import { getCurrentYearMonth } from '@/lib/utils';
import { APP_CATEGORIES } from '@/lib/categories';

type TransactionType = 'all' | 'income' | 'expense';

export default function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<(Transaction & { effective_category: AppCategory })[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | ''>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAvailableMonths = async () => {
    const res = await fetch('/api/transactions?available_months=true');
    const data = await res.json();
    if (data.months && data.months.length > 0) {
      setAvailableMonths(data.months);
      if (!data.months.includes(selectedMonth)) {
        setSelectedMonth(data.months[0]);
      }
    }
  };

  const fetchAccounts = async () => {
    const res = await fetch('/api/plaid/accounts');
    const data = await res.json();
    setAccounts(data.accounts || []);
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?month=${selectedMonth}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  const handleCategoryChange = async (id: string, category: AppCategory) => {
    await fetch('/api/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_category: category }),
    });
    await fetchTransactions();
  };

  useEffect(() => {
    fetchAvailableMonths();
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, fetchTransactions]);

  // Apply all filters
  const filteredTransactions = transactions.filter((t) => {
    // Category filter
    if (categoryFilter && t.effective_category !== categoryFilter) {
      return false;
    }

    // Type filter (income = negative amounts in Plaid, expense = positive)
    if (typeFilter === 'income' && t.amount >= 0) {
      return false;
    }
    if (typeFilter === 'expense' && t.amount < 0) {
      return false;
    }

    // Account filter
    if (accountFilter && t.account_id !== accountFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesMerchant = t.merchant_name?.toLowerCase().includes(query);
      const matchesName = t.name?.toLowerCase().includes(query);
      if (!matchesMerchant && !matchesName) {
        return false;
      }
    }

    return true;
  });

  // Calculate totals for filtered transactions
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      if (t.amount < 0) {
        acc.income += Math.abs(t.amount);
      } else {
        acc.expenses += t.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and categorize your transactions</p>
        </div>

        <MonthSelector
          selectedMonth={selectedMonth}
          availableMonths={availableMonths}
          onChange={setSelectedMonth}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as AppCategory | '')}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {APP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          {accounts.length > 0 && (
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} {account.mask ? `••${account.mask}` : ''}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters */}
          {(categoryFilter || typeFilter !== 'all' || accountFilter || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setTypeFilter('all');
                setAccountFilter('');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-2xl font-bold text-green-600">
            ${totals.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ${totals.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <TransactionList
        transactions={filteredTransactions}
        onCategoryChange={handleCategoryChange}
        loading={loading}
        showAccount={!accountFilter}
        accounts={accounts}
      />
    </div>
  );
}
