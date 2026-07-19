import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { changePassword } from '../api/auth';
import FormField from '../components/FormField';
import PageBackground from '../components/PageBackground';
import PasswordStrength from '../components/PasswordStrength';
import { validatePassword, extractApiFieldErrors, extractApiMessage } from '../utils/validators';

const initialForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePassword() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Current password is required';
    const pwErr = validatePassword(form.newPassword);
    if (pwErr) next.newPassword = pwErr;
    if (!next.newPassword && form.newPassword !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully');
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      const fieldErrors = extractApiFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        toast.error(extractApiMessage(err, 'Could not update password'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="lavender" />

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-page-title text-ink-900">Change password</h1>
      <p className="mt-1 text-body text-ink-500">Update the password used to sign in to your account.</p>

      <motion.form
        onSubmit={handleSubmit}
        noValidate
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card mt-6 space-y-4 p-6"
      >
        <FormField label="Current password" id="currentPassword" error={errors.currentPassword}>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
              value={form.currentPassword}
              onChange={update('currentPassword')}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
            </button>
          </div>
        </FormField>

        <FormField label="New password" id="newPassword" error={errors.newPassword}>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
              value={form.newPassword}
              onChange={update('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
            </button>
          </div>
          <PasswordStrength value={form.newPassword} />
        </FormField>

        <FormField label="Confirm new password" id="confirmPassword" error={errors.confirmPassword}>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
          />
        </FormField>

        <div className="pt-2">
          <button type="submit" disabled={submitting} className="btn-accent w-full max-sm:h-12 sm:w-auto">
            {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </motion.form>
      </div>
    </div>
  );
}
