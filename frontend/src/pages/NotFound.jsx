import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import PageBackground from '../components/PageBackground';

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden">
      <PageBackground variant="lavender" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-secondary-500 shadow-card">
          <Compass size={24} strokeWidth={1.75} />
        </div>
        <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-accent-600">404</p>
        <h1 className="mt-2 text-page-title text-ink-900">Page not found</h1>
        <p className="mt-2 max-w-sm text-body text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link to="/" className="btn-accent mt-6">
          Go home
        </Link>
      </motion.div>
    </div>
  );
}
