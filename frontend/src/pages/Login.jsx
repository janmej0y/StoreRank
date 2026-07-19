import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Star, StoreIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import AuthSidePanel from '../components/AuthSidePanel';
import AuthIllustration from '../components/AuthIllustration';
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
      className="min-h-screen overflow-y-auto bg-white md:flex md:h-screen md:overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at top right, rgba(109,93,246,0.14), transparent 55%), ' +
          'linear-gradient(180deg, #f4f2ff 0%, #fdf8f2 100%)',
      }}
    >
      <AuthSidePanel />

      {/* Mobile hero — logo, headline, illustration. Hidden md:up, where AuthSidePanel takes over. */}
      <div className="px-5 pt-8 md:hidden">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-secondary-500 shadow-card">
            <Star size={20} strokeWidth={2.25} fill="white" className="text-white" />
          </span>
          <p className="text-xl font-bold leading-tight tracking-tight text-ink-900">
            Store<span className="text-secondary-500">Rank</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mt-6"
        >
          <h1 className="text-2xl font-extrabold leading-tight text-ink-900">Welcome back! 👋</h1>
          <p className="mt-1.5 max-w-[80%] text-body text-ink-500">
            Sign in to continue discovering and rating amazing stores.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mx-auto -mb-4 mt-2 h-40 w-full max-w-[280px]"
        >
          <AuthIllustration />
        </motion.div>
      </div>

      {/* Desktop/tablet form column */}
      <div className="hidden w-full flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-8 md:flex md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: 'easeOut' }}
          className="w-full max-w-[460px] rounded-card border border-ink-200 bg-white p-9 shadow-card"
        >
          <h1 className="text-[1.75rem] font-bold leading-tight text-ink-900">Welcome back! 👋</h1>
          <p className="mt-1 text-body text-ink-500">Sign in to your account</p>

          <LoginForm
            form={form}
            errors={errors}
            update={update}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            handleForgotPassword={handleForgotPassword}
            handleSubmit={handleSubmit}
            submitting={submitting}
          />

          <DemoButtons submitting={submitting} onDemoLogin={handleDemoLogin} />

          <p className="mt-6 text-center text-body text-ink-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-secondary-600 hover:text-secondary-700">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Mobile form sheet */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
        className="relative z-10 mt-2 rounded-t-modal bg-white px-5 pb-8 pt-7 shadow-card md:hidden"
      >
        <LoginForm
          form={form}
          errors={errors}
          update={update}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          handleForgotPassword={handleForgotPassword}
          handleSubmit={handleSubmit}
          submitting={submitting}
          mobile
        />

        <DemoButtons submitting={submitting} onDemoLogin={handleDemoLogin} />

        <p className="mt-6 text-center text-body text-ink-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-secondary-600 hover:text-secondary-700">
            Create one
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

function LoginForm({
  form,
  errors,
  update,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  handleForgotPassword,
  handleSubmit,
  submitting,
  mobile = false,
}) {
  const fieldHeight = mobile ? 'h-14' : 'h-[46px]';

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4 md:space-y-[18px]">
      <FormField label="Email address" id="email" error={errors.email}>
        <div className="relative">
          {mobile && (
            <span className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-input bg-secondary-50 text-secondary-500">
              <Mail size={16} strokeWidth={2} />
            </span>
          )}
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${fieldHeight} ${mobile ? 'pl-12' : ''} ${errors.email ? 'input-error' : ''}`}
            value={form.email}
            onChange={update('email')}
            placeholder={mobile ? 'Enter your email' : 'you@example.com'}
          />
        </div>
      </FormField>

      <FormField label="Password" id="password" error={errors.password}>
        <div className="relative">
          {mobile && (
            <span className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-input bg-secondary-50 text-secondary-500">
              <Lock size={16} strokeWidth={2} />
            </span>
          )}
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`input ${fieldHeight} pr-10 ${mobile ? 'pl-12' : ''} ${errors.password ? 'input-error' : ''}`}
            value={form.password}
            onChange={update('password')}
            placeholder={mobile ? 'Enter your password' : '••••••••'}
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
        className={`relative flex ${fieldHeight} w-full items-center justify-center rounded-btn bg-gradient-to-r from-secondary-500 to-secondary-600 text-sm font-semibold text-white shadow-button transition-colors hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} strokeWidth={2} className="animate-spin" />
            Signing in…
          </span>
        ) : (
          <>
            <span>{mobile ? 'Sign In' : 'Sign in'}</span>
            {mobile && (
              <span className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <ArrowRight size={16} strokeWidth={2.25} />
              </span>
            )}
          </>
        )}
      </motion.button>
    </form>
  );
}

function DemoButtons({ submitting, onDemoLogin }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200" />
        <span className="text-caption text-ink-400">Or continue with recruiter demo</span>
        <div className="h-px flex-1 bg-ink-200" />
      </div>
      <div className="mt-4 space-y-2.5">
        <button
          type="button"
          disabled={submitting}
          onClick={() => onDemoLogin('admin@storerank.com', 'Admin@1234')}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-btn border border-ink-200 bg-white text-sm font-semibold text-ink-800 transition-colors hover:border-secondary-300 hover:bg-secondary-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShieldCheck size={17} strokeWidth={2} className="shrink-0 text-secondary-500" />
          Continue as Admin
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => onDemoLogin('owner1@storerank.com', 'Owner@1234')}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-btn border border-ink-200 bg-white text-sm font-semibold text-ink-800 transition-colors hover:border-secondary-300 hover:bg-secondary-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <StoreIcon size={17} strokeWidth={2} className="shrink-0 text-accent-500" />
          Continue as Store Owner
        </button>
      </div>
    </div>
  );
}
