import { motion } from 'framer-motion';
import Sparkline from './Sparkline';

export default function StatCard({ label, value, icon: Icon, delta, trend, emphasis }) {
  const hasTrend = Array.isArray(trend) && trend.length >= 2;
  const hasDelta = typeof delta === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card-hover card-flat p-6"
    >
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium uppercase tracking-wide text-ink-500">{label}</span>
        {Icon && (
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full ${
              emphasis ? 'bg-accent-50 text-accent-600' : 'bg-secondary-50 text-secondary-600'
            }`}
          >
            <Icon size={19} strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className={`stat-value ${emphasis ? 'text-accent-600' : ''}`}>{value}</div>
        {hasTrend && <Sparkline series={trend} color={emphasis ? '#f97316' : '#6d5df6'} />}
      </div>

      {hasDelta && (
        <p className="num mt-2 text-caption text-ink-500">
          <span className={delta > 0 ? 'font-medium text-success-700' : delta < 0 ? 'font-medium text-danger-700' : ''}>
            {delta > 0 ? '+' : ''}
            {delta}
          </span>{' '}
          this week
        </p>
      )}
    </motion.div>
  );
}
