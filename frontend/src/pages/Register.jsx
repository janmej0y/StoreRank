import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import AuthSidePanel from '../components/AuthSidePanel';
import PasswordStrength from '../components/PasswordStrength';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  extractApiFieldErrors,
  extractApiMessage,
} from '../utils/validators';
import { roleHome } from '../components/ProtectedRoute';

const initialForm = { name: '', email: '', address: '', password: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    Object.keys(next).forEach((k) => {
      if (!next[k]) delete next[k];
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
      });
      toast.success('Account created — welcome to StoreRank');
      navigate(roleHome[user.role] || '/', { replace: true });
    } catch (err) {
      const fieldErrors = extractApiFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        toast.error(extractApiMessage(err, 'Could not create your account'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthSidePanel />

      <div
        className="flex flex-1 items-center justify-center px-4 py-10"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(109,93,246,0.06), transparent 45%), #ffffff',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-6">
            <h1 className="text-page-title text-ink-900">Create your account</h1>
            <p className="mt-1 text-body text-ink-500">Start rating stores you trust</p>
          </div>

          <div className="card-flat p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FormField label="Full name" id="name" error={errors.name} hint="20–60 characters">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Enter your full name"
                />
              </FormField>

              <FormField label="Email address" id="email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                />
              </FormField>

              <FormField label="Address" id="address" error={errors.address} hint="Up to 400 characters">
                <textarea
                  id="address"
                  rows={3}
                  className={`input resize-none ${errors.address ? 'input-error' : ''}`}
                  value={form.address}
                  onChange={update('address')}
                  placeholder="Street, city, state, ZIP"
                />
              </FormField>

              <FormField label="Password" id="password" error={errors.password}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
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
                <PasswordStrength value={form.password} />
              </FormField>

              <button type="submit" disabled={submitting} className="btn-accent w-full max-sm:h-12">
                {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-body text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-600 hover:text-accent-700">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
