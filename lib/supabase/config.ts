/**
 * Supabase configuration with environment variable sanitization
 *
 * This helper ensures that environment variables are properly cleaned
 * by removing any whitespace, newlines, or other invalid characters
 * that might have been accidentally introduced during configuration.
 */

export const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url.trim();
};

export const getSupabaseAnonKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  // Remove any whitespace, newlines, or carriage returns
  return key.replace(/[\s\n\r]/g, '');
};

export const getSupabaseServiceRoleKey = (): string => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  // Remove any whitespace, newlines, or carriage returns
  return key.replace(/[\s\n\r]/g, '');
};
