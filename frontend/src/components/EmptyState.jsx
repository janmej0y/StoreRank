import { SearchX } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink-400 shadow-card">
        <SearchX size={20} strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-section-title text-ink-800">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-body text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
