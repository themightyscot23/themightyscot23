'use client';

import { APP_CATEGORIES, CATEGORY_COLORS } from '@/lib/categories';
import { AppCategory } from '@/lib/types';

interface CategorySelectProps {
  value: AppCategory;
  onChange: (category: AppCategory) => void;
  className?: string;
}

export function CategorySelect({ value, onChange, className = '' }: CategorySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AppCategory)}
      className={`px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      style={{ borderLeftColor: CATEGORY_COLORS[value], borderLeftWidth: '4px' }}
    >
      {APP_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}

interface CategoryBadgeProps {
  category: AppCategory;
  onClick?: () => void;
}

export function CategoryBadge({ category, onClick }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {category}
    </span>
  );
}
