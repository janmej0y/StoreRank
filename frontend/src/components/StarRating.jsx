import { useState } from 'react';
import { motion } from 'framer-motion';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 20, busy = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  if (readOnly) {
    return (
      <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} filled={n <= Math.round(value)} size={size} />
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Rate this store from 1 to 5 stars"
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          disabled={busy}
          whileTap={{ scale: 0.85 }}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          onMouseEnter={() => setHovered(n)}
          onFocus={() => setHovered(n)}
          onBlur={() => setHovered(0)}
          onClick={() => onChange?.(n)}
        >
          <motion.span
            animate={n <= display ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
            className="inline-block"
          >
            <Star filled={n <= display} size={size} />
          </motion.span>
        </motion.button>
      ))}
    </div>
  );
}

function Star({ filled, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={filled ? '#f97316' : 'none'}
      stroke={filled ? '#f97316' : '#b8b8c2'}
      strokeWidth="1.4"
      strokeLinejoin="round"
    >
      <path d="M10 1.6l2.47 5.13 5.53.8-4 4.02.94 5.5L10 14.4l-4.94 2.65.94-5.5-4-4.02 5.53-.8L10 1.6z" />
    </svg>
  );
}
