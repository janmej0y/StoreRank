import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import Modal from './Modal';
import useMediaQuery from '../hooks/useMediaQuery';

export default function FilterPanel({ activeCount = 0, onClear, hasActiveFilters, extraActions, children }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="card-flat flex flex-wrap items-end gap-4 p-5"
      >
        {children}
        {extraActions}
        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="btn-secondary h-[46px] shrink-0"
        >
          Clear filters
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <div className="card-flat flex items-center justify-between gap-3 p-3">
        <button type="button" onClick={() => setOpen(true)} className="btn-secondary relative">
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filters
          {activeCount > 0 && <span className="badge ml-1 bg-accent-100 text-accent-800">{activeCount}</span>}
        </button>
        {hasActiveFilters && (
          <button type="button" onClick={onClear} className="btn-ghost">
            Clear
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Filters">
        <div className="flex flex-col gap-4">
          {children}
          {extraActions}
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-ink-100 pt-4">
          <button type="button" onClick={onClear} disabled={!hasActiveFilters} className="btn-secondary">
            Clear filters
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn-accent">
            Done
          </button>
        </div>
      </Modal>
    </>
  );
}
