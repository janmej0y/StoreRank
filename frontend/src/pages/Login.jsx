import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck, Star, StoreIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import AuthSidePanel from '../components/AuthSidePanel';
import { validateEmail } from '../utils/validators';
import { extractApiFieldErrors, extractApiMessage } from '../utils/validators';
import { roleHome } from '../components/ProtectedRoute';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) next.email = emailErr;
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const performLogin = async (email, password) => {
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      const redirectTo = location.state?.from || roleHome[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const fieldErrors = extractApiFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        toast.error(extractApiMessage(err, 'Invalid email or password'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await performLogin(form.email.trim(), form.password);
  };

  const handleDemoLogin = (email, password) => {
    setForm({ email, password });
    setErrors({});
    performLogin(email, password);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast("Password reset isn't available yet — contact an administrator.", { icon: '🔒' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-screen overflow-hidden bg-white md:h-screen"
    >
      <AuthSidePanel />

      <div
        className="flex w-full flex-1 flex-col items-center overflow-y-auto px-4 py-6 sm:justify-center sm:px-8 md:py-6"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(109,93,246,0.06), transparent 45%), #ffffff',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex w-full max-w-[460px] shrink-0 items-center gap-2.5 md:hidden"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-500 shadow-card">
            <Star size={17} strokeWidth={2.25} fill="white" className="text-white" />
          </span>
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight text-ink-900">StoreRank</p>
            <p className="text-caption text-ink-500">Ratings you can trust, from people who visited.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: 'easeOut' }}
          className="w-full max-w-[460px] shrink-0 rounded-card border border-ink-200 bg-white p-5 shadow-card sm:p-9"
        >
          <h1 className="text-xl font-bold leading-tight text-ink-900 sm:text-[1.75rem]">Welcome back! 👋</h1>
          <p className="mt-1 text-body text-ink-500">Sign in to your account</p>

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3.5 sm:mt-6 sm:space-y-[18px]">
            <FormField label="Email address" id="email" error={errors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input h-[46px] ${errors.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
              />
            </FormField>

            <FormField label="Password" id="password" error={errors.password}>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input h-[46px] pr-10 ${errors.password ? 'input-error' : ''}`}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-caption text-ink-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-secondary-500 focus:ring-secondary-400"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-caption font-medium text-secondary-600 hover:text-secondary-700"
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-btn bg-secondary-500 text-sm font-semibold text-white shadow-button transition-colors hover:bg-secondary-600 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
              {submitting ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-ink-200" />
              <span className="text-caption text-ink-400">Or continue with recruiter demo</span>
              <div className="h-px flex-1 bg-ink-200" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoLogin('admin@storerank.com', 'Admin@1234')}
                className="flex h-11 items-center justify-center gap-1.5 rounded-btn border border-ink-200 bg-white px-2 text-[13px] font-medium text-ink-700 transition-colors hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[44px] sm:gap-2 sm:text-sm"
              >
                <ShieldCheck size={16} strokeWidth={2} className="shrink-0" />
                <span className="truncate">Admin Login</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoLogin('owner1@storerank.com', 'Owner@1234')}
                className="flex h-11 items-center justify-center gap-1.5 rounded-btn border border-ink-200 bg-white px-2 text-[13px] font-medium text-ink-700 transition-colors hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[44px] sm:gap-2 sm:text-sm"
              >
                <StoreIcon size={16} strokeWidth={2} className="shrink-0" />
                <span className="truncate sm:hidden">Owner Login</span>
                <span className="hidden truncate sm:inline">Store Owner Login</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-body text-ink-500 sm:mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-secondary-600 hover:text-secondary-700">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
