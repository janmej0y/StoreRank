import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function FormField({ label, error, children, id, hint }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-caption text-ink-400">{hint}</p>}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
            className="field-error flex items-center gap-1 overflow-hidden"
            role="alert"
          >
            <AlertCircle size={13} strokeWidth={2} className="shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
