'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear, getPreviousMonth, getNextMonth, getCurrentYearMonth } from '@/lib/utils';

interface MonthSelectorProps {
  selectedMonth: string;
  availableMonths: string[];
  onChange: (month: string) => void;
}

export function MonthSelector({ selectedMonth, availableMonths, onChange }: MonthSelectorProps) {
  const currentMonth = getCurrentYearMonth();
  const canGoNext = selectedMonth < currentMonth && availableMonths.includes(getNextMonth(selectedMonth));
  const canGoPrev = availableMonths.includes(getPreviousMonth(selectedMonth));

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(getPreviousMonth(selectedMonth))}
        disabled={!canGoPrev}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <select
        value={selectedMonth}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availableMonths.map((month) => (
          <option key={month} value={month}>
            {formatMonthYear(month)}
          </option>
        ))}
      </select>

      <button
        onClick={() => onChange(getNextMonth(selectedMonth))}
        disabled={!canGoNext}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
