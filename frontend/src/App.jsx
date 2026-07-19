import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ProtectedRoute, { roleHome } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import UserStores from './pages/UserStores';
import StoreDetail from './pages/StoreDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStores from './pages/admin/AdminStores';

import OwnerDashboard from './pages/owner/OwnerDashboard';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || '/login'} replace />;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={roleHome[user.role] || '/'} replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/stores" element={<UserStores />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/stores" element={<AdminStores />} />
            <Route path="/admin/stores/:id" element={<StoreDetail />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-ink-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontSize: '0.875rem',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              borderLeft: '3px solid #e5e7eb',
              boxShadow: '0 12px 24px -6px rgba(17,24,39,0.14), 0 4px 8px -4px rgba(17,24,39,0.08)',
            },
            success: {
              iconTheme: { primary: '#f97316', secondary: '#fff' },
              style: { borderLeftColor: '#22c55e' },
            },
            error: {
              style: { borderLeftColor: '#ef4444' },
            },
          }}
        />

        {user ? (
          <>
            <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
            <div className="md:pl-64">
              <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
              <main className="pb-24 md:pb-0">
                <AnimatedRoutes />
              </main>
            </div>
            <BottomNav hidden={mobileMenuOpen} />
          </>
        ) : (
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </MotionConfig>
  );
}
