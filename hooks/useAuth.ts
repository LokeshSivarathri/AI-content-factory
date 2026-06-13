import { useAuth as useAuthFromContext } from '@/lib/supabase/AuthContext';

/**
 * Hook to access the current authentication state and actions.
 */
export const useAuth = useAuthFromContext;
