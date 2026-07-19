export function validateName(value) {
  const v = (value || '').trim();
  if (!v) return 'Name is required';
  if (v.length < 20 || v.length > 60) return 'Name must be between 20 and 60 characters';
  return '';
}

export function validateEmail(value) {
  const v = (value || '').trim();
  if (!v) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(v)) return 'Enter a valid email address';
  return '';
}

export function validateAddress(value) {
  const v = (value || '').trim();
  if (!v) return 'Address is required';
  if (v.length > 400) return 'Address must be at most 400 characters';
  return '';
}

export function validatePassword(value) {
  const v = value || '';
  if (!v) return 'Password is required';
  if (v.length < 8 || v.length > 16) return 'Password must be between 8 and 16 characters';
  if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(v)) return 'Password must contain at least one special character';
  return '';
}

export function extractApiFieldErrors(error) {
  return error?.response?.data?.errors || null;
}

export function extractApiMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || fallback;
}
