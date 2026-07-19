import { Calendar } from 'lucide-react';

export default function DateRangeFilter({ from, to, onChange, fromLabel = 'From', toLabel = 'To' }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
      <div className="w-full sm:w-auto sm:min-w-[150px]">
        <label htmlFor="date-range-from" className="label">
          {fromLabel}
        </label>
        <div className="relative">
          <Calendar
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            id="date-range-from"
            type="date"
            className="input h-[46px] pl-9"
            value={from || ''}
            max={to || undefined}
            onChange={(e) => onChange({ from: e.target.value, to })}
          />
        </div>
      </div>
      <div className="w-full sm:w-auto sm:min-w-[150px]">
        <label htmlFor="date-range-to" className="label">
          {toLabel}
        </label>
        <div className="relative">
          <Calendar
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            id="date-range-to"
            type="date"
            className="input h-[46px] pl-9"
            value={to || ''}
            min={from || undefined}
            onChange={(e) => onChange({ from, to: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
