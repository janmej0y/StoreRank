import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchStoreById, rateStore } from '../api/stores';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import EmptyState from '../components/EmptyState';
import PageBackground from '../components/PageBackground';
import { extractApiMessage } from '../utils/validators';
import { formatDate } from '../utils/formatDate';

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

export default function StoreDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdminView = user?.role === 'ADMIN';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pendingRating, setPendingRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setNotFound(false);
    fetchStoreById(id)
      .then(({ data: res }) => {
        setData(res);
        setPendingRating(res.myRating || 0);
        setComment(res.myComment || '');
      })
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
        else toast.error(extractApiMessage(err, 'Could not load store'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!pendingRating) {
      toast.error('Select a star rating first');
      return;
    }
    setSubmitting(true);
    try {
      await rateStore(id, pendingRating, comment.trim());
      toast.success('Review submitted');
      load();
    } catch (err) {
      toast.error(extractApiMessage(err, 'Could not submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = isAdminView ? '/admin/stores' : '/stores';
  const backLabel = isAdminView ? 'Back to stores' : 'Back to stores';

  if (loading) {
    return (
      <div className="relative min-h-full overflow-hidden">
        <PageBackground variant="orangePurple" />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="card animate-pulse p-6">
            <div className="h-6 w-64 rounded bg-ink-100" />
            <div className="mt-3 h-3 w-full rounded bg-ink-100" />
            <div className="mt-2 h-3 w-2/3 rounded bg-ink-100" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="relative min-h-full overflow-hidden">
        <PageBackground variant="orangePurple" />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <EmptyState title="Store not found" description="This store may have been removed or deactivated." />
        </div>
      </div>
    );
  }

  const { store, averageRating, totalRatings, distribution, reviews } = data;

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="orangePurple" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to={backLink} className="inline-flex items-center gap-1 text-caption font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft size={14} strokeWidth={2} />
        {backLabel}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card mt-4 p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="id-tag">[STORE: {String(store.id).padStart(3, '0')}]</span>
            <h1 className="mt-1 text-page-title text-ink-900">{store.name}</h1>
            <p className="mt-1 text-body text-ink-500">{store.address}</p>
          </div>
          {!store.isActive && <span className="badge bg-ink-100 text-ink-500">Inactive</span>}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <StarRating value={averageRating || 0} readOnly size={22} />
          <span className="num text-section-title text-ink-900">{averageRating ?? '—'}</span>
          <span className="num text-caption text-ink-500">
            {totalRatings} rating{totalRatings === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-6 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="num w-10 shrink-0 text-caption text-ink-500">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-accent-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="num w-8 shrink-0 text-right text-caption text-ink-400">{count}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {!isAdminView && (
        <div className="card mt-4 p-6">
          <h2 className="text-section-title text-ink-800">
            {data.myRating ? 'Update your review' : 'Write a review'}
          </h2>
          <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
            <div>
              <span className="label">Your rating</span>
              <StarRating value={pendingRating} onChange={setPendingRating} busy={submitting} size={26} />
            </div>
            <div>
              <label htmlFor="review-comment" className="label">
                Comment (optional)
              </label>
              <textarea
                id="review-comment"
                rows={3}
                maxLength={500}
                className="input resize-none"
                placeholder="Share details about your experience…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="mt-1 text-right text-caption text-ink-400">{comment.length}/500</p>
            </div>
            <button type="submit" disabled={submitting} className="btn-accent w-full max-sm:h-12 sm:w-auto">
              {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
              {submitting ? 'Submitting…' : data.myRating ? 'Update review' : 'Submit review'}
            </button>
          </form>
        </div>
      )}

      <div className="card mt-4 p-6">
        <h2 className="text-section-title text-ink-800">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-body text-ink-500">No reviews yet — be the first to rate this store.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100">
            {reviews.map((r, i) => (
              <li key={i} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink-900">{r.userName}</span>
                  <span className="text-caption text-ink-400" title={formatDate(r.ratedAt)}>
                    {timeAgo(r.ratedAt)}
                  </span>
                </div>
                <div className="mt-1.5">
                  <StarRating value={r.rating} readOnly size={14} />
                </div>
                {r.comment && <p className="mt-2 text-body text-ink-600">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
}
