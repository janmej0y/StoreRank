import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, SlidersHorizontal } from 'lucide-react';
import { TableSkeleton, StackedRowSkeleton } from './Skeleton';
import EmptyState from './EmptyState';
import Modal from './Modal';
import useMediaQuery from '../hooks/useMediaQuery';

export default function SortableTable({
  columns,
  rows,
  sortBy,
  order,
  onSort,
  loading,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your filters or search terms.',
  getRowKey,
  footer,
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleSort = (key) => {
    if (sortBy === key) {
      onSort(key, order === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  if (!isDesktop) {
    return (
      <StackedTable
        columns={columns}
        rows={rows}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        loading={loading}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        getRowKey={getRowKey}
        footer={footer}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-table border border-ink-200 bg-white shadow-card">
      <div className="max-h-[calc(100vh-320px)] overflow-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-ink-200 bg-ink-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="bg-ink-50 px-3 py-3"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 text-caption font-semibold uppercase tracking-wide text-ink-500 hover:text-ink-800"
                    >
                      {col.label}
                      <SortIcon active={sortBy === col.key} direction={order} />
                    </button>
                  ) : (
                    <span className="text-caption font-semibold uppercase tracking-wide text-ink-500">
                      {col.label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              rows.map((row, i) => (
                <motion.tr
                  key={getRowKey(row)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02 }}
                  className={`border-b border-ink-100 transition-colors last:border-0 hover:bg-secondary-50/60 ${
                    i % 2 === 1 ? 'bg-ink-50/40' : 'bg-white'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-3 align-middle text-body text-ink-700 ${col.numeric ? 'num' : ''}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {loading && <TableSkeleton rows={6} cols={columns.length} />}

      {!loading && rows.length === 0 && (
        <div className="p-2">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}

      {!loading && rows.length > 0 && footer}
    </div>
  );
}

function StackedTable({
  columns,
  rows,
  sortBy,
  order,
  onSort,
  loading,
  emptyTitle,
  emptyDescription,
  getRowKey,
  footer,
}) {
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const sortableColumns = columns.filter((c) => c.sortable);
  const labeledColumns = columns.filter((c) => c.label);
  const actionColumns = columns.filter((c) => !c.label);
  const activeSortLabel = columns.find((c) => c.key === sortBy)?.label;

  return (
    <div className="space-y-3">
      {sortableColumns.length > 0 && (
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setSortSheetOpen(true)} className="btn-secondary">
            <SlidersHorizontal size={15} strokeWidth={2} />
            Sort: {activeSortLabel || 'Default'} {order === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      )}

      {loading && <StackedRowSkeleton rows={4} />}

      {!loading && rows.length === 0 && (
        <div className="card p-2">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}

      {!loading &&
        rows.map((row) => (
          <div key={getRowKey(row)} className="card-hover card space-y-2 p-4">
            {labeledColumns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-caption font-medium uppercase tracking-wide text-ink-400">
                  {col.label}
                </span>
                <span className={`min-w-0 flex-1 text-right text-body text-ink-800 ${col.numeric ? 'num' : ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
            {actionColumns.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-3">
                {actionColumns.map((col) => (
                  <div key={col.key}>{col.render ? col.render(row) : row[col.key]}</div>
                ))}
              </div>
            )}
          </div>
        ))}

      {!loading && rows.length > 0 && footer}

      <Modal open={sortSheetOpen} onClose={() => setSortSheetOpen(false)} title="Sort by">
        <div className="flex flex-col gap-1">
          {sortableColumns.map((col) => (
            <button
              key={col.key}
              type="button"
              onClick={() => {
                onSort(col.key);
                setSortSheetOpen(false);
              }}
              className={`flex items-center justify-between rounded-input px-3 py-2.5 text-left text-body transition-colors ${
                sortBy === col.key ? 'bg-accent-50 text-accent-800' : 'text-ink-700 hover:bg-ink-50'
              }`}
            >
              {col.label}
              {sortBy === col.key && <span>{order === 'asc' ? '↑' : '↓'}</span>}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function SortIcon({ active, direction }) {
  if (!active) return <ChevronsUpDown size={13} strokeWidth={2} className="text-ink-300" />;
  return direction === 'asc' ? (
    <ChevronUp size={13} strokeWidth={2.5} className="text-accent-600" />
  ) : (
    <ChevronDown size={13} strokeWidth={2.5} className="text-accent-600" />
  );
}
