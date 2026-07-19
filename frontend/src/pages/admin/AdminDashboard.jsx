import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Users, Store, Star, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchAdminDashboard } from '../../api/admin';
import PageBackground from '../../components/PageBackground';
import StatCard from '../../components/StatCard';
import { StatCardSkeleton, ActivityRowSkeleton, BarRowSkeleton } from '../../components/Skeleton';
import StarRating from '../../components/StarRating';
import { extractApiMessage } from '../../utils/validators';
import { formatDateTime } from '../../utils/formatDate';

const ROLE_LABEL = { ADMIN: 'Admins', OWNER: 'Store Owners', USER: 'Normal Users' };
const ROLE_COLOR = { ADMIN: '#111827', OWNER: '#f97316', USER: '#6d5df6' };
const TILE_COLORS = [
  'bg-accent-100 text-accent-700',
  'bg-secondary-100 text-secondary-700',
  'bg-success-100 text-success-700',
];

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminDashboard()
      .then(({ data }) => {
        if (active) setStats(data);
      })
      .catch((err) => toast.error(extractApiMessage(err, 'Could not load dashboard')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const roleTotal = stats?.roleBreakdown
    ? Object.values(stats.roleBreakdown).reduce((sum, n) => sum + n, 0)
    : 0;

  const rolePieData = stats?.roleBreakdown
    ? Object.entries(stats.roleBreakdown)
        .filter(([, count]) => count > 0)
        .map(([role, count]) => ({ name: ROLE_LABEL[role], value: count, role }))
    : [];

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="purple" />

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="label-micro">Admin / Dashboard</p>
            <h1 className="mt-1 text-page-title text-ink-900">Dashboard</h1>
            <p className="mt-1 text-body text-ink-500">Overview of your platform.</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link to="/admin/users" className="btn-secondary max-sm:h-12 max-sm:flex-1">
              Manage users
            </Link>
            <Link to="/admin/stores" className="btn-accent max-sm:h-12 max-sm:flex-1">
              Manage stores
            </Link>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Total users"
                value={stats?.totalUsers ?? 0}
                icon={Users}
                delta={stats?.trends?.users?.delta}
                trend={stats?.trends?.users?.series}
              />
              <StatCard
                label="Total stores"
                value={stats?.totalStores ?? 0}
                icon={Store}
                delta={stats?.trends?.stores?.delta}
                trend={stats?.trends?.stores?.series}
              />
              <StatCard
                label="Total ratings"
                value={stats?.totalRatings ?? 0}
                icon={Star}
                delta={stats?.trends?.ratings?.delta}
                trend={stats?.trends?.ratings?.series}
                emphasis
              />
              <StatCard
                label="Store Owners"
                value={stats?.roleBreakdown?.OWNER ?? 0}
                icon={Building2}
              />
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card-flat p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-section-title text-ink-800">Recent activity</h2>
              <Link to="/admin/users" className="text-caption font-semibold text-secondary-600 hover:text-secondary-700">
                View all activity →
              </Link>
            </div>
            {loading ? (
              <ActivityRowSkeleton />
            ) : stats?.recentRatings?.length ? (
              <ul className="mt-4 space-y-1">
                {stats.recentRatings.map((r, i) => (
                  <li
                    key={i}
                    className="-mx-2 flex items-start gap-3 rounded-input px-2 py-2.5 transition-colors hover:bg-ink-50"
                  >
                    <div className="relative flex flex-col items-center">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-semibold text-secondary-700">
                        {r.userName?.trim().charAt(0).toUpperCase() || '?'}
                      </span>
                      {i < stats.recentRatings.length - 1 && (
                        <span className="mt-1 h-full w-px flex-1 bg-ink-100" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-2">
                      <p className="truncate text-body text-ink-800">
                        <span className="font-medium">{r.userName}</span> rated{' '}
                        <span className="font-medium">{r.storeName}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating value={r.rating} readOnly size={13} />
                        <span className="text-caption text-ink-400" title={formatDateTime(r.ratedAt)}>
                          {timeAgo(r.ratedAt)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-body text-ink-500">No ratings have been submitted yet.</p>
            )}
          </div>

          <div className="card-flat p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-section-title text-ink-800">Top-rated stores</h2>
              <Link to="/admin/stores" className="text-caption font-semibold text-secondary-600 hover:text-secondary-700">
                View all →
              </Link>
            </div>
            {loading ? (
              <BarRowSkeleton />
            ) : stats?.topStores?.length ? (
              <ul className="mt-4 space-y-4">
                {stats.topStores.map((s, i) => {
                  const pct = Math.round((s.averageRating / 5) * 100);
                  const tileColor = TILE_COLORS[s.id % TILE_COLORS.length];
                  return (
                    <li key={s.id} className="-mx-2 flex items-center gap-3 rounded-input px-2 py-1.5 transition-colors hover:bg-ink-50">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-caption font-semibold text-ink-600">
                        {i + 1}
                      </span>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${tileColor}`}>
                        {s.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-body font-medium text-ink-800" title={s.name}>
                            {s.name}
                          </span>
                          <span className="num shrink-0 text-caption text-ink-500">
                            {s.averageRating} · {s.totalRatings} review{s.totalRatings === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                            className="h-full rounded-full bg-accent-400"
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-body text-ink-500">Not enough ratings yet to rank stores.</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="card-flat p-6">
            <h2 className="text-section-title text-ink-800">User composition</h2>
            {loading ? (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="mx-auto h-40 w-40 rounded-full bg-ink-100" />
              </div>
            ) : roleTotal > 0 ? (
              <div className="mt-2 h-44 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rolePieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {rolePieData.map((entry) => (
                        <Cell key={entry.role} fill={ROLE_COLOR[entry.role]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-caption text-ink-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-body text-ink-500">No users yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
