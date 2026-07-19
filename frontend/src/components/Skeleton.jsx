export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-ink-100 px-5 py-5 last:border-0">
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="h-3.5 flex-1 rounded bg-ink-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse p-5">
      <div className="h-3 w-24 rounded bg-ink-100" />
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="h-7 w-16 rounded bg-ink-100" />
        <div className="h-6 w-16 rounded bg-ink-100" />
      </div>
      <div className="mt-3 h-3 w-20 rounded bg-ink-100" />
    </div>
  );
}

export function ActivityRowSkeleton({ rows = 4 }) {
  return (
    <div className="mt-4 animate-pulse space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 rounded bg-ink-100" style={{ width: `${65 + ((i * 13) % 25)}%` }} />
            <div className="h-2.5 w-16 rounded bg-ink-100" />
          </div>
          <div className="h-3.5 w-14 shrink-0 rounded-full bg-ink-100" />
        </div>
      ))}
    </div>
  );
}

export function BarRowSkeleton({ rows = 4 }) {
  return (
    <div className="mt-4 animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3.5 w-24 shrink-0 rounded bg-ink-100" />
          <div className="h-2 flex-1 rounded-full bg-ink-100" />
          <div className="h-3 w-8 shrink-0 rounded bg-ink-100" />
        </div>
      ))}
    </div>
  );
}

export function StackedRowSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card animate-pulse space-y-2.5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-16 rounded bg-ink-100" />
            <div className="h-3.5 w-24 rounded bg-ink-100" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-16 rounded bg-ink-100" />
            <div className="h-3.5 w-32 rounded bg-ink-100" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-16 rounded bg-ink-100" />
            <div className="h-3.5 w-20 rounded bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardListSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse p-5">
          <div className="h-4 w-3/4 rounded bg-ink-100" />
          <div className="mt-2 h-3 w-full rounded bg-ink-100" />
          <div className="mt-4 h-3 w-1/2 rounded bg-ink-100" />
          <div className="mt-5 h-8 w-full rounded bg-ink-100" />
        </div>
      ))}
    </div>
  );
}
