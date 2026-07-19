import { Check, X } from 'lucide-react';

const RULES = [
  { label: '8–16 characters', test: (v) => v.length >= 8 && v.length <= 16 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One special character', test: (v) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(v) },
];

export default function PasswordStrength({ value }) {
  if (!value) return null;

  const passed = RULES.filter((r) => r.test(value)).length;
  const barColor = passed <= 1 ? 'bg-danger-500' : passed === 2 ? 'bg-warning-500' : 'bg-success-500';

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < passed ? barColor : 'bg-ink-100'}`}
          />
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li key={rule.label} className={`flex items-center gap-1.5 text-caption ${ok ? 'text-success-700' : 'text-ink-400'}`}>
              {ok ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2} />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
