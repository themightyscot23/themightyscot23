'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { CashFlowCard } from '@/components/CashFlowCard';
import { MonthSelector } from '@/components/MonthSelector';
import { CategoryChart } from '@/components/CategoryChart';
import { TransactionList } from '@/components/TransactionList';
import { PlaidLinkButton } from '@/components/PlaidLinkButton';
import { CashFlowSummary, CategorySpending, Transaction, AppCategory, Account } from '@/lib/types';
import { getCurrentYearMonth } from '@/lib/utils';

interface MonthlySummary {
  months: string[];
  cashFlow: CashFlowSummary;
  categoryBreakdown: CategorySpending[];
  transactionCount: number;
}

export default function Dashboard() {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([getCurrentYearMonth()]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [transactions, setTransactions] = useState<(Transaction & { effective_category: AppCategory })[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | null>(null);

  const fetchAvailableMonths = async () => {
    const res = await fetch('/api/transactions?available_months=true');
    const data = await res.json();
    if (data.months && data.months.length > 0) {
      setAvailableMonths(data.months);
      // Select most recent month if current selection has no data
      const hasValidSelection = selectedMonths.some((m) => data.months.includes(m));
      if (!hasValidSelection) {
        setSelectedMonths([data.months[0]]);
      }
    }
  };

  const fetchMonthlyData = useCallback(async () => {
    setLoading(true);
    try {
      const monthsParam = selectedMonths.join(',');
      const [summaryRes, transactionsRes] = await Promise.all([
        fetch(`/api/transactions?months=${monthsParam}&summary=true`),
        fetch(`/api/transactions?months=${monthsParam}`),
      ]);

      const summaryData = await summaryRes.json();
      const transactionsData = await transactionsRes.json();

      setSummary(summaryData);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonths]);

  const checkAccounts = async () => {
    const res = await fetch('/api/plaid/accounts');
    const data = await res.json();
    const accountsList = data.accounts || [];
    setAccounts(accountsList);
    setHasAccounts(accountsList.length > 0);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/plaid/sync-transactions', { method: 'POST' });
      await fetchAvailableMonths();
      await fetchMonthlyData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleCategoryChange = async (id: string, category: AppCategory) => {
    await fetch('/api/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_category: category }),
    });
    await fetchMonthlyData();
  };

  const handleAccountConnected = async () => {
    await checkAccounts();
    await fetchAvailableMonths();
    await fetchMonthlyData();
  };

  const handleCategoryClick = (category: AppCategory) => {
    setCategoryFilter(category);
  };

  const clearCategoryFilter = () => {
    setCategoryFilter(null);
  };

  // Filter transactions by selected category
  const filteredTransactions = categoryFilter
    ? transactions.filter((t) => t.effective_category === categoryFilter)
    : transactions;

  useEffect(() => {
    checkAccounts();
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    if (hasAccounts) {
      fetchMonthlyData();
    }
  }, [selectedMonths, hasAccounts, fetchMonthlyData]);

  // Show connect prompt if no accounts
  if (hasAccounts === false) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Balance
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Connect your bank account to start tracking your spending and see where your money goes.
        </p>
        <PlaidLinkButton onSuccess={handleAccountConnected} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {selectedMonths.length === 1
              ? 'Your monthly financial overview'
              : `Financial overview for ${selectedMonths.length} months`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MonthSelector
            selectedMonths={selectedMonths}
            availableMonths={availableMonths}
            onChange={setSelectedMonths}
          />
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <CashFlowCard
        cashFlow={summary?.cashFlow || { income: 0, expenses: 0, net: 0 }}
        loading={loading}
      />

      {/* Income & Spending by Category - Full Width */}
      <CategoryChart
        data={summary?.categoryBreakdown || []}
        loading={loading}
        onCategoryClick={handleCategoryClick}
      />

      {/* Transactions - Full Width */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Transactions ({filteredTransactions.length})
          </h3>
          {categoryFilter && (
            <button
              onClick={clearCategoryFilter}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              {categoryFilter}
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
          <TransactionList
            transactions={filteredTransactions}
            onCategoryChange={handleCategoryChange}
            loading={loading}
            showAccount={true}
            accounts={accounts}
          />
        </div>
      </div>
    </div>
  );
}
