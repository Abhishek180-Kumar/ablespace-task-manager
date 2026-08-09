'use client';

import { useState, useRef, useEffect } from 'react';

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const today = new Date();
  const selected = value ? new Date(value) : null;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const selectDate = (d: number) => {
    const iso = new Date(year, month, d).toISOString().split('T')[0];
    onChange(iso);
    setOpen(false);
  };

  const display = value
    ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <span className={display ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>{display || placeholder}</span>
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-2 w-64 rounded-md border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(viewDate)}
            </span>
            <button type="button" onClick={nextMonth} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {cells.map((d, idx) => {
              if (!d) return <div key={`e-${idx}`} className="py-1" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
              const isSelected = selected?.getFullYear() === year && selected.getMonth() === month && selected.getDate() === d;
              void dateStr;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => selectDate(d)}
                  className={`py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isSelected ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : isToday ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="mt-2 w-full rounded-md border border-gray-200 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
