import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_RING = {
  ADMIN: 'ring-ink-900',
  OWNER: 'ring-accent-500',
  USER: 'ring-secondary-400',
};

const ROLE_LABEL = { ADMIN: 'Admin', OWNER: 'Store Owner', USER: 'Normal User' };

export default function Navbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

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
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-input text-ink-500 hover:bg-ink-100 hover:text-ink-800"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-500" />
        </button>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
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
