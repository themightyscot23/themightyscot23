'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { CategorySpending, AppCategory } from '@/lib/types';
import { CATEGORY_COLORS } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  data: CategorySpending[];
  onCategoryClick?: (category: AppCategory) => void;
  loading?: boolean;
}

export function CategoryChart({ data, onCategoryClick, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-6 bg-gray-200 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income & Spending by Category</h3>
        <p className="text-gray-500 text-center py-8">No transaction data for this period</p>
      </div>
    );
  }

  // Separate income (negative) and expenses (positive)
  const incomeData = data.filter((item) => item.amount < 0);
  const expenseData = data.filter((item) => item.amount > 0);

  // Take top items from each, prioritizing showing both income and expenses
  const maxItems = 12;
  const incomeItems = incomeData.slice(0, Math.min(4, incomeData.length));
  const remainingSlots = maxItems - incomeItems.length;
  const expenseItems = expenseData.slice(0, remainingSlots);

  const chartData = [...incomeItems, ...expenseItems].map((item) => ({
    ...item,
    fill: CATEGORY_COLORS[item.category],
    // Add indicator for income vs expense
    isIncome: item.amount < 0,
  }));

  // Calculate domain for symmetrical display
  const maxExpense = Math.max(...expenseData.map((d) => d.amount), 0);
  const maxIncome = Math.max(...incomeData.map((d) => Math.abs(d.amount)), 0);
  const domainMax = Math.max(maxExpense, maxIncome);

  // Determine if we have both income and expenses
  const hasIncome = incomeData.length > 0;
  const hasExpenses = expenseData.length > 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Income & Spending by Category</h3>
        <div className="flex items-center gap-4 text-sm">
          {hasIncome && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: CATEGORY_COLORS['Income'] }} />
              <span className="text-gray-600">Income</span>
            </div>
          )}
          {hasExpenses && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-gray-600">Expenses</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 110, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={hasIncome && hasExpenses ? [-domainMax * 1.1, domainMax * 1.1] : undefined}
              tickFormatter={(value) => {
                const absValue = Math.abs(value);
                if (absValue >= 1000) {
                  return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(0)}k`;
                }
                return `${value < 0 ? '-' : ''}$${absValue.toLocaleString()}`;
              }}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={105}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            {hasIncome && hasExpenses && (
              <ReferenceLine x={0} stroke="#e5e7eb" strokeWidth={1} />
            )}
            <Tooltip
              formatter={(value: number) => [
                formatCurrency(Math.abs(value)),
                value < 0 ? 'Income' : 'Expense',
              ]}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar
              dataKey="amount"
              radius={4}
              onClick={(data) => onCategoryClick?.(data.category)}
              style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.length > maxItems && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Showing {chartData.length} of {data.length} categories
        </p>
      )}
    </div>
  );
}
