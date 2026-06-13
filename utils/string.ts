/**
 * Extract the first two characters of the email prefix to serve as user initials.
 * Example: test@example.com -> TE
 */
export const getInitials = (email: string): string => {
  if (!email) return 'U';
  return email.split('@')[0].slice(0, 2).toUpperCase();
};
