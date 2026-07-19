import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown, LogOut, Store, UserPlus, Star, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_RING = {
  ADMIN: 'ring-ink-900',
  OWNER: 'ring-accent-500',
  USER: 'ring-secondary-400',
};

const ROLE_LABEL = { ADMIN: 'Admin', OWNER: 'Store Owner', USER: 'Normal User' };

const NOTIFICATIONS_BY_ROLE = {
  ADMIN: [
    { icon: Store, text: 'A new store was just registered on the platform.', time: '2h ago' },
    { icon: UserPlus, text: 'Several new users joined this week.', time: '1d ago' },
  ],
  OWNER: [
    { icon: Star, text: 'You received a new rating on your store.', time: '3h ago' },
    { icon: Star, text: 'Someone left a review on your store.', time: '1d ago' },
  ],
  USER: [
    { icon: PartyPopper, text: 'Welcome to StoreRank! Start rating stores near you.', time: 'Just now' },
  ],
};

export default function Navbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const notifications = (user && NOTIFICATIONS_BY_ROLE[user.role]) || [];

  useEffect(() => {
    if (!menuOpen && !notifOpen) return undefined;
    const onClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, notifOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/90 px-4 shadow-[0_1px_0_rgba(17,24,39,0.02)] backdrop-blur sm:h-[72px] sm:px-6">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-input text-ink-600 hover:bg-ink-100 md:hidden"
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-input text-ink-500 hover:bg-ink-100 hover:text-ink-800"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2} />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-500" />
            )}
          </button>

          {notifOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-30 w-72 overflow-hidden rounded-input border border-ink-200 bg-white shadow-dropdown"
            >
              <div className="border-b border-ink-100 px-3.5 py-3">
                <p className="text-sm font-semibold text-ink-900">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <p className="px-3.5 py-4 text-caption text-ink-400">You're all caught up.</p>
              ) : (
                <ul>
                  {notifications.map((n, i) => {
                    const Icon = n.icon;
                    return (
                      <li key={i} className="flex items-start gap-2.5 border-b border-ink-100 px-3.5 py-3 last:border-0">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-secondary-600">
                          <Icon size={15} strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-caption text-ink-700">{n.text}</p>
                          <p className="mt-0.5 text-caption text-ink-400">{n.time}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
                setNotifOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-input border-l border-ink-100 py-1.5 pl-3 pr-1.5 hover:bg-ink-50"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-700 ring-2 ring-offset-1 ring-offset-white ${
                  ROLE_RING[user.role] || 'ring-ink-200'
                }`}
              >
                {user.name?.trim().charAt(0).toUpperCase() || '?'}
              </div>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[160px] truncate text-sm font-semibold text-ink-900">
                  {user.name}
                </span>
                <span className="block text-caption text-ink-400">{ROLE_LABEL[user.role]}</span>
              </span>
              <ChevronDown size={15} strokeWidth={2} className="hidden text-ink-400 sm:block" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-input border border-ink-200 bg-white shadow-dropdown"
              >
                <div className="border-b border-ink-100 px-3.5 py-3">
                  <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="truncate text-caption text-ink-400">{ROLE_LABEL[user.role]}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-danger-600 hover:bg-danger-50"
                >
                  <LogOut size={16} strokeWidth={2} />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
