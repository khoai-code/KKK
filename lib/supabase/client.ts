import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/types/database.types';
import { getSupabaseUrl, getSupabaseAnonKey } from './config';

export const createClient = () => {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  );
};
