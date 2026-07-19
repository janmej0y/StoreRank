import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Store, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Wordmark from './Wordmark';

const linksByRole = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/stores', label: 'Stores', icon: Store },
  ],
  USER: [{ to: '/stores', label: 'Stores', end: true, icon: Store }],
  OWNER: [{ to: '/owner', label: 'Dashboard', end: true, icon: LayoutDashboard }],
};

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const location = useLocation();

  const links = user ? linksByRole[user.role] || [] : [];

  const isLinkActive = (link) =>
    link.end ? location.pathname === link.to : location.pathname.startsWith(link.to);

  const navItems = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((link) => {
        const active = isLinkActive(link);
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onCloseMobile}
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          >
            {active && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 rounded-xl bg-blue-50"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-3 ${active ? 'text-blue-600' : 'text-ink-500'}`}>
              <Icon size={18} strokeWidth={2} />
              {link.label}
            </span>
          </NavLink>
        );
      })}
      <NavLink
        to="/change-password"
        onClick={onCloseMobile}
        className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
      >
        {location.pathname === '/change-password' && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 rounded-xl bg-blue-50"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <span
          className={`relative z-10 flex items-center gap-3 ${
            location.pathname === '/change-password' ? 'text-blue-600' : 'text-ink-500'
          }`}
        >
          <KeyRound size={18} strokeWidth={2} />
          Password
        </span>
      </NavLink>
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-200 bg-white md:flex">
        <div className="flex h-16 items-center px-5">
          <Wordmark />
        </div>
        {navItems}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={onCloseMobile} aria-hidden="true" />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-dropdown"
          >
            <div className="flex h-16 items-center px-5">
              <Wordmark />
            </div>
            {navItems}
          </motion.aside>
        </div>
      )}
    </>
  );
}
