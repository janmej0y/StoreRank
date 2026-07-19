import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TABS_BY_ROLE = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/change-password', label: 'Settings', icon: Settings },
  ],
  USER: [
    { to: '/stores', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/change-password', label: 'Settings', icon: Settings },
  ],
  OWNER: [
    { to: '/owner', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/change-password', label: 'Settings', icon: Settings },
  ],
};

export default function BottomNav({ hidden }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || hidden) return null;
  const tabs = TABS_BY_ROLE[user.role] || [];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-around gap-1 rounded-card border border-ink-100 bg-white/90 px-2 py-2 shadow-dropdown backdrop-blur-lg md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((tab, i) => {
        const active = tab.end ? location.pathname === tab.to : location.pathname.startsWith(tab.to);
        const Icon = tab.icon;
        return (
          <NavLink
            key={`${tab.to}-${tab.label}-${i}`}
            to={tab.to}
            className="flex min-w-[44px] flex-1 flex-col items-center gap-0.5 rounded-input py-1.5 text-caption font-medium"
          >
            <Icon size={20} strokeWidth={2} className={active ? 'text-blue-600' : 'text-ink-400'} />
            <span className={active ? 'text-blue-600' : 'text-ink-400'}>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
