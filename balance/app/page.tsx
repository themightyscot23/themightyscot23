'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { CashFlowCard } from '@/components/CashFlowCard';
import { MonthSelector } from '@/components/MonthSelector';
import { CategoryChart } from '@/components/CategoryChart';
import { TransactionList } from '@/components/TransactionList';
import { PlaidLinkButton } from '@/components/PlaidLinkButton';
import { CashFlowSummary, CategorySpending, Transaction, AppCategory } from '@/lib/types';
import { getCurrentYearMonth } from '@/lib/utils';

interface MonthlySummary {
  month: string;
  cashFlow: CashFlowSummary;
  categoryBreakdown: CategorySpending[];
  transactionCount: number;
}

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [transactions, setTransactions] = useState<(Transaction & { effective_category: AppCategory })[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null);

  const fetchAvailableMonths = async () => {
    const res = await fetch('/api/transactions?available_months=true');
    const data = await res.json();
    if (data.months && data.months.length > 0) {
      setAvailableMonths(data.months);
      // Select most recent month if current month has no data
      if (!data.months.includes(selectedMonth)) {
        setSelectedMonth(data.months[0]);
      }
    }
  };

  const fetchMonthlyData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        fetch(`/api/transactions?month=${selectedMonth}&summary=true`),
        fetch(`/api/transactions?month=${selectedMonth}`),
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
  }, [selectedMonth]);

  const checkAccounts = async () => {
    const res = await fetch('/api/plaid/accounts');
    const data = await res.json();
    setHasAccounts(data.accounts && data.accounts.length > 0);
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

  useEffect(() => {
    checkAccounts();
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    if (hasAccounts) {
      fetchMonthlyData();
    }
  }, [selectedMonth, hasAccounts, fetchMonthlyData]);

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
          <p className="text-gray-600">Your monthly financial overview</p>
        </div>

        <div className="flex items-center gap-3">
          <MonthSelector
            selectedMonth={selectedMonth}
            availableMonths={availableMonths}
            onChange={setSelectedMonth}
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

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryChart
          data={summary?.categoryBreakdown || []}
          loading={loading}
        />

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transactions ({transactions.length})
          </h3>
          <div className="max-h-[600px] overflow-y-auto">
            <TransactionList
              transactions={transactions}
              onCategoryChange={handleCategoryChange}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
