import { Loader2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'default',
  submitting = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-body text-ink-600">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary max-sm:h-12" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onConfirm}
          className={`max-sm:h-12 ${tone === 'danger' ? 'btn-danger' : 'btn-accent'}`}
        >
          {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
          {submitting ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
