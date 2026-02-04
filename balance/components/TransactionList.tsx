'use client';

import { Transaction, AppCategory, Account } from '@/lib/types';
import { TransactionRow, TransactionCard } from './TransactionRow';

interface TransactionListProps {
  transactions: (Transaction & { effective_category: AppCategory })[];
  onCategoryChange?: (id: string, category: AppCategory, merchantName: string | null) => void;
  loading?: boolean;
  showAccount?: boolean;
  accounts?: Account[];
  showPlaidCategory?: boolean;
}

export function TransactionList({
  transactions,
  onCategoryChange,
  loading,
  showAccount = false,
  accounts = [],
  showPlaidCategory = true,
}: TransactionListProps) {
  // Create account lookup map
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
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

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
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
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Category
              </th>
              {showAccount && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Account
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onCategoryChange={onCategoryChange}
                showAccount={showAccount}
                account={accountMap.get(transaction.account_id)}
                showPlaidCategory={showPlaidCategory}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onCategoryChange={onCategoryChange}
            showAccount={showAccount}
            account={accountMap.get(transaction.account_id)}
            showPlaidCategory={showPlaidCategory}
          />
        ))}
      </div>
    </div>
  );
}
