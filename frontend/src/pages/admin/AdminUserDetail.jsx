import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { fetchAdminUserById } from '../../api/admin';
import PageBackground from '../../components/PageBackground';
import StarRating from '../../components/StarRating';
import { extractApiMessage } from '../../utils/validators';
import { formatDate } from '../../utils/formatDate';

const ROLE_BADGE = {
  ADMIN: 'badge bg-accent-100 text-accent-700',
  OWNER: 'badge bg-secondary-100 text-secondary-700',
  USER: 'badge bg-ink-100 text-ink-700',
};

const ROLE_LABEL = { ADMIN: 'Administrator', OWNER: 'Store Owner', USER: 'Normal User' };

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    fetchAdminUserById(id)
      .then(({ data: res }) => active && setData(res))
      .catch((err) => {
        if (!active) return;
        if (err?.response?.status === 404) setNotFound(true);
        else toast.error(extractApiMessage(err, 'Could not load user'));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="neutral" />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-caption font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft size={14} strokeWidth={2} />
        Back to users
      </Link>

      {loading && (
        <div className="card mt-4 animate-pulse p-6">
          <div className="h-5 w-40 rounded bg-ink-100" />
          <div className="mt-4 h-3 w-full rounded bg-ink-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-ink-100" />
        </div>
      )}

      {!loading && notFound && (
        <div className="card mt-4 p-6 text-body text-ink-600">User not found.</div>
      )}

      {!loading && data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card mt-4 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-accent-100 text-xl font-bold text-accent-700">
              {data.user.name?.trim().charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <span className="id-tag">[USER: {String(data.user.id).padStart(3, '0')}]</span>
              <h1 className="mt-1 text-page-title text-ink-900">{data.user.name}</h1>
              <span className={`${ROLE_BADGE[data.user.role]} mt-2`}>{ROLE_LABEL[data.user.role]}</span>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-caption font-medium uppercase tracking-wide text-ink-400">Email</dt>
              <dd className="mt-1 text-body text-ink-800">{data.user.email}</dd>
            </div>
            <div>
              <dt className="text-caption font-medium uppercase tracking-wide text-ink-400">Address</dt>
              <dd className="mt-1 text-body text-ink-800">{data.user.address}</dd>
            </div>
            <div>
              <dt className="text-caption font-medium uppercase tracking-wide text-ink-400">Joined</dt>
              <dd className="mt-1 text-body text-ink-800">{formatDate(data.user.createdAt)}</dd>
            </div>
          </dl>

          {data.user.role === 'OWNER' && (
            <div className="mt-6 border-t border-ink-100 pt-6">
              <h2 className="text-section-title text-ink-800">Store rating</h2>
              {data.storeRating ? (
                <div className="mt-3 flex items-center gap-4 rounded-card bg-ink-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-white shadow-card">
                    <Star size={18} strokeWidth={2} className="text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-medium text-ink-900">{data.storeRating.storeName}</p>
                    <p className="num text-caption text-ink-500">{data.storeRating.totalRatings} rating(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={data.storeRating.averageRating || 0} readOnly size={18} />
                    <span className="num text-body font-semibold text-ink-800">
                      {data.storeRating.averageRating ?? '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-body text-ink-500">This owner has no store assigned yet.</p>
              )}
            </div>
          )}
        </motion.div>
      )}
      </div>
    </div>
  );
}
