'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CategorySpending, AppCategory, Transaction } from '@/lib/types';
import { CATEGORY_COLORS } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  data: CategorySpending[];
  transactions?: (Transaction & { effective_category?: AppCategory })[];
  onCategoryClick?: (category: AppCategory) => void;
  loading?: boolean;
}

export function CategoryChart({ data, transactions = [], onCategoryClick, loading }: CategoryChartProps) {
  // Compute income by date from transactions
  const incomeByDate = useMemo(() => {
    const dateMap = new Map<string, number>();

    transactions.forEach((txn) => {
      // Income is negative in Plaid
      if (txn.amount < 0) {
        const dateKey = txn.date;
        const current = dateMap.get(dateKey) || 0;
        dateMap.set(dateKey, current + Math.abs(txn.amount));
      }
    });

    // Convert to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, amount]) => ({
        date,
        amount,
        label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // Compute spending by category (only positive amounts = expenses)
  const spendingByCategory = useMemo(() => {
    return data
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-80 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
            <div className="h-80 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const hasIncome = incomeByDate.length > 0;
  const hasSpending = spendingByCategory.length > 0;

  if (!hasIncome && !hasSpending) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income & Spending</h3>
        <p className="text-gray-500 text-center py-8">No transaction data for this period</p>
      </div>
    );
  }

  // Calculate shared Y-axis max for consistent scale
  const maxIncome = incomeByDate.length > 0 ? Math.max(...incomeByDate.map((d) => d.amount)) : 0;
  const maxSpending = spendingByCategory.length > 0 ? Math.max(...spendingByCategory.map((d) => d.amount)) : 0;
  const sharedMax = Math.max(maxIncome, maxSpending) * 1.1; // Add 10% padding

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Date - Left Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Date</h3>
          {hasIncome ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeByDate}
                  margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                >
                  <XAxis
                    dataKey="label"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    domain={[0, sharedMax]}
                    tickFormatter={formatYAxis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Income']}
                    labelFormatter={(label) => `Date: ${label}`}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No income data for this period
            </div>
          )}
        </div>

        {/* Spending by Category - Right Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          {hasSpending ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spendingByCategory}
                  margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                >
                  <XAxis
                    dataKey="category"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    domain={[0, sharedMax]}
                    tickFormatter={formatYAxis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => onCategoryClick?.(data.category)}
                    style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
                  >
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#f97316'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No spending data for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
