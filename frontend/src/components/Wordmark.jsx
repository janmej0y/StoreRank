const SIZES = {
  sm: { store: 'text-sm', rank: 'text-sm' },
  lg: { store: 'text-xl', rank: 'text-xl' },
};

export default function Wordmark({ size = 'sm', tone = 'light', className = '' }) {
  const isDark = tone === 'dark';
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight ${className}`}>
      <span className={`${s.store} ${isDark ? 'text-white' : 'text-ink-900'}`}>Store</span>
      <span className={`${s.rank} text-accent-500`}>Rank</span>
    </span>
  );
}
