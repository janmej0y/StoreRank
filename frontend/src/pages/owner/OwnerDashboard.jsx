import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Star,
  TrendingUp,
  ShieldCheck,
  Pencil,
  Loader2,
  MessageSquare,
  ArrowUpDown,
} from 'lucide-react';
import { fetchOwnerDashboard, respondToRating, updateOwnerStore } from '../../api/owner';
import PageBackground from '../../components/PageBackground';
import { StatCardSkeleton, StackedRowSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import StarRating from '../../components/StarRating';
import { validateName, validateEmail, validateAddress, extractApiFieldErrors, extractApiMessage } from '../../utils/validators';
import { formatDate } from '../../utils/formatDate';

const SORT_OPTIONS = [
  { value: 'ratedAt', label: 'Date rated' },
  { value: 'name', label: 'Customer name' },
  { value: 'email', label: 'Customer email' },
  { value: 'rating', label: 'Rating' },
];

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [sortBy, setSortBy] = useState('ratedAt');
  const [order, setOrder] = useState('desc');

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
          {!loading && data?.store && (
            <button type="button" className="btn-secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={15} strokeWidth={2} />
              Edit store
            </button>
          )}
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-value">{data?.averageRating ?? '—'}</p>
                    <div className="mt-1">
                      <StarRating value={data?.averageRating || 0} readOnly size={15} />
                    </div>
                  </div>
                </div>
              </motion.div>

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
          <div className="mt-6 card-flat p-6">
            <h2 className="text-section-title text-ink-800">Ratings trend</h2>
            <p className="mt-0.5 text-caption text-ink-500">Ratings received per day, last 7 days.</p>
            {loading ? (
              <div className="mt-4 h-48 animate-pulse rounded-card bg-ink-100" />
            ) : hasTrend ? (
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.ratingsTrend.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="owner-trend-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDate(d).slice(0, 6)}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      labelFormatter={(d) => formatDate(d)}
                      formatter={(value) => [value, 'Ratings']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#owner-trend-gradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
                      isAnimationActive
                      animationDuration={600}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-body text-ink-500">Not enough ratings yet to show a trend.</p>
            )}
          </div>
        )}

        {(loading || data?.store) && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-section-title text-ink-800">Customer reviews</h2>
              <div className="flex items-center gap-2">
                <label htmlFor="owner-sort-by" className="sr-only">
                  Sort reviews by
                </label>
                <select
                  id="owner-sort-by"
                  className="input h-9 w-auto py-0 text-caption"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  className="btn-secondary h-9 w-9 p-0"
                  aria-label={order === 'asc' ? 'Sort ascending' : 'Sort descending'}
                  title={order === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <ArrowUpDown size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
            {loading ? (
              <StackedRowSkeleton rows={3} />
            ) : (
              <ReviewList reviews={data?.raters || []} onResponded={load} />
            )}
          </div>
        )}
      </div>

      <EditStoreModal
        open={editOpen}
        store={data?.store}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          load();
        }}
      />
    </div>
  );
}

function ReviewList({ reviews, onResponded }) {
  if (reviews.length === 0) {
    return (
      <div className="card p-2">
        <EmptyState title="No ratings yet" description="Once customers rate your store, their reviews will show up here." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <ReviewCard key={r.ratingId} review={r} onResponded={onResponded} />
      ))}
    </div>
  );
}

function ReviewCard({ review, onResponded }) {
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState(review.ownerResponse || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await respondToRating(review.ratingId, response.trim());
      toast.success(response.trim() ? 'Response saved' : 'Response removed');
      setResponding(false);
      onResponded();
    } catch (err) {
      toast.error(extractApiMessage(err, 'Could not save response'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-ink-900">{review.name}</p>
          <p className="text-caption text-ink-400">{review.email}</p>
        </div>
        <span className="text-caption text-ink-400" title={formatDate(review.ratedAt)}>
          {timeAgo(review.ratedAt)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <StarRating value={review.rating} readOnly size={14} />
        <span className="num text-caption text-ink-500">{review.rating}</span>
      </div>

      {review.comment && <p className="mt-2 text-body text-ink-700">{review.comment}</p>}

      {review.ownerResponse && !responding && (
        <div className="mt-3 rounded-input bg-ink-50 p-3">
          <p className="text-caption font-medium uppercase tracking-wide text-ink-400">Your response</p>
          <p className="mt-1 text-body text-ink-700">{review.ownerResponse}</p>
        </div>
      )}

      {!responding ? (
        <button
          type="button"
          onClick={() => {
            setResponse(review.ownerResponse || '');
            setResponding(true);
          }}
          className="link-action mt-3 inline-flex items-center gap-1 text-accent-600 hover:text-accent-700"
        >
          <MessageSquare size={13} strokeWidth={2} />
          {review.ownerResponse ? 'Edit response' : 'Respond'}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <textarea
            rows={2}
            maxLength={500}
            className="input resize-none"
            placeholder="Write a reply to this review…"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={submitting} className="btn-accent px-4 py-2 text-caption">
              {submitting && <Loader2 size={14} strokeWidth={2} className="animate-spin" />}
              Save
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-caption"
              onClick={() => {
                setResponding(false);
                setResponse(review.ownerResponse || '');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

function EditStoreModal({ open, store, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && store) {
      setForm({ name: store.name || '', email: store.email || '', address: store.address || '' });
      setErrors({});
    }
  }, [open, store]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    };
    Object.keys(next).forEach((k) => {
      if (!next[k]) delete next[k];
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await updateOwnerStore({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      });
      toast.success('Store updated');
      onSaved();
    } catch (err) {
      const fieldErrors = extractApiFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else toast.error(extractApiMessage(err, 'Could not update store'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit store">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Store name" id="edit-store-name" error={errors.name} hint="20–60 characters">
          <input
            id="edit-store-name"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={update('name')}
          />
        </FormField>

        <FormField label="Store email" id="edit-store-email" error={errors.email}>
          <input
            id="edit-store-email"
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            value={form.email}
            onChange={update('email')}
          />
        </FormField>

        <FormField label="Address" id="edit-store-address" error={errors.address} hint="Up to 400 characters">
          <textarea
            id="edit-store-address"
            rows={3}
            className={`input resize-none ${errors.address ? 'input-error' : ''}`}
            value={form.address}
            onChange={update('address')}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary max-sm:h-12" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-accent max-sm:h-12">
            {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
