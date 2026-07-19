import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/PageBackground';

const ROLE_RING = {
  ADMIN: 'ring-ink-900',
  OWNER: 'ring-accent-500',
  USER: 'ring-secondary-400',
};

const ROLE_LABEL = { ADMIN: 'Administrator', OWNER: 'Store Owner', USER: 'Normal User' };

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="lavender" />

      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <p className="label-micro">Account</p>
        <h1 className="mt-1 text-page-title text-ink-900">Profile</h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card mt-6 p-6"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xl font-semibold text-accent-700 ring-2 ring-offset-2 ring-offset-white ${
                ROLE_RING[user.role] || 'ring-ink-200'
              }`}
            >
              {user.name?.trim().charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-section-title text-ink-900">{user.name}</p>
              <p className="text-caption text-ink-400">{ROLE_LABEL[user.role] || user.role}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-ink-100 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-input bg-ink-50 text-ink-500">
                <Mail size={16} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-caption text-ink-400">Email</p>
                <p className="truncate text-body text-ink-800">{user.email}</p>
              </div>
            </div>

            {user.address && (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-input bg-ink-50 text-ink-500">
                  <MapPin size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-caption text-ink-400">Address</p>
                  <p className="truncate text-body text-ink-800">{user.address}</p>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/change-password"
            className="btn-secondary mt-6 w-full max-sm:h-12 sm:w-auto"
          >
            <KeyRound size={16} strokeWidth={2} />
            Change password
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
