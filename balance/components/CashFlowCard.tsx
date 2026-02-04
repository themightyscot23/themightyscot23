'use client';

import { formatCurrency } from '@/lib/utils';
import { CashFlowSummary } from '@/lib/types';

interface CashFlowCardProps {
  cashFlow: CashFlowSummary;
  loading?: boolean;
}

export function CashFlowCard({ cashFlow, loading }: CashFlowCardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Income</p>
        <p className="text-2xl font-bold text-income mt-1">
          {formatCurrency(cashFlow.income)}
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Expenses</p>
        <p className="text-2xl font-bold text-expense mt-1">
          {formatCurrency(cashFlow.expenses)}
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Net Cash Flow</p>
        <p
          className={`text-2xl font-bold mt-1 ${
            cashFlow.net >= 0 ? 'text-income' : 'text-expense'
          }`}
        >
          {cashFlow.net >= 0 ? '+' : ''}
          {formatCurrency(cashFlow.net)}
        </p>
      </div>
    </div>
  );
}
