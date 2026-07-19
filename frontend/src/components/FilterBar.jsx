import { Search, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import DateRangeFilter from './DateRangeFilter';
import FilterPanel from './FilterPanel';

export default function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  order,
  onToggleOrder,
  dateRange,
  sortSelect,
}) {
  const activeCount =
    Object.values(values).filter((v) => v).length + (dateRange && (dateRange.from || dateRange.to) ? 1 : 0);
  const hasActiveFilters = activeCount > 0;

  const chips = [
    ...filters
      .filter((f) => values[f.name])
      .map((f) => ({
        key: f.name,
        label: f.type === 'select' ? f.options.find((o) => o.value === values[f.name])?.label : values[f.name],
        onRemove: () => onChange(f.name, ''),
      })),
    ...(dateRange && (dateRange.from || dateRange.to)
      ? [
          {
            key: '__dateRange',
            label: [dateRange.from, dateRange.to].filter(Boolean).join(' → '),
            onRemove: () => dateRange.onChange({ from: '', to: '' }),
          },
        ]
      : []),
  ];

  const orderToggle = onToggleOrder && (
    <button
      type="button"
      className="btn-secondary h-[46px] shrink-0 gap-1.5 px-3"
      onClick={onToggleOrder}
      aria-label={order === 'asc' ? 'Sort ascending' : 'Sort descending'}
      title={order === 'asc' ? 'Ascending' : 'Descending'}
    >
      <ArrowUpDown size={15} strokeWidth={2} />
      {order === 'asc' ? 'Asc' : 'Desc'}
    </button>
  );

  return (
    <div className="space-y-3">
      <FilterPanel
        activeCount={activeCount}
        hasActiveFilters={hasActiveFilters}
        onClear={onReset}
        extraActions={orderToggle}
      >
        {filters.map((f) => (
          <div key={f.name} className="min-w-[160px] flex-1">
            <label htmlFor={`filter-${f.name}`} className="label">
              {f.label}
            </label>
            {f.type === 'select' ? (
              <div className="relative">
                <select
                  id={`filter-${f.name}`}
                  className="input h-[46px] appearance-none pr-9 transition-shadow hover:shadow-card"
                  value={values[f.name] || ''}
                  onChange={(e) => onChange(f.name, e.target.value)}
                >
                  <option value="">All</option>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
              </div>
            ) : (
              <div className="relative">
                <Search
                  size={15}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  id={`filter-${f.name}`}
                  type="text"
                  className="input h-[46px] pl-9"
                  placeholder={f.placeholder || `Search by ${f.label.toLowerCase()}`}
                  value={values[f.name] || ''}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
        {dateRange && <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={dateRange.onChange} />}
        {sortSelect && (
          <div className="min-w-[160px]">
            <label htmlFor="filter-sort-by" className="label">
              Sort by
            </label>
            <div className="relative">
              <select
                id="filter-sort-by"
                className="input h-[46px] appearance-none pr-9 transition-shadow hover:shadow-card"
                value={sortSelect.value}
                onChange={(e) => sortSelect.onChange(e.target.value)}
              >
                {sortSelect.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                strokeWidth={2}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
            </div>
          </div>
        )}
      </FilterPanel>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span key={chip.key} className="chip">
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="rounded-full p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label={`Remove filter: ${chip.label}`}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
