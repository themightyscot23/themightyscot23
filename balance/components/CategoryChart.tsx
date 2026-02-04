'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        <p className="text-gray-500 text-center py-8">No expense data for this month</p>
      </div>
    );
  }

  const chartData = data.slice(0, 10).map((item) => ({
    ...item,
    fill: CATEGORY_COLORS[item.category],
  }));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
          >
            <XAxis
              type="number"
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={95}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar
              dataKey="amount"
              radius={[0, 4, 4, 0]}
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

      {data.length > 10 && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Showing top 10 of {data.length} categories
        </p>
      )}
    </div>
  );
}
