import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, Star, Loader2, X, Store as StoreIcon } from 'lucide-react';
import { fetchStoreById, rateStore } from '../api/stores';
import { useAuth } from '../context/AuthContext';
import useMediaQuery from '../hooks/useMediaQuery';
import StarRating from './StarRating';
import { getStoreCategory } from '../utils/storeCategory';
import { getStoreImage } from '../utils/storeImages';

const CATEGORY_EMOJI = {
  'Coffee Shop': '☕',
  Restaurant: '🍽️',
  Bookstore: '📚',
  'Electronics Store': '💻',
  'Hardware Store': '🔧',
  'Clothing Store': '👕',
  'Furniture Store': '🛋️',
  'Jewelry Store': '💎',
  'Grocery Store': '🥦',
  Bakery: '🥐',
  Pharmacy: '💊',
  Gym: '🏋️',
  Salon: '💇',
  'Handicrafts & Gifts': '🎁',
  'General Store': '🏬',
};

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

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function cityOf(address) {
  if (!address) return null;
  const parts = address.split(',').map((p) => p.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
}

export default function StoreDetailsModal({ storeId, open, onClose }) {
  const { user } = useAuth();
  const isAdminView = user?.role === 'ADMIN';
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const dragControls = useDragControls();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRating, setPendingRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const load = useCallback(() => {
    if (!storeId) return;
    setLoading(true);
    fetchStoreById(storeId)
      .then(({ data: res }) => {
        setData(res);
        setPendingRating(res.myRating || 0);
        setComment(res.myComment || '');
      })
      .catch(() => toast.error('Could not load store'))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    if (open && storeId) load();
  }, [open, storeId, load]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pendingRating) {
      toast.error('Select a star rating first');
      return;
    }
    setSubmitting(true);
    try {
      await rateStore(storeId, pendingRating, comment.trim());
      toast.success('Rating submitted');
      load();
    } catch {
      toast.error('Could not submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const store = data?.store;
  const category = store ? getStoreCategory(store.name) : null;
  const imageUrl = store ? getStoreImage(store, category) : null;
  const emoji = category ? CATEGORY_EMOJI[category] || '🏬' : '🏬';
  const reviews = data?.reviews || [];

  const panelMotion = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.95, y: 24 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 24 },
        transition: { duration: 0.22, ease: 'easeOut' },
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { type: 'tween', duration: 0.28, ease: 'easeOut' },
        drag: 'y',
        dragListener: false,
        dragControls,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.4 },
        onDragEnd: (_e, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        },
      };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 max-md:items-end max-md:p-0"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(249,115,22,.08), transparent 40%), ' +
              'radial-gradient(circle at bottom right, rgba(109,93,246,.08), transparent 40%), ' +
              'rgba(15,23,42,.35)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={onClose}
          aria-hidden="true"
        >
          <motion.div
            {...panelMotion}
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-modal-title"
            className="relative z-10 flex max-h-[85vh] w-full max-w-[820px] flex-col overflow-hidden rounded-modal bg-white max-md:max-h-[90vh] max-md:rounded-b-none max-md:rounded-t-modal"
            style={{ boxShadow: '0 30px 80px rgba(15,23,42,.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex touch-none justify-center pb-1 pt-2.5 md:hidden"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span className="h-1 w-10 rounded-full bg-ink-200" aria-hidden="true" />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-card hover:bg-ink-100 hover:text-ink-800"
            >
              <X size={18} strokeWidth={2} />
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto">
            {loading || !store ? (
              <div className="animate-pulse space-y-4 p-5 sm:p-8">
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 rounded-panel bg-ink-100 sm:h-[120px] sm:w-[120px]" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-6 w-2/3 rounded bg-ink-100" />
                    <div className="h-3 w-1/2 rounded bg-ink-100" />
                    <div className="h-3 w-1/3 rounded bg-ink-100" />
                  </div>
                </div>
                <div className="h-24 rounded-table bg-ink-100" />
                <div className="h-32 rounded-panel bg-ink-100" />
              </div>
            ) : (
              <div className="p-5 sm:p-8">
                {/* Header */}
                <div className="flex flex-wrap items-start gap-4 pr-10 sm:gap-5 sm:pr-8">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={category}
                      className="h-20 w-20 shrink-0 rounded-panel object-cover shadow-card sm:h-[120px] sm:w-[120px]"
                    />
                  ) : (
                    <div
                      className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-panel shadow-card sm:h-[120px] sm:w-[120px]"
                      style={{
                        background:
                          'radial-gradient(circle at top left, rgba(249,115,22,.16), transparent 60%), ' +
                          'radial-gradient(circle at bottom right, rgba(109,93,246,.16), transparent 60%), ' +
                          'linear-gradient(135deg, #fff7f3 0%, #f8f7ff 100%)',
                      }}
                    >
                      <StoreIcon size={28} strokeWidth={1.5} className="text-ink-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 id="store-modal-title" className="text-xl font-bold leading-tight text-ink-900 sm:text-[28px]">
                      {store.name}
                    </h2>
                    <p className="mt-1.5 flex items-start gap-1.5 text-body text-ink-500">
                      <MapPin size={15} strokeWidth={2} className="mt-0.5 shrink-0" />
                      <span>{store.address}</span>
                    </p>
                    <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-caption font-medium text-accent-700">
                      {emoji} {category}
                    </span>
                    <div className="mt-3 flex items-center gap-2">
                      <StarRating value={data.averageRating || 0} readOnly size={20} />
                      <span className="num text-section-title text-ink-900">{data.averageRating ?? '—'}</span>
                      <span className="text-caption text-ink-500">
                        ({data.totalRatings} Review{data.totalRatings === 1 ? '' : 's'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick info chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {cityOf(store.address) && (
                    <Chip>
                      <MapPin size={12} strokeWidth={2} /> {cityOf(store.address)}
                    </Chip>
                  )}
                  <Chip>
                    {emoji} {category}
                  </Chip>
                  <Chip>
                    <Star size={12} strokeWidth={2} fill="currentColor" /> {data.averageRating ?? '—'}
                  </Chip>
                  <Chip>👥 {data.totalRatings} Reviews</Chip>
                </div>

                {/* Your rating */}
                {!isAdminView && (
                  <div className="mt-8">
                    <h3 className="text-section-title text-ink-900">Your Rating</h3>
                    <div className="mt-3">
                      <StarRating value={pendingRating} onChange={setPendingRating} busy={submitting} size={36} />
                    </div>

                    <form id="store-rating-form" onSubmit={handleSubmit} className="mt-5">
                      <div className="rounded-table border border-ink-200 bg-white p-4 transition focus-within:border-accent-300 focus-within:ring-2 focus-within:ring-accent-100">
                        <textarea
                          ref={textareaRef}
                          rows={2}
                          maxLength={500}
                          className="max-h-48 w-full resize-none border-0 bg-transparent p-0 text-body text-ink-800 outline-none placeholder:text-ink-400"
                          placeholder="Share your experience..."
                          value={comment}
                          onChange={(e) => {
                            setComment(e.target.value);
                            autoResize();
                          }}
                        />
                        <p className="mt-1 text-right text-caption text-ink-400">{comment.length}/500</p>
                      </div>
                    </form>

                    <div className="mt-5 flex items-center gap-3 max-md:hidden">
                      <button
                        type="submit"
                        form="store-rating-form"
                        disabled={submitting}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-input bg-gradient-to-r from-blue-500 to-blue-600 text-body font-semibold text-white shadow-button transition hover:-translate-y-0.5 hover:shadow-dropdown disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:flex-none sm:px-8"
                      >
                        {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
                        {data.myRating ? 'Update Rating' : 'Submit Rating'}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="h-12 rounded-input border border-ink-200 px-6 text-body font-medium text-ink-600 transition hover:bg-ink-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent reviews */}
                <div className="mt-8 border-t border-ink-100 pt-6">
                  <h3 className="text-section-title text-ink-900">Recent Reviews</h3>

                  {reviews.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-panel border border-dashed border-ink-200 bg-ink-50/50 px-6 py-10 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-400 shadow-card">
                        <Star size={18} strokeWidth={1.75} />
                      </div>
                      <p className="text-body text-ink-500">Be the first to review this store.</p>
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-1">
                      {reviews.map((r, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(i, 6) * 0.04 }}
                          className="flex gap-3 rounded-panel p-3 transition hover:bg-ink-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-secondary-500 text-sm font-semibold text-white">
                            {initialsOf(r.userName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <span className="font-medium text-ink-900">{r.userName}</span>
                              <div className="flex items-center gap-2">
                                <StarRating value={r.rating} readOnly size={13} />
                                <span className="text-caption text-ink-400" title={r.ratedAt}>
                                  {timeAgo(r.ratedAt)}
                                </span>
                              </div>
                            </div>
                            {r.comment && <p className="mt-1 text-body text-ink-600">{r.comment}</p>}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            </div>

            {!loading && store && !isAdminView && (
              <div
                className="flex items-center gap-3 border-t border-ink-100 bg-white p-4 md:hidden"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                <button
                  type="submit"
                  form="store-rating-form"
                  disabled={submitting}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-input bg-gradient-to-r from-blue-500 to-blue-600 text-body font-semibold text-white shadow-button transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
                  {data.myRating ? 'Update Rating' : 'Submit Rating'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 rounded-input border border-ink-200 px-6 text-body font-medium text-ink-600 transition hover:bg-ink-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-caption text-ink-600">
      {children}
    </span>
  );
}
