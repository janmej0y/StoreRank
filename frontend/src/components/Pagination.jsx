import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageList(page, totalPages) {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let prev;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (prev) {
      if (i - prev === 2) rangeWithDots.push(prev + 1);
      else if (i - prev > 2) rangeWithDots.push('…');
    }
    rangeWithDots.push(i);
    prev = i;
  }

  return rangeWithDots;
}

export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageList(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-5 py-4">
      <p className="num text-caption text-ink-500">
        Page <span className="font-semibold text-ink-800">{page}</span> of {totalPages}
        {typeof total === 'number' && <span className="text-ink-400"> · {total} total</span>}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="btn-secondary gap-1 px-3 py-1.5"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={15} strokeWidth={2} />
          Previous
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`dots-${i}`} className="px-1.5 text-caption text-ink-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`num flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  p === page
                    ? 'bg-secondary-500 text-white shadow-button'
                    : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className="btn-secondary gap-1 px-3 py-1.5"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
