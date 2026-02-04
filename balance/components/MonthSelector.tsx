'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';
import { formatMonthYear, getPreviousMonth, getNextMonth, getCurrentYearMonth } from '@/lib/utils';

type SelectionMode = 'single' | 'range';

interface MonthSelectorProps {
  selectedMonths: string[];
  availableMonths: string[];
  onChange: (months: string[]) => void;
}

export function MonthSelector({ selectedMonths, availableMonths, onChange }: MonthSelectorProps) {
  const [mode, setMode] = useState<SelectionMode>('single');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentMonth = getCurrentYearMonth();
  const primaryMonth = selectedMonths[0] || currentMonth;

  const canGoNext = primaryMonth < currentMonth && availableMonths.includes(getNextMonth(primaryMonth));
  const canGoPrev = availableMonths.includes(getPreviousMonth(primaryMonth));

  const handleSingleMonthChange = (month: string) => {
    onChange([month]);
  };

  const handlePrevMonth = () => {
    if (mode === 'single') {
      onChange([getPreviousMonth(primaryMonth)]);
    }
  };

  const handleNextMonth = () => {
    if (mode === 'single') {
      onChange([getNextMonth(primaryMonth)]);
    }
  };

  const handleMultiMonthToggle = (month: string) => {
    if (selectedMonths.includes(month)) {
      // Don't allow deselecting the last month
      if (selectedMonths.length > 1) {
        onChange(selectedMonths.filter((m) => m !== month));
      }
    } else {
      onChange([...selectedMonths, month].sort((a, b) => b.localeCompare(a)));
    }
  };

  const handleModeChange = (newMode: SelectionMode) => {
    setMode(newMode);
    if (newMode === 'single' && selectedMonths.length > 1) {
      // Keep only the most recent month when switching to single mode
      onChange([selectedMonths[0]]);
    }
    setIsDropdownOpen(false);
  };

  const getDisplayText = () => {
    if (selectedMonths.length === 1) {
      return formatMonthYear(selectedMonths[0]);
    }
    if (selectedMonths.length === 2) {
      return `${formatMonthYear(selectedMonths[1])} - ${formatMonthYear(selectedMonths[0])}`;
    }
    return `${selectedMonths.length} months selected`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Mode toggle */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleModeChange('single')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            mode === 'single'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Single month"
        >
          1M
        </button>
        <button
          onClick={() => handleModeChange('range')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            mode === 'range'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Multiple months"
        >
          <Calendar className="w-3 h-3" />
        </button>
      </div>

      {mode === 'single' ? (
        // Single month selector with arrows
        <>
          <button
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <select
            value={primaryMonth}
            onChange={(e) => handleSingleMonthChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthYear(month)}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      ) : (
        // Multi-month selector dropdown
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-left flex items-center justify-between"
          >
            <span>{getDisplayText()}</span>
            <ChevronRight
              className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* Dropdown */}
              <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
                {availableMonths.map((month) => {
                  const isSelected = selectedMonths.includes(month);
                  return (
                    <button
                      key={month}
                      onClick={() => handleMultiMonthToggle(month)}
                      className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span>{formatMonthYear(month)}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
