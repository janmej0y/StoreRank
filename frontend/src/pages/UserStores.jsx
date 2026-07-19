import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Store as StoreIcon } from 'lucide-react';
import { fetchStores, rateStore } from '../api/stores';
import StarRating from '../components/StarRating';
import { CardListSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';
import PageBackground from '../components/PageBackground';
import { extractApiMessage } from '../utils/validators';
import { formatDate } from '../utils/formatDate';
import { getStoreCategory } from '../utils/storeCategory';
import { getStoreImage } from '../utils/storeImages';
import StoreDetailsModal from '../components/StoreDetailsModal';

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'address', label: 'Address' },
  { value: 'rating', label: 'Overall rating' },
  { value: 'createdAt', label: 'Date added' },
];

const filterDefs = [
  { name: 'name', label: 'Search by name', placeholder: 'Store name' },
  { name: 'address', label: 'Search by address', placeholder: 'City, street…' },
];

const PAGE_SIZE = 9;

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState(null);
  const [openStoreId, setOpenStoreId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchStores({
      ...filters,
      createdFrom: dateRange.from || undefined,
      createdTo: dateRange.to || undefined,
      sortBy,
      order,
      page,
      pageSize: PAGE_SIZE,
    })
      .then(({ data }) => {
        setStores(data.items);
        setPagination(data.pagination);
      })
      .catch((err) => toast.error(extractApiMessage(err, 'Could not load stores')))
      .finally(() => setLoading(false));
  }, [filters, dateRange, sortBy, order, page]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filters, dateRange, sortBy, order]);

  const handleRate = async (storeId, rating) => {
    setSavingId(storeId);
    try {
      const { data } = await rateStore(storeId, rating);
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId
            ? { ...s, myRating: data.myRating, averageRating: data.averageRating, totalRatings: data.totalRatings }
            : s
        )
      );
      toast.success('Rating submitted');
    } catch (err) {
      toast.error(extractApiMessage(err, 'Could not submit rating'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="orangePurple" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="label-micro">Shop / Stores</p>
        <h1 className="mt-1 text-page-title text-ink-900">Stores</h1>
        <p className="mt-1 text-body text-ink-500">Browse registered stores and share your rating.</p>
      </motion.div>

      <div className="mt-6">
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
          onReset={() => {
            setFilters({});
            setDateRange({ from: '', to: '' });
          }}
          order={order}
          onToggleOrder={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          dateRange={{ ...dateRange, onChange: setDateRange }}
          sortSelect={{ value: sortBy, options: sortOptions, onChange: setSortBy }}
        />
      </div>

      <div className="mt-6">
        {loading && <CardListSkeleton count={6} />}

        {!loading && stores.length === 0 && (
          <EmptyState title="No stores found" description="Try adjusting your search, or check back later." />
        )}

        {!loading && stores.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store, i) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.04 }}
                >
                  <StoreCard
                    store={store}
                    busy={savingId === store.id}
                    onRate={(rating) => handleRate(store.id, rating)}
                    onOpenDetails={() => setOpenStoreId(store.id)}
                  />
                </motion.div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="card mt-4">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <StoreDetailsModal
        storeId={openStoreId}
        open={openStoreId != null}
        onClose={() => setOpenStoreId(null)}
      />
      </div>
    </div>
  );
}

function StoreImage({ store, category }) {
  const [loaded, setLoaded] = useState(false);
  const imageUrl = getStoreImage(store, category);

  if (!imageUrl) {
    return (
      <div
        className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-card"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(249,115,22,0.16), transparent 60%), ' +
            'radial-gradient(circle at bottom right, rgba(109,93,246,0.16), transparent 60%), ' +
            'linear-gradient(135deg, #fff7f3 0%, #f8f7ff 100%)',
        }}
      >
        <StoreIcon size={28} strokeWidth={1.5} className="text-ink-400" />
        <span className="text-caption font-medium text-ink-400">{category}</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card bg-ink-100">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-ink-100" />}
      <img
        src={imageUrl}
        alt={category}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

function StoreCard({ store, busy, onRate, onOpenDetails }) {
  const category = getStoreCategory(store.name);

  return (
    <div className="card-hover card group flex flex-col p-4">
      <button type="button" onClick={onOpenDetails} className="block text-left">
        <StoreImage store={store} category={category} />
      </button>

      <div className="mt-4 flex-1">
        <button type="button" onClick={onOpenDetails} className="group/link block text-left">
          <h3 className="text-section-title text-ink-900 group-hover/link:text-accent-600">{store.name}</h3>
        </button>
        <p className="mt-0.5 flex items-center gap-1 text-caption text-ink-500">
          <MapPin size={12} strokeWidth={2} className="shrink-0" />
          <span className="line-clamp-1">{store.address}</span>
        </p>
      </div>

      <p className="mt-3 text-caption text-ink-400">Added {formatDate(store.createdAt)}</p>

      <div className="mt-4 flex items-center gap-2">
        <StarRating value={store.averageRating || 0} readOnly size={16} />
        <span className="num text-caption text-ink-500">
          {store.averageRating ?? 'No ratings'} {store.totalRatings > 0 && `(${store.totalRatings})`}
        </span>
      </div>

      <div className="mt-4 border-t border-ink-100 pt-4">
        <p className="text-caption font-medium uppercase tracking-wide text-ink-400">
          {store.myRating ? 'Your rating' : 'Rate this store'}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <StarRating value={store.myRating || 0} onChange={onRate} busy={busy} size={22} />
          {busy && <span className="text-caption text-ink-400">Saving…</span>}
        </div>
        <button
          type="button"
          onClick={onOpenDetails}
          className="link-action mt-3 inline-flex items-center gap-1 text-accent-600 hover:text-accent-700"
        >
          View details &amp; reviews
          <ArrowRight size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
