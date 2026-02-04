'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Transaction, AppCategory } from '@/lib/types';
import { TransactionRow, TransactionCard } from './TransactionRow';

interface TransactionListProps {
  transactions: (Transaction & { effective_category: AppCategory })[];
  onCategoryChange?: (id: string, category: AppCategory) => void;
  loading?: boolean;
}

export function TransactionList({
  transactions,
  onCategoryChange,
  loading,
}: TransactionListProps) {
  const [search, setSearch] = useState('');

  const filteredTransactions = search
    ? transactions.filter(
        (t) =>
          t.merchant_name?.toLowerCase().includes(search.toLowerCase()) ||
          t.name?.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {search ? 'No transactions match your search' : 'No transactions found'}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onCategoryChange={onCategoryChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100 p-4 space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onCategoryChange={onCategoryChange}
              />
            ))}
          </div>
        </>
      )}

      <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
        {filteredTransactions.length} transaction
        {filteredTransactions.length !== 1 ? 's' : ''}
        {search && ` matching "${search}"`}
      </div>
    </div>
  );
}
