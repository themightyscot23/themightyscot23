'use client';

import { useState } from 'react';
import { Transaction, AppCategory } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CategoryBadge, CategorySelect } from './CategorySelect';

interface TransactionRowProps {
  transaction: Transaction & { effective_category: AppCategory };
  onCategoryChange?: (id: string, category: AppCategory) => void;
}

export function TransactionRow({ transaction, onCategoryChange }: TransactionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isIncome = transaction.amount < 0;
  const displayAmount = Math.abs(transaction.amount);
  const displayName = transaction.merchant_name || transaction.name || 'Unknown';

  const handleCategoryChange = async (category: AppCategory) => {
    setSaving(true);
    try {
      await onCategoryChange?.(transaction.id, category);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <tr className={`hover:bg-gray-50 ${transaction.pending ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {formatDate(transaction.date)}
        {transaction.pending && (
          <span className="ml-2 text-xs text-yellow-600 font-medium">Pending</span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
          {displayName}
        </div>
      </td>

      <td className="px-4 py-3">
        {isEditing ? (
          <CategorySelect
            value={transaction.effective_category}
            onChange={handleCategoryChange}
            className={saving ? 'opacity-50' : ''}
          />
        ) : (
          <CategoryBadge
            category={transaction.effective_category}
            onClick={() => setIsEditing(true)}
          />
        )}
      </td>

      <td
        className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${
          isIncome ? 'text-income' : 'text-gray-900'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(displayAmount)}
      </td>
    </tr>
  );
}

// Mobile card version
export function TransactionCard({ transaction, onCategoryChange }: TransactionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isIncome = transaction.amount < 0;
  const displayAmount = Math.abs(transaction.amount);
  const displayName = transaction.merchant_name || transaction.name || 'Unknown';

  const handleCategoryChange = async (category: AppCategory) => {
    setSaving(true);
    try {
      await onCategoryChange?.(transaction.id, category);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 ${
        transaction.pending ? 'opacity-60' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
          <p className="text-xs text-gray-500">
            {formatDate(transaction.date)}
            {transaction.pending && (
              <span className="ml-2 text-yellow-600 font-medium">Pending</span>
            )}
          </p>
        </div>
        <p
          className={`text-sm font-semibold ${
            isIncome ? 'text-income' : 'text-gray-900'
          }`}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(displayAmount)}
        </p>
      </div>

      <div>
        {isEditing ? (
          <CategorySelect
            value={transaction.effective_category}
            onChange={handleCategoryChange}
            className={`w-full ${saving ? 'opacity-50' : ''}`}
          />
        ) : (
          <CategoryBadge
            category={transaction.effective_category}
            onClick={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
}
