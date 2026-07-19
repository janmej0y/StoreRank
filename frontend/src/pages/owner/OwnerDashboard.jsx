import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { fetchOwnerDashboard } from '../../api/owner';
import PageBackground from '../../components/PageBackground';
import { StatCardSkeleton } from '../../components/Skeleton';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';
import Sparkline from '../../components/Sparkline';
import { extractApiMessage } from '../../utils/validators';
import { formatDate } from '../../utils/formatDate';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const load = useCallback(() => {
    setLoading(true);
    fetchOwnerDashboard({ sortBy, order })
      .then(({ data: res }) => setData(res))
      .catch((err) => toast.error(extractApiMessage(err, 'Could not load dashboard')))
      .finally(() => setLoading(false));
  }, [sortBy, order]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <StarRating value={r.rating} readOnly size={16} />
          <span className="num text-caption text-ink-500">{r.rating}</span>
        </div>
      ),
    },
    {
      key: 'ratedAt',
      label: 'Rated on',
      sortable: true,
      numeric: true,
      render: (r) => <span className="text-caption text-ink-500">{formatDate(r.ratedAt)}</span>,
    },
  ];

  const hasTrend = Array.isArray(data?.ratingsTrend?.series) && data.ratingsTrend.series.length >= 2;

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="warm" />

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-accent-50 text-accent-600">
              <Star size={20} strokeWidth={2} fill="currentColor" />
            </span>
            <div>
              <h1 className="text-page-title text-ink-900">Store Owner Dashboard</h1>
              <p className="mt-0.5 text-body text-ink-500">
                {data?.store ? data.store.name : 'Performance overview for your store.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Average Rating */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="card-hover flex h-[150px] flex-col justify-between rounded-card border border-ink-100 bg-white p-6"
                style={{ boxShadow: '0 8px 30px rgba(15,23,42,0.05)' }}
              >
                <span className="text-caption font-medium uppercase tracking-wide text-ink-500">
                  Average Rating
                </span>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="stat-value">{data?.averageRating ?? '—'}</p>
                    <div className="mt-1">
                      <StarRating value={data?.averageRating || 0} readOnly size={15} />
                    </div>
                  </div>
                  {hasTrend && <Sparkline series={data.ratingsTrend.series} color="#f97316" />}
                </div>
              </motion.div>

              {/* Total Ratings */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="card-hover flex h-[150px] flex-col justify-between rounded-card border border-ink-100 bg-white p-6"
                style={{ boxShadow: '0 8px 30px rgba(15,23,42,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption font-medium uppercase tracking-wide text-ink-500">
                    Total Ratings
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                    <TrendingUp size={19} strokeWidth={2} />
                  </span>
                </div>
                <div>
                  <p className="stat-value text-accent-600">{data?.totalRatings ?? 0}</p>
                  {typeof data?.ratingsTrend?.delta === 'number' && (
                    <p className="num mt-1 text-caption text-ink-500">
                      <span className="font-medium text-success-700">
                        {data.ratingsTrend.delta > 0 ? '+' : ''}
                        {data.ratingsTrend.delta}
                      </span>{' '}
                      this week
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Store Status */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="card-hover flex h-[150px] flex-col justify-between rounded-card border border-ink-100 bg-white p-6"
                style={{ boxShadow: '0 8px 30px rgba(15,23,42,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption font-medium uppercase tracking-wide text-ink-500">
                    Store Status
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-50 text-success-600">
                    <ShieldCheck size={19} strokeWidth={2} />
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-success-600">
                    {data?.store ? 'Active' : 'Unassigned'}
                  </p>
                  <p className="mt-1 text-caption text-ink-500">
                    {data?.store
                      ? 'Your store is visible to users.'
                      : 'No store is linked to your account yet.'}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {!loading && !data?.store && (
          <div className="card mt-6 p-6 text-body text-ink-600">
            No store is currently assigned to your account. Contact an administrator to get one linked.
          </div>
        )}

        {(loading || data?.store) && (
          <div className="mt-6 space-y-4">
            <h2 className="text-section-title text-ink-800">Customers who rated your store</h2>
            <SortableTable
              columns={columns}
              rows={data?.raters || []}
              sortBy={sortBy}
              order={order}
              onSort={(key, dir) => {
                setSortBy(key);
                setOrder(dir);
              }}
              loading={loading}
              getRowKey={(r) => r.userId}
              emptyTitle="No ratings yet"
              emptyDescription="Once customers rate your store, they'll show up here."
            />
          </div>
        )}
      </div>
    </div>
  );
}
