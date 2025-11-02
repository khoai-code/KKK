import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database.types';
import { getSupabaseUrl, getSupabaseAnonKey } from './config';

export const createServerClient = async () => {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
