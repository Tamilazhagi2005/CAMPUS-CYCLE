export const COLLEGE_EMAIL_DOMAINS = ['@sonatech.ac.in'];

export const normalizeEmail = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

export const isCollegeEmail = (email) => {
  const normalized = normalizeEmail(email);
  return COLLEGE_EMAIL_DOMAINS.some((domain) => normalized.endsWith(domain));
};

export const createActionCodeSettings = () => ({
  url: 'https://revoxa.netlify.app/verify-email',
  handleCodeInApp: false,
});

export const getAuthErrorMessage = (error) => {
  if (!error || !error.code) {
    return 'An unexpected error occurred. Please try again.';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in instead.';
    case 'auth/invalid-email':
      return 'The email address is invalid. Please use your official college email.';
    case 'auth/weak-password':
      return 'Your password is too weak. Use at least 8 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with that email. Please sign up first.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support if this is an error.';
    default:
      return error.message || 'Authentication failed. Please try again later.';
  }
};
