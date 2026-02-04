'use client';

import { useEffect, useState, useCallback } from 'react';
import { TransactionList } from '@/components/TransactionList';
import { MonthSelector } from '@/components/MonthSelector';
import { Transaction, AppCategory } from '@/lib/types';
import { getCurrentYearMonth } from '@/lib/utils';
import { APP_CATEGORIES } from '@/lib/categories';

export default function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<(Transaction & { effective_category: AppCategory })[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | ''>('');

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
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, fetchTransactions]);

  const filteredTransactions = categoryFilter
    ? transactions.filter((t) => t.effective_category === categoryFilter)
    : transactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and categorize your transactions</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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

          <MonthSelector
            selectedMonth={selectedMonth}
            availableMonths={availableMonths}
            onChange={setSelectedMonth}
          />
        </div>
      </div>

      {/* Transactions List */}
      <TransactionList
        transactions={filteredTransactions}
        onCategoryChange={handleCategoryChange}
        loading={loading}
      />
    </div>
  );
}
