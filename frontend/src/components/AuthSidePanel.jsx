import { Star, ShieldCheck, Link2, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthIllustration from './AuthIllustration';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    text: 'for admins, store owners, and shoppers',
  },
  {
    icon: Link2,
    title: 'Live aggregate ratings',
    text: 'computed from real submissions',
  },
  {
    icon: Database,
    title: 'Built with Express, PostgreSQL, and React',
    text: '',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function AuthSidePanel() {
  return (
    <div className="relative hidden h-screen flex-col overflow-hidden bg-gradient-to-b from-white via-secondary-50 to-secondary-100 px-10 py-8 md:flex md:w-[45%]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary-200 opacity-40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-1/3 h-56 w-56 rounded-full bg-accent-200 opacity-30 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex shrink-0 items-center gap-2.5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-500 shadow-card">
          <Star size={17} strokeWidth={2.25} fill="white" className="text-white" />
        </span>
        <span className="text-lg font-bold tracking-tight text-ink-900">StoreRank</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="relative z-10 shrink-0"
        style={{ marginTop: 32 }}
      >
        <h1 className="text-[2.15rem] font-extrabold leading-[1.1] tracking-tight text-ink-900">
          Ratings you can <span className="text-secondary-500">trust,</span>
          <br />
          from people who <span className="text-accent-500">visited.</span>
        </h1>
        <p className="max-w-[28rem] text-base text-ink-500" style={{ marginTop: 20 }}>
          A platform for browsing stores, submitting honest ratings, and giving admins and owners a clear
          picture of how each location is performing.
        </p>

        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
          style={{ marginTop: 28 }}
        >
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <motion.li key={title} variants={item} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-white text-secondary-600 shadow-card">
                <Icon size={17} strokeWidth={2} />
              </span>
              <p className="pt-1.5 text-sm text-ink-700">
                <span className="font-semibold text-ink-900">{title}</span>
                {text && <> {text}</>}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="relative z-10 mt-auto flex min-h-0 flex-1 items-end justify-start pt-6"
      >
        <div className="w-full max-w-[420px]" style={{ height: 'min(310px, 100%)' }}>
          <AuthIllustration />
        </div>
      </motion.div>
    </div>
  );
}
